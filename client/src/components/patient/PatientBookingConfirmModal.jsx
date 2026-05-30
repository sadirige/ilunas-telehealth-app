const PatientBookingConfirmModal = ({
  selectedSlot,
  bookingForm,
  submitting,
  onClose,
  onSubmit,
  onChange
}) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const dateStr = isToday ? 'Today' : date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${dateStr} at ${timeStr}`;
  };

  const duration = Math.round((new Date(selectedSlot.slot.endAt) - new Date(selectedSlot.slot.startAt)) / 60000);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div className="modal modal--booking">
        <div className="modal__header">
          <div>
            <h3 id="booking-modal-title">Confirm your appointment</h3>
            <p>Review the details below before confirming</p>
          </div>
          <button type="button" className="ghost ghost--compact" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="booking-summary">
          <div className="booking-summary__section">
            <h4>Doctor</h4>
            <p className="booking-summary__value">{selectedSlot.doctor.name}</p>
            <p className="booking-summary__meta">{selectedSlot.doctor.specialization}</p>
          </div>

          <div className="booking-summary__section">
            <h4>Date & time</h4>
            <p className="booking-summary__value">{formatDateTime(selectedSlot.slot.startAt)}</p>
            <p className="booking-summary__meta">Duration: {duration} minutes</p>
          </div>

          <div className="booking-summary__section">
            <h4>Consultation fee</h4>
            <p className="booking-summary__value">
              {selectedSlot.doctor.consultationFee ? `₱${selectedSlot.doctor.consultationFee}` : 'Fee TBD'}
            </p>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            Duration preference
            <select
              name="durationMinutes"
              value={bookingForm.durationMinutes}
              onChange={onChange}
              required
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>
          <label className="field">
            Reason for visit <span className="field__required">*</span>
            <textarea
              name="reason"
              rows="3"
              value={bookingForm.reason}
              onChange={onChange}
              placeholder="Please describe your symptoms or reason for consultation"
              required
            />
          </label>
          <div className="modal__actions">
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Confirming...' : 'Confirm booking'}
            </button>
            <button type="button" className="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientBookingConfirmModal;
