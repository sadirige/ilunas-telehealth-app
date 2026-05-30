import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';
import SkeletonLoader from '../ui/SkeletonLoader';

const PatientAppointmentsPanel = ({
  appointmentsStatus,
  bookingStatus,
  actionStatus,
  hasSelection,
  selectedSlot,
  loadingAppointments,
  filteredAppointments,
  appointmentStatusFilter,
  appointmentTimeFilter,
  doctorNameMap,
  rescheduleId,
  rescheduleAt,
  actionLoading,
  buildReminderLabel,
  onStatusFilterChange,
  onTimeFilterChange,
  onOpenConfirm,
  onClearSelection,
  onStartReschedule,
  onCancelAppointment,
  onFetchMeeting,
  onRescheduleChange,
  onRescheduleSubmit,
  onCancelReschedule,
  onNavigateToDoctors
}) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    let dateStr;
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <section className="panel">
      {appointmentsStatus.type === 'error' && (
        <div className="alert alert--error" role="status">
          {appointmentsStatus.message}
        </div>
      )}

      {bookingStatus.type !== 'idle' && (
        <div className={`alert alert--${bookingStatus.type}`} role="status">
          {bookingStatus.message}
        </div>
      )}

      {actionStatus.type !== 'idle' && (
        <div className={`alert alert--${actionStatus.type}`} role="status">
          {actionStatus.message}
        </div>
      )}

      {hasSelection ? (
        <div className="booking booking--highlight">
          <div className="booking__summary">
            <div className="booking__details">
              <h3>{selectedSlot.doctor.name}</h3>
              <p className="booking__meta">
                {selectedSlot.doctor.specialization} · {formatDateTime(selectedSlot.slot.startAt)}
              </p>
            </div>
            <div className="booking__actions">
              <span className="pill pill--accent">Selected slot</span>
              <button type="button" className="primary primary--compact" onClick={onOpenConfirm}>
                Review & confirm
              </button>
              <button type="button" className="ghost ghost--compact" onClick={onClearSelection}>
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="hint">Choose a time slot from a doctor to start booking.</p>
      )}

      <div className="panel panel--nested">
        <div className="section__header">
          <div>
            <h3>Your appointments</h3>
            <p>View and manage your scheduled consultations.</p>
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

        {loadingAppointments ? (
          <SkeletonLoader variant="list-item" count={3} />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title="No appointments yet"
            description="Find a doctor and book a time slot to schedule your first consultation."
            action={
              <button type="button" className="primary" onClick={onNavigateToDoctors}>
                Find doctors
              </button>
            }
          />
        ) : (
          <div className="appointment__list">
            {filteredAppointments.map((appointment) => {
              const isRescheduling = rescheduleId === appointment.id;
              const meetingUrl = appointment.meetingUrl;
              const reminderLabel = buildReminderLabel(appointment);

              return (
                <div key={appointment.id} className="appointment__item">
                  <div className="appointment__main">
                    <div className="appointment__info">
                      <h4>{doctorNameMap.get(appointment.doctor) || 'Doctor'}</h4>
                      <p className="appointment__time">
                        {formatDateTime(appointment.scheduledAt)} · {appointment.durationMinutes} min
                      </p>
                      <div className="appointment__badges">
                        <StatusBadge status={appointment.status} />
                        {reminderLabel && (
                          <span className="pill pill--warning">{reminderLabel}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="appointment__meeting">
                      {meetingUrl ? (
                        <a
                          className="primary primary--compact appointment__join-btn"
                          href={meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Join meeting
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="ghost ghost--compact"
                          onClick={() => onFetchMeeting(appointment.id)}
                          disabled={actionLoading}
                        >
                          Get meeting link
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="appointment__actions">
                    <button
                      type="button"
                      className="ghost ghost--compact"
                      onClick={() => onStartReschedule(appointment)}
                      disabled={actionLoading || appointment.status !== 'scheduled'}
                      title="Reschedule appointment"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      className="ghost ghost--compact ghost--danger"
                      onClick={() => onCancelAppointment(appointment.id)}
                      disabled={actionLoading || appointment.status !== 'scheduled'}
                      title="Cancel appointment"
                    >
                      Cancel
                    </button>
                  </div>

                  {isRescheduling && (
                    <form className="appointment__reschedule" onSubmit={onRescheduleSubmit}>
                      <label className="field">
                        New date and time
                        <input
                          type="datetime-local"
                          value={rescheduleAt}
                          onChange={onRescheduleChange}
                          required
                        />
                      </label>
                      <div className="appointment__actions">
                        <button type="submit" className="primary" disabled={actionLoading}>
                          {actionLoading ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                          type="button"
                          className="ghost"
                          onClick={onCancelReschedule}
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PatientAppointmentsPanel;
