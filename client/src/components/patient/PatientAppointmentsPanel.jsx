import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';
import SkeletonLoader from '../ui/SkeletonLoader';
import FormField from '../ui/FormField';
import { formatSlotDateTime, getTimezoneLabel } from '../../utils/datetime';

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
  onRequestCancel,
  onFetchMeeting,
  onRescheduleChange,
  onRescheduleSubmit,
  onCancelReschedule,
  onNavigateToDoctors
}) => {
  const isUpcoming = (appointment) => {
    const scheduledAt = new Date(appointment.scheduledAt).getTime();
    return appointment.status === 'scheduled' && scheduledAt >= Date.now();
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
                {selectedSlot.doctor.specialization} ·{' '}
                {formatSlotDateTime(selectedSlot.slot.startAt)}
              </p>
            </div>
            <div className="booking__actions">
              <span className="pill pill--accent">Ready to book</span>
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
        <div className="panel panel--nested panel--hint">
          <p className="hint">
            Select a time slot from{' '}
            <button type="button" className="link-btn" onClick={onNavigateToDoctors}>
              Find doctors
            </button>{' '}
            to schedule a consultation.
          </p>
        </div>
      )}

      <div className="panel panel--nested">
        <div className="section__header">
          <div>
            <h3>Your appointments</h3>
            <p>View and manage your scheduled consultations.</p>
          </div>
          <div className="filter-row">
            <FormField label="Status">
              <select value={appointmentStatusFilter} onChange={onStatusFilterChange}>
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
                <option value="in_progress">In progress</option>
                <option value="no_show">No show</option>
              </select>
            </FormField>
            <FormField label="Time">
              <select value={appointmentTimeFilter} onChange={onTimeFilterChange}>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="all">All</option>
              </select>
            </FormField>
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
              const upcoming = isUpcoming(appointment);

              return (
                <div
                  key={appointment.id}
                  className={`appointment__item ${upcoming ? 'appointment__item--upcoming' : ''}`}
                >
                  <div className="appointment__main">
                    <div className="appointment__info">
                      <h4>{doctorNameMap.get(appointment.doctor) || 'Doctor'}</h4>
                      <p className="appointment__time">
                        {formatSlotDateTime(appointment.scheduledAt)} ·{' '}
                        {appointment.durationMinutes} min · {getTimezoneLabel()}
                      </p>
                      {appointment.reason && (
                        <p className="appointment__reason">
                          <span className="appointment__reason-label">Reason:</span>{' '}
                          {appointment.reason}
                        </p>
                      )}
                      <div className="appointment__badges">
                        <StatusBadge status={appointment.status} />
                        {reminderLabel && (
                          <span className="pill pill--warning">{reminderLabel}</span>
                        )}
                      </div>
                    </div>

                    <div className="appointment__meeting">
                      {upcoming && (
                        <div className="previsit-checklist">
                          <p className="previsit-checklist__title">Before your visit</p>
                          <ul className="previsit-checklist__list">
                            <li>Find a quiet, private space</li>
                            <li>Have your ID and medications ready</li>
                            <li>Test your camera and microphone</li>
                          </ul>
                        </div>
                      )}
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
                        upcoming && (
                          <button
                            type="button"
                            className="ghost ghost--compact"
                            onClick={() => onFetchMeeting(appointment.id)}
                            disabled={actionLoading}
                          >
                            Get meeting link
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {upcoming && (
                    <div className="appointment__actions">
                      <button
                        type="button"
                        className="ghost ghost--compact"
                        onClick={() => onStartReschedule(appointment)}
                        disabled={actionLoading}
                        title="Reschedule appointment"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        className="ghost ghost--compact ghost--danger"
                        onClick={() => onRequestCancel(appointment.id)}
                        disabled={actionLoading}
                        title="Cancel appointment"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {isRescheduling && (
                    <form className="appointment__reschedule" onSubmit={onRescheduleSubmit}>
                      <FormField
                        label="New date and time"
                        hint={`Times shown in ${getTimezoneLabel()}`}
                      >
                        <input
                          type="datetime-local"
                          value={rescheduleAt}
                          onChange={onRescheduleChange}
                          required
                        />
                      </FormField>
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
