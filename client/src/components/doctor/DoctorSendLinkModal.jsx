const DoctorSendLinkModal = ({
  appointment,
  buildEmailLink,
  buildSmsLink,
  onClose,
  onCopy
}) => (
  <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal">
      <div className="modal__header">
        <div>
          <h3>Send meeting link</h3>
          <p>Choose how you want to share the link.</p>
        </div>
        <button type="button" className="ghost ghost--compact" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="modal__actions">
        <a
          className="primary"
          href={buildEmailLink(appointment.meetingUrl)}
          target="_blank"
          rel="noreferrer"
        >
          Email
        </a>
        <a
          className="primary"
          href={buildSmsLink(appointment.meetingUrl)}
          target="_blank"
          rel="noreferrer"
        >
          SMS
        </a>
        <button type="button" className="ghost" onClick={onCopy}>
          Copy link
        </button>
      </div>
      <p className="hint">You can paste the link into any messaging app.</p>
    </div>
  </div>
);

export default DoctorSendLinkModal;
