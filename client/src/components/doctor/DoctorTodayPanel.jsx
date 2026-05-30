import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';

const DoctorTodayPanel = ({
  todayAppointments,
  canStartSession,
  onStartSession,
  onSendLink,
  onNavigateToAvailability
}) => (
  <section className="panel">
    {todayAppointments.length === 0 ? (
      <EmptyState
        title="No appointments today"
        description="Your schedule is clear. Patients can book when you add availability."
        action={
          <button type="button" className="primary" onClick={onNavigateToAvailability}>
            Set availability
          </button>
        }
      />
    ) : (
      <div className="appointment__list">
        {todayAppointments.map((appointment) => (
          <div key={appointment.id} className="appointment__item">
            <div className="appointment__details">
              <h4>Patient {appointment.patient?.slice(-6)}</h4>
              <p>
                {new Date(appointment.scheduledAt).toLocaleTimeString()} ·{' '}
                {appointment.durationMinutes} min
              </p>
              <StatusBadge status={appointment.status} />
              {appointment.meetingUrl ? (
                <a
                  className="ghost ghost--compact"
                  href={appointment.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join session
                </a>
              ) : (
                <p className="hint">Meeting link not set yet.</p>
              )}
            </div>
            <div className="appointment__actions">
              <button
                type="button"
                className="primary"
                disabled={!canStartSession(appointment)}
                onClick={() => onStartSession(appointment)}
              >
                Start session
              </button>
              <button
                type="button"
                className="ghost ghost--compact"
                onClick={() => onSendLink(appointment)}
                disabled={!appointment.meetingUrl}
              >
                Send meeting link
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default DoctorTodayPanel;
