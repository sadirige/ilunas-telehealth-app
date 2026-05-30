import { useState } from 'react';
import useModal from '../../hooks/useModal';
import FormField from '../ui/FormField';
import { formatSlotDateTime, slotDurationMinutes, getTimezoneLabel } from '../../utils/datetime';

const PatientBookingConfirmModal = ({
  selectedSlot,
  bookingForm,
  submitting,
  onClose,
  onSubmit,
  onChange
}) => {
  const { modalRef, handleBackdropClick } = useModal(true, onClose);
  const [consentChecked, setConsentChecked] = useState(false);

  const duration = slotDurationMinutes(selectedSlot.slot);

  const handleSubmit = (event) => {
    if (!consentChecked) {
      event.preventDefault();
      return;
    }
    onSubmit(event);
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="modal modal--booking" ref={modalRef}>
        <div className="modal__header">
          <div>
            <h3 id="booking-modal-title">Confirm your appointment</h3>
            <p>Review the details below before confirming your visit.</p>
          </div>
          <button type="button" className="ghost ghost--compact" onClick={onClose} aria-label="Close">
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
            <p className="booking-summary__value">{formatSlotDateTime(selectedSlot.slot.startAt, { long: true })}</p>
            <p className="booking-summary__meta">
              {duration} minutes · {getTimezoneLabel()}
            </p>
          </div>

          <div className="booking-summary__section">
            <h4>Consultation fee</h4>
            <p className="booking-summary__value">
              {selectedSlot.doctor.consultationFee
                ? `₱${selectedSlot.doctor.consultationFee}`
                : 'Fee TBD'}
            </p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <FormField
            label="Reason for visit"
            required
            hint="Briefly describe your symptoms or what you'd like to discuss"
          >
            <textarea
              name="reason"
              rows="3"
              value={bookingForm.reason}
              onChange={onChange}
              placeholder="e.g., Persistent headache for 3 days, mild fever"
              required
            />
          </FormField>

          <label className="field field--checkbox">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
              required
            />
            <span>
              I understand this is a telehealth consultation and not for medical emergencies.
              I consent to sharing my health information with this clinician for this visit.
            </span>
          </label>

          <div className="modal__actions">
            <button type="submit" className="primary" disabled={submitting || !consentChecked}>
              {submitting ? 'Confirming...' : 'Confirm booking'}
            </button>
            <button type="button" className="ghost" onClick={onClose} disabled={submitting}>
              Go back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientBookingConfirmModal;
