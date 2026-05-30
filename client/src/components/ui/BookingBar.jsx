import { formatSlotDateTime } from '../../utils/datetime';

const BookingBar = ({ selectedSlot, onConfirm, onClear, onNavigate }) => {
  if (!selectedSlot) return null;

  return (
    <div className="booking-bar" role="status" aria-live="polite">
      <div className="booking-bar__content">
        <div className="booking-bar__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className="booking-bar__details">
          <strong>{selectedSlot.doctor.name}</strong>
          <span>{formatSlotDateTime(selectedSlot.slot.startAt)}</span>
        </div>
      </div>
      <div className="booking-bar__actions">
        {onNavigate && (
          <button type="button" className="ghost ghost--compact" onClick={onNavigate}>
            View doctors
          </button>
        )}
        <button type="button" className="primary primary--compact" onClick={onConfirm}>
          Review & confirm
        </button>
        <button type="button" className="ghost ghost--compact" onClick={onClear} aria-label="Clear selection">
          Clear
        </button>
      </div>
    </div>
  );
};

export default BookingBar;
