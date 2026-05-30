const DoctorMeetingGuideModal = ({ provider, onClose }) => (
  <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal">
      <div className="modal__header">
        <div>
          <h3>Generate meeting link</h3>
          <p>
            {provider === 'google_meet'
              ? 'Create a Google Meet and paste the link.'
              : 'Create a Zoom meeting and paste the link.'}
          </p>
        </div>
        <button type="button" className="ghost ghost--compact" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="modal__actions">
        {provider === 'google_meet' && (
          <a className="primary" href="https://meet.google.com" target="_blank" rel="noreferrer">
            Open Google Meet
          </a>
        )}
        {provider === 'zoom' && (
          <a className="primary" href="https://zoom.us/start" target="_blank" rel="noreferrer">
            Open Zoom
          </a>
        )}
        <button type="button" className="ghost" onClick={onClose}>
          I will paste the link
        </button>
      </div>
      <p className="hint">
        After creating the meeting, copy the link and paste it into the “Meeting URL” field.
      </p>
    </div>
  </div>
);

export default DoctorMeetingGuideModal;
