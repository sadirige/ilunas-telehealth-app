const PatientOverviewPanel = ({
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
        <h2>Care dashboard</h2>
        <p>Your health activity at a glance.</p>
      </div>
    </div>

    <div className="dashboard__cards">
      <button
        type="button"
        className="dashboard__card dashboard__card--action"
        onClick={() => onNavigate('appointments')}
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
        onClick={() => onNavigate('records')}
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
        <button type="button" className="quick-action" onClick={() => onNavigate('doctors')}>
          <span className="quick-action__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <span className="quick-action__label">Find a doctor</span>
          <span className="quick-action__desc">Browse specialists and book a visit</span>
        </button>
        <button type="button" className="quick-action" onClick={() => onNavigate('ai')}>
          <span className="quick-action__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92L12 22" />
              <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.57 3.25 3.92" />
            </svg>
          </span>
          <span className="quick-action__label">AI recommendations</span>
          <span className="quick-action__desc">Describe symptoms for matched doctors</span>
        </button>
        <button type="button" className="quick-action" onClick={() => onNavigate('appointments')}>
          <span className="quick-action__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span className="quick-action__label">My appointments</span>
          <span className="quick-action__desc">Join visits or manage bookings</span>
        </button>
        <button type="button" className="quick-action" onClick={() => onNavigate('profile')}>
          <span className="quick-action__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="quick-action__label">Update profile</span>
          <span className="quick-action__desc">Keep your health info current</span>
        </button>
      </div>
    </div>
  </section>
);

export default PatientOverviewPanel;
