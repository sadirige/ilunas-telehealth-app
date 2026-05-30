const PatientOverviewPanel = ({
  appointmentCounts,
  recordsCount,
  notesCount,
  prescriptionsCount,
  unreadCount
}) => (
  <section className="panel">
    <div className="section__header">
      <div>
        <h2>Care dashboard</h2>
        <p>Your health activity at a glance.</p>
      </div>
    </div>
    <div className="dashboard__cards">
      <div className="dashboard__card">
        <span className="dashboard__label">Appointments</span>
        <span className="dashboard__value">{appointmentCounts.total}</span>
        <span className="dashboard__meta">{appointmentCounts.scheduled} scheduled</span>
      </div>
      <div className="dashboard__card">
        <span className="dashboard__label">Completed</span>
        <span className="dashboard__value">{appointmentCounts.completed}</span>
        <span className="dashboard__meta">{appointmentCounts.canceled} canceled</span>
      </div>
      <div className="dashboard__card">
        <span className="dashboard__label">Records</span>
        <span className="dashboard__value">{recordsCount}</span>
        <span className="dashboard__meta">Notes {notesCount}</span>
      </div>
      <div className="dashboard__card">
        <span className="dashboard__label">Prescriptions</span>
        <span className="dashboard__value">{prescriptionsCount}</span>
        <span className="dashboard__meta">Updates {unreadCount}</span>
      </div>
    </div>
  </section>
);

export default PatientOverviewPanel;
