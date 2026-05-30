import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';

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
}) => (
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
      <div className="booking">
        <div className="booking__summary">
          <div>
            <h3>{selectedSlot.doctor.name}</h3>
            <p>
              {selectedSlot.doctor.specialization} ·{' '}
              {new Date(selectedSlot.slot.startAt).toLocaleString()}
            </p>
          </div>
          <div className="booking__actions">
            <span className="pill">Selected slot</span>
            <button type="button" className="ghost ghost--compact" onClick={onOpenConfirm}>
              Review & confirm
            </button>
            <button type="button" className="ghost ghost--compact" onClick={onClearSelection}>
              Clear
            </button>
          </div>
        </div>
      </div>
    ) : (
      <p className="hint">Choose a slot from a doctor to start booking.</p>
    )}

    <div className="panel panel--nested">
      <div className="section__header">
        <div>
          <h3>Upcoming appointments</h3>
          <p>Review your most recent bookings.</p>
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
        <p className="hint">Loading appointments...</p>
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Find a doctor and book a slot to schedule your first consultation."
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
                <div>
                  <h4>{doctorNameMap.get(appointment.doctor) || 'Doctor'}</h4>
                  <p>
                    {new Date(appointment.scheduledAt).toLocaleString()} ·{' '}
                    {appointment.durationMinutes} min
                  </p>
                  <StatusBadge status={appointment.status} />
                  {reminderLabel && (
                    <span className="pill pill--warning">{reminderLabel}</span>
                  )}
                  {meetingUrl ? (
                    <a
                      className="ghost ghost--compact"
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

                <div className="appointment__actions">
                  <button
                    type="button"
                    className="ghost ghost--compact"
                    onClick={() => onStartReschedule(appointment)}
                    disabled={actionLoading || appointment.status !== 'scheduled'}
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    className="ghost ghost--compact"
                    onClick={() => onCancelAppointment(appointment.id)}
                    disabled={actionLoading || appointment.status !== 'scheduled'}
                  >
                    Cancel
                  </button>
                </div>

                {isRescheduling && (
                  <form className="appointment__reschedule" onSubmit={onRescheduleSubmit}>
                    <label className="field">
                      New time
                      <input
                        type="datetime-local"
                        value={rescheduleAt}
                        onChange={onRescheduleChange}
                        required
                      />
                    </label>
                    <div className="appointment__actions">
                      <button type="submit" className="primary" disabled={actionLoading}>
                        {actionLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={onCancelReschedule}
                        disabled={actionLoading}
                      >
                        Close
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

export default PatientAppointmentsPanel;
