const DoctorOverviewPanel = ({
  appointmentCounts,
  recordsCount,
  notesCount,
  prescriptionsCount,
  unreadCount,
  onNavigate
}) => (
  <section className="panel">
    <div className="section__header">
      <div>
        <h2>Clinic dashboard</h2>
        <p>Your practice activity at a glance.</p>
      </div>
    </div>

    <div className="dashboard__cards">
      <button
        type="button"
        className="dashboard__card dashboard__card--action"
        onClick={() => onNavigate('today')}
      >
        <span className="dashboard__label">Appointments</span>
        <span className="dashboard__value">{appointmentCounts.total}</span>
        <span className="dashboard__meta">{appointmentCounts.scheduled} scheduled</span>
      </button>
      <button
        type="button"
        className="dashboard__card dashboard__card--action"
        onClick={() => onNavigate('appointments')}
      >
        <span className="dashboard__label">Completed</span>
        <span className="dashboard__value">{appointmentCounts.completed}</span>
        <span className="dashboard__meta">{appointmentCounts.canceled} canceled</span>
      </button>
      <button
        type="button"
        className="dashboard__card dashboard__card--action"
        onClick={() => onNavigate('clinical')}
      >
        <span className="dashboard__label">Records</span>
        <span className="dashboard__value">{recordsCount}</span>
        <span className="dashboard__meta">Notes {notesCount}</span>
      </button>
      <button
        type="button"
        className="dashboard__card dashboard__card--action"
        onClick={() => onNavigate('notifications')}
      >
        <span className="dashboard__label">Prescriptions</span>
        <span className="dashboard__value">{prescriptionsCount}</span>
        <span className="dashboard__meta">{unreadCount} unread updates</span>
      </button>
    </div>

    <div className="quick-actions">
      <h3>Quick actions</h3>
      <div className="quick-actions__grid">
        <button type="button" className="quick-action" onClick={() => onNavigate('today')}>
          <span className="quick-action__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <span className="quick-action__label">Today&apos;s schedule</span>
          <span className="quick-action__desc">See upcoming patient visits</span>
        </button>
        <button type="button" className="quick-action" onClick={() => onNavigate('availability')}>
          <span className="quick-action__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span className="quick-action__label">Set availability</span>
          <span className="quick-action__desc">Open time slots for booking</span>
        </button>
        <button type="button" className="quick-action" onClick={() => onNavigate('clinical')}>
          <span className="quick-action__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <span className="quick-action__label">Clinical notes</span>
          <span className="quick-action__desc">Add notes and prescriptions</span>
        </button>
        <button type="button" className="quick-action" onClick={() => onNavigate('profile')}>
          <span className="quick-action__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="quick-action__label">Update profile</span>
          <span className="quick-action__desc">Keep your practice info current</span>
        </button>
      </div>
    </div>
  </section>
);

export default DoctorOverviewPanel;
