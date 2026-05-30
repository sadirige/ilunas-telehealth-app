import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';
import SkeletonLoader from '../ui/SkeletonLoader';

const DoctorAppointmentsPanel = ({
  filteredAppointments,
  appointmentStatusFilter,
  appointmentTimeFilter,
  appointmentStatus,
  appointmentActionStatus,
  meetingLinkStatus,
  sessionStatus,
  appointmentLoading,
  appointmentActionLoading,
  statusOptions,
  meetingProviders,
  statusDrafts,
  meetingDrafts,
  buildReminderLabel,
  canStartSession,
  generateLink,
  onStatusFilterChange,
  onTimeFilterChange,
  onStatusDraftChange,
  onMeetingDraftChange,
  onSaveStatus,
  onComplete,
  onStartSession,
  onSendLink,
  onOpenMeetingGuide,
  onSaveMeeting,
  onNavigateToAvailability
}) => (
  <section className="panel">
    <div className="section__header">
      <div>
        <h2>All appointments</h2>
        <p>Manage consultations and meeting details.</p>
      </div>
      <div className="filter-row">
        <label className="field">
          Status
          <select value={appointmentStatusFilter} onChange={onStatusFilterChange}>
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
            <option value="in_progress">In progress</option>
            <option value="no_show">No show</option>
          </select>
        </label>
        <label className="field">
          Time
          <select value={appointmentTimeFilter} onChange={onTimeFilterChange}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
    </div>

    {appointmentStatus.type === 'error' && (
      <div className="alert alert--error" role="status">
        {appointmentStatus.message}
      </div>
    )}

    {appointmentActionStatus.type !== 'idle' && (
      <div className={`alert alert--${appointmentActionStatus.type}`} role="status">
        {appointmentActionStatus.message}
      </div>
    )}

    {meetingLinkStatus.type !== 'idle' && (
      <div className={`alert alert--${meetingLinkStatus.type}`} role="status">
        {meetingLinkStatus.message}
      </div>
    )}

    {sessionStatus.type !== 'idle' && (
      <div className={`alert alert--${sessionStatus.type}`} role="status">
        {sessionStatus.message}
      </div>
    )}

    {appointmentLoading ? (
      <SkeletonLoader variant="list-item" count={3} />
    ) : filteredAppointments.length === 0 ? (
      <EmptyState
        title="No appointments yet"
        description="Appointments will appear here once patients book with you."
        action={
          onNavigateToAvailability ? (
            <button type="button" className="primary" onClick={onNavigateToAvailability}>
              Set availability
            </button>
          ) : null
        }
      />
    ) : (
      <div className="appointment__list">
        {filteredAppointments.map((appointment) => {
          const statusValue = statusDrafts[appointment.id] || appointment.status;
          const meetingDraft = meetingDrafts[appointment.id] || {};
          const patientId = appointment.patient || '';
          const reminderLabel = buildReminderLabel(appointment);

          return (
            <div key={appointment.id} className="appointment__item">
              <div className="appointment__details">
                <h4>Patient {patientId.slice(-6) || 'Unknown'}</h4>
                <p>
                  {new Date(appointment.scheduledAt).toLocaleString()} ·{' '}
                  {appointment.durationMinutes} min
                </p>
                <StatusBadge status={appointment.status} />
                {reminderLabel && (
                  <span className="pill pill--warning">{reminderLabel}</span>
                )}
                {appointment.meetingUrl && (
                  <a
                    className="ghost ghost--compact"
                    href={appointment.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open meeting
                  </a>
                )}
              </div>

              <div className="appointment__stack">
                <div className="appointment__row">
                  <label className="field">
                    Update status
                    <select
                      value={statusValue}
                      onChange={(event) =>
                        onStatusDraftChange(appointment.id, event.target.value)
                      }
                      disabled={appointment.status === 'canceled'}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="appointment__actions">
                    <button
                      type="button"
                      className="ghost ghost--compact"
                      onClick={() => onSaveStatus(appointment.id)}
                      disabled={
                        appointmentActionLoading || appointment.status === 'canceled'
                      }
                    >
                      Save status
                    </button>
                    <button
                      type="button"
                      className="ghost ghost--compact"
                      onClick={() => onComplete(appointment.id)}
                      disabled={
                        appointmentActionLoading || appointment.status !== 'scheduled'
                      }
                    >
                      Mark complete
                    </button>
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

                <div className="appointment__row">
                  <label className="field">
                    Meeting provider
                    <select
                      value={meetingDraft.meetingProvider || 'custom'}
                      onChange={(event) =>
                        onMeetingDraftChange(
                          appointment.id,
                          'meetingProvider',
                          event.target.value
                        )
                      }
                    >
                      {meetingProviders.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Meeting URL
                    <input
                      type="url"
                      value={meetingDraft.meetingUrl || ''}
                      onChange={(event) =>
                        onMeetingDraftChange(
                          appointment.id,
                          'meetingUrl',
                          event.target.value
                        )
                      }
                      placeholder="https://meet.example.com/..."
                    />
                  </label>
                  <div className="appointment__actions">
                    <button
                      type="button"
                      className="ghost ghost--compact"
                      onClick={() => {
                        const link = generateLink(
                          meetingDraft.meetingProvider || 'custom',
                          appointment.id
                        );
                        if (link) {
                          onMeetingDraftChange(appointment.id, 'meetingUrl', link);
                        }
                      }}
                      disabled={appointmentActionLoading}
                    >
                      Generate link
                    </button>
                    {['google_meet', 'zoom'].includes(meetingDraft.meetingProvider || '') && (
                      <button
                        type="button"
                        className="ghost ghost--compact"
                        onClick={() => onOpenMeetingGuide(meetingDraft.meetingProvider)}
                      >
                        Open guide
                      </button>
                    )}
                  </div>
                  <label className="field">
                    Host URL (optional)
                    <input
                      type="url"
                      value={meetingDraft.meetingHostUrl || ''}
                      onChange={(event) =>
                        onMeetingDraftChange(
                          appointment.id,
                          'meetingHostUrl',
                          event.target.value
                        )
                      }
                      placeholder="Host link"
                    />
                  </label>
                  <div className="appointment__actions">
                    <button
                      type="button"
                      className="primary"
                      onClick={() => onSaveMeeting(appointment.id)}
                      disabled={appointmentActionLoading}
                    >
                      Save meeting
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </section>
);

export default DoctorAppointmentsPanel;
