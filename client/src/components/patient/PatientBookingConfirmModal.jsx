const PatientBookingConfirmModal = ({
  selectedSlot,
  bookingForm,
  submitting,
  onClose,
  onSubmit,
  onChange
}) => (
  <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal">
      <div className="modal__header">
        <div>
          <h3>Confirm appointment</h3>
          <p>
            {selectedSlot.doctor.name} ·{' '}
            {new Date(selectedSlot.slot.startAt).toLocaleString()}
          </p>
        </div>
        <button type="button" className="ghost ghost--compact" onClick={onClose}>
          Close
        </button>
      </div>

      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          Duration
          <select
            name="durationMinutes"
            value={bookingForm.durationMinutes}
            onChange={onChange}
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
          </select>
        </label>
        <label className="field">
          Reason for visit
          <textarea
            name="reason"
            rows="3"
            value={bookingForm.reason}
            onChange={onChange}
            placeholder="Briefly describe the reason for the visit"
          />
        </label>
        <div className="modal__actions">
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Booking...' : 'Confirm booking'}
          </button>
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default PatientBookingConfirmModal;
