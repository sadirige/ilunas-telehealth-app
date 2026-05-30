import { useEffect, useMemo, useState } from 'react';
import useDoctorDiscovery from '../hooks/useDoctorDiscovery';
import useAppointmentBooking from '../hooks/useAppointmentBooking';
import { useConsultationNotes } from '../hooks/useConsultationNotes';
import useMedicalRecords from '../hooks/useMedicalRecords';
import useNotifications from '../hooks/useNotifications';
import usePatientProfileForm from '../hooks/usePatientProfileForm';
import { usePrescriptions } from '../hooks/usePrescriptions';
import useRecommendations from '../hooks/useRecommendations';
import { downloadPdf } from '../utils/export';
import '../App.css';

const PatientProfilePage = ({ onLogout }) => {
  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }, []);

  const {
    form,
    setForm,
    hasProfile,
    loading,
    saving,
    uploading,
    previewUrl,
    status,
    handleChange,
    handleSubmit,
    handleUpload
  } = usePatientProfileForm(storedUser?.displayName || '');

  const {
    doctors,
    doctorQuery,
    specializationQuery,
    doctorStatus,
    availabilityMap,
    setDoctorQuery,
    setSpecializationQuery,
    handleDoctorSearch,
    handleLoadAvailability
  } = useDoctorDiscovery();

  const {
    recommendations,
    recommendationQuery,
    recommendationStatus,
    setRecommendationQuery,
    handleRecommendation
  } = useRecommendations();

  const {
    appointments,
    appointmentsStatus,
    loadingAppointments,
    selectedSlot,
    isConfirmOpen,
    bookingForm,
    bookingStatus,
    submitting,
    hasSelection,
    actionStatus,
    actionLoading,
    rescheduleId,
    rescheduleAt,
    handleSelectSlot,
    handleClearSelection,
    handleOpenConfirm,
    handleCloseConfirm,
    handleBookingChange,
    handleBookingSubmit,
    handleStartReschedule,
    handleRescheduleChange,
    handleCancelReschedule,
    handleRescheduleSubmit,
    handleCancelAppointment,
    handleFetchMeeting
  } = useAppointmentBooking();

  const {
    notifications,
    status: notificationStatus,
    loading: notificationLoading,
    unreadCount,
    streamStatus,
    refreshNotifications,
    handleMarkRead,
    handleMarkAllRead
  } = useNotifications();

  const {
    records,
    status: recordStatus,
    loading: recordLoading
  } = useMedicalRecords('patient');

  const {
    notes,
    status: noteStatus,
    loading: noteLoading
  } = useConsultationNotes('patient');

  const {
    prescriptions,
    status: prescriptionStatus,
    loading: prescriptionLoading
  } = usePrescriptions('patient');

  const handleExportRecords = () => {
    const rows = records.map((record) => [
      record.id,
      record.appointment || '',
      record.summary || '',
      record.diagnosis || '',
      record.createdAt || ''
    ]);
    downloadPdf('Medical records', ['id', 'appointmentId', 'summary', 'diagnosis', 'createdAt'], rows);
  };

  const handleExportPrescriptions = () => {
    const rows = prescriptions.map((prescription) => [
      prescription.id,
      prescription.appointment || '',
      (prescription.medications || [])
        .map((med) =>
          [med.name, med.dosage, med.frequency].filter(Boolean).join(' ')
        )
        .join(' | '),
      prescription.notes || '',
      prescription.createdAt || ''
    ]);
    downloadPdf('Prescriptions', ['id', 'appointmentId', 'medications', 'notes', 'createdAt'], rows);
  };

  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [appointmentTimeFilter, setAppointmentTimeFilter] = useState('upcoming');

  const doctorNameMap = useMemo(() => {
    const map = new Map();
    doctors.forEach((doctor) => {
      map.set(doctor.userId, doctor.name);
    });
    return map;
  }, [doctors]);

  const now = Date.now();
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (appointmentStatusFilter !== 'all' && appointment.status !== appointmentStatusFilter) {
        return false;
      }

      if (appointmentTimeFilter === 'all') {
        return true;
      }

      const scheduledAt = new Date(appointment.scheduledAt).getTime();
      if (Number.isNaN(scheduledAt)) {
        return false;
      }

      if (appointmentTimeFilter === 'upcoming') {
        return scheduledAt >= now;
      }

      return scheduledAt < now;
    });
  }, [appointments, appointmentStatusFilter, appointmentTimeFilter, now]);

  const buildReminderLabel = (appointment) => {
    if (appointment.status !== 'scheduled') {
      return '';
    }

    const scheduledAt = new Date(appointment.scheduledAt).getTime();
    if (Number.isNaN(scheduledAt)) {
      return '';
    }

    const diffMinutes = Math.round((scheduledAt - Date.now()) / 60000);
    if (diffMinutes >= 0 && diffMinutes <= 15) {
      return `Starts in ${diffMinutes} min`;
    }

    return '';
  };

  const appointmentCounts = useMemo(() => {
    return appointments.reduce(
      (acc, appointment) => {
        acc.total += 1;
        if (appointment.status === 'scheduled') {
          acc.scheduled += 1;
        }
        if (appointment.status === 'completed') {
          acc.completed += 1;
        }
        if (appointment.status === 'canceled') {
          acc.canceled += 1;
        }
        return acc;
      },
      { total: 0, scheduled: 0, completed: 0, canceled: 0 }
    );
  }, [appointments]);

  if (loading) {
    return (
      <div className="page">
        <header className="page__header">
          <h1>Patient profile</h1>
          <button type="button" className="ghost" onClick={onLogout}>
            Sign out
          </button>
        </header>
        <div className="panel">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Complete your patient profile</h1>
          <p>We use this information to match you with the right clinician.</p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && <span className="pill">{unreadCount} new</span>}
          <button type="button" className="ghost" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="section__header">
          <div>
            <h2>Dashboard</h2>
            <p>Quick snapshot of your care activity.</p>
          </div>
        </div>
        <div className="dashboard__cards">
          <div className="dashboard__card">
            <span className="dashboard__label">Appointments</span>
            <span className="dashboard__value">{appointmentCounts.total}</span>
            <span className="dashboard__meta">
              {appointmentCounts.scheduled} scheduled
            </span>
          </div>
          <div className="dashboard__card">
            <span className="dashboard__label">Completed</span>
            <span className="dashboard__value">{appointmentCounts.completed}</span>
            <span className="dashboard__meta">{appointmentCounts.canceled} canceled</span>
          </div>
          <div className="dashboard__card">
            <span className="dashboard__label">Records</span>
            <span className="dashboard__value">{records.length}</span>
            <span className="dashboard__meta">Notes {notes.length}</span>
          </div>
          <div className="dashboard__card">
            <span className="dashboard__label">Prescriptions</span>
            <span className="dashboard__value">{prescriptions.length}</span>
            <span className="dashboard__meta">Updates {unreadCount}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section__header">
          <div>
            <h2>Notifications</h2>
            <p>Realtime updates for bookings and schedule changes.</p>
          </div>
          <div className="header-actions">
            <span className="pill">{streamStatus}</span>
            <button type="button" className="ghost ghost--compact" onClick={refreshNotifications}>
              Refresh
            </button>
            <button type="button" className="ghost ghost--compact" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          </div>
        </div>

        {notificationStatus.type === 'error' && (
          <div className="alert alert--error" role="status">
            {notificationStatus.message}
          </div>
        )}

        {notificationLoading ? (
          <p className="hint">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="hint">No notifications yet.</p>
        ) : (
          <div className="notification__list">
            {notifications.map((note) => (
              <div
                key={note.id}
                className={note.readAt ? 'notification__item' : 'notification__item notification__item--unread'}
              >
                <div>
                  <h4>{note.title}</h4>
                  <p>{note.message}</p>
                  <span className="notification__meta">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                {!note.readAt && (
                  <button
                    type="button"
                    className="ghost ghost--compact"
                    onClick={() => handleMarkRead(note.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="panel">
        {status.type !== 'idle' && (
          <div className={`alert alert--${status.type}`} role="status">
            {status.message}
          </div>
        )}

        <form className="form form--grid" onSubmit={handleSubmit}>
          <label className="field">
            Full name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            Birthday
            <input
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            Weight (kg)
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              min="1"
              required
            />
          </label>

          <label className="field">
            Height (cm)
            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              min="1"
              required
            />
          </label>

          <label className="field form--span">
            Profile picture
            <div className="upload-row">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
              <button type="button" className="ghost" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
              </button>
            </div>
            <input
              type="url"
              name="profilePictureUrl"
              value={form.profilePictureUrl}
              onChange={handleChange}
              placeholder="Or paste a URL"
            />
          </label>

          {previewUrl && (
            <div className="form--span preview">
              <img src={previewUrl} alt="Profile preview" />
            </div>
          )}

          <label className="field">
            Phone
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            Emergency contact
            <input
              type="tel"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field form--span">
            Address
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field form--span">
            Basic medical history
            <textarea
              name="medicalHistory"
              rows="4"
              value={form.medicalHistory}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="primary form--span" disabled={saving}>
            {saving ? 'Saving...' : hasProfile ? 'Update profile' : 'Save profile'}
          </button>
        </form>
      </div>

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>AI recommendations</h2>
            <p>Describe your symptoms to find the best doctor fit.</p>
          </div>
        </div>

        {recommendationStatus.type === 'error' && (
          <div className="alert alert--error" role="status">
            {recommendationStatus.message}
          </div>
        )}

        <form className="form" onSubmit={handleRecommendation}>
          <label className="field">
            Symptoms
            <input
              type="text"
              value={recommendationQuery}
              onChange={(event) => setRecommendationQuery(event.target.value)}
              placeholder="Headache, dizziness, stress"
              required
            />
          </label>
          <button type="submit" className="primary">
            Get recommendations
          </button>
        </form>

        {recommendations.length > 0 && (
          <div className="cards">
            {recommendations.map((doctor) => (
              <article key={doctor.id} className="card">
                <div className="card__header">
                  <div>
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialization}</p>
                  </div>
                  <span className="pill">AI match</span>
                </div>
                <p>{doctor.bio}</p>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => handleLoadAvailability(doctor.userId)}
                >
                  View availability
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Appointment booking</h2>
            <p>Select a slot and confirm the booking in the next step.</p>
          </div>
        </div>

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
                <button type="button" className="ghost ghost--compact" onClick={handleOpenConfirm}>
                  Review & confirm
                </button>
                <button type="button" className="ghost ghost--compact" onClick={handleClearSelection}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="hint">Choose a slot from a doctor to start booking.</p>
        )}

        <div className="panel panel--spaced">
          <div className="section__header">
            <div>
              <h3>Upcoming appointments</h3>
              <p>Review your most recent bookings.</p>
            </div>
            <div className="filter-row">
              <label className="field">
                Status
                <select
                  value={appointmentStatusFilter}
                  onChange={(event) => setAppointmentStatusFilter(event.target.value)}
                >
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
                <select
                  value={appointmentTimeFilter}
                  onChange={(event) => setAppointmentTimeFilter(event.target.value)}
                >
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
            <p className="hint">No appointments booked yet.</p>
          ) : (
            <div className="appointment__list">
              {filteredAppointments.map((appointment) => {
                const isRescheduling = rescheduleId === appointment.id;
                const meetingUrl = appointment.meetingUrl;

                return (
                  <div key={appointment.id} className="appointment__item">
                    <div>
                      <h4>{doctorNameMap.get(appointment.doctor) || 'Doctor'}</h4>
                      <p>
                        {new Date(appointment.scheduledAt).toLocaleString()} ·{' '}
                        {appointment.durationMinutes} min
                      </p>
                      <p className="appointment__meta">Status: {appointment.status}</p>
                      {buildReminderLabel(appointment) && (
                        <span className="pill pill--warning">{buildReminderLabel(appointment)}</span>
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
                          onClick={() => handleFetchMeeting(appointment.id)}
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
                        onClick={() => handleStartReschedule(appointment)}
                        disabled={actionLoading || appointment.status !== 'scheduled'}
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        className="ghost ghost--compact"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={actionLoading || appointment.status !== 'scheduled'}
                      >
                        Cancel
                      </button>
                    </div>

                    {isRescheduling && (
                      <form className="appointment__reschedule" onSubmit={handleRescheduleSubmit}>
                        <label className="field">
                          New time
                          <input
                            type="datetime-local"
                            value={rescheduleAt}
                            onChange={handleRescheduleChange}
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
                            onClick={handleCancelReschedule}
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

      {isConfirmOpen && selectedSlot && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <div>
                <h3>Confirm appointment</h3>
                <p>
                  {selectedSlot.doctor.name} ·{' '}
                  {new Date(selectedSlot.slot.startAt).toLocaleString()}
                </p>
              </div>
              <button type="button" className="ghost ghost--compact" onClick={handleCloseConfirm}>
                Close
              </button>
            </div>

            <form className="form" onSubmit={handleBookingSubmit}>
              <label className="field">
                Duration
                <select
                  name="durationMinutes"
                  value={bookingForm.durationMinutes}
                  onChange={handleBookingChange}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                </select>
              </label>
              <label className="field">
                Reason for visit
                <textarea
                  name="reason"
                  rows="3"
                  value={bookingForm.reason}
                  onChange={handleBookingChange}
                  placeholder="Briefly describe the reason for the visit"
                />
              </label>
              <div className="modal__actions">
                <button type="submit" className="primary" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm booking'}
                </button>
                <button type="button" className="ghost" onClick={handleCloseConfirm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Medical records</h2>
            <p>Review summaries from your recent consultations.</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="ghost ghost--compact"
              onClick={handleExportRecords}
              disabled={records.length === 0}
            >
              Export PDF
            </button>
          </div>
        </div>

        {recordStatus.type === 'error' && (
          <div className="alert alert--error" role="status">
            {recordStatus.message}
          </div>
        )}

        {recordLoading ? (
          <p className="hint">Loading medical records...</p>
        ) : records.length === 0 ? (
          <p className="hint">No medical records yet.</p>
        ) : (
          <div className="records__list">
            {records.map((record) => (
              <div key={record.id} className="records__item">
                <div>
                  <h4>Visit summary</h4>
                  <p>{record.summary}</p>
                  {record.diagnosis && (
                    <p className="records__meta">Diagnosis: {record.diagnosis}</p>
                  )}
                  <span className="records__meta">
                    {new Date(record.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className="pill">Record</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Consultation notes</h2>
            <p>Notes shared by your clinician after visits.</p>
          </div>
        </div>

        {noteStatus.type === 'error' && (
          <div className="alert alert--error" role="status">
            {noteStatus.message}
          </div>
        )}

        {noteLoading ? (
          <p className="hint">Loading consultation notes...</p>
        ) : notes.length === 0 ? (
          <p className="hint">No consultation notes yet.</p>
        ) : (
          <div className="records__list">
            {notes.map((note) => (
              <div key={note.id} className="records__item">
                <div>
                  <h4>Consultation note</h4>
                  <p>{note.note}</p>
                  <span className="records__meta">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className="pill">Note</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Prescriptions</h2>
            <p>Medication instructions provided by your doctor.</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="ghost ghost--compact"
              onClick={handleExportPrescriptions}
              disabled={prescriptions.length === 0}
            >
              Export PDF
            </button>
          </div>
        </div>

        {prescriptionStatus.type === 'error' && (
          <div className="alert alert--error" role="status">
            {prescriptionStatus.message}
          </div>
        )}

        {prescriptionLoading ? (
          <p className="hint">Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <p className="hint">No prescriptions yet.</p>
        ) : (
          <div className="records__list">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="records__item">
                <div>
                  <h4>Prescription</h4>
                  {prescription.medications.map((med, index) => (
                    <p key={`${prescription.id}-med-${index}`}>
                      {med.name}
                      {med.dosage ? ` · ${med.dosage}` : ''}
                      {med.frequency ? ` · ${med.frequency}` : ''}
                    </p>
                  ))}
                  {prescription.notes && (
                    <p className="records__meta">Notes: {prescription.notes}</p>
                  )}
                  <span className="records__meta">
                    {new Date(prescription.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className="pill">Rx</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Doctor discovery</h2>
            <p>Search by name, specialty, or symptoms and review schedules.</p>
          </div>
        </div>

        {doctorStatus.type === 'error' && (
          <div className="alert alert--error" role="status">
            {doctorStatus.message}
          </div>
        )}

        <form className="form form--grid" onSubmit={handleDoctorSearch}>
          <label className="field">
            Search
            <input
              type="text"
              value={doctorQuery}
              onChange={(event) => setDoctorQuery(event.target.value)}
              placeholder="Doctor name or symptoms"
            />
          </label>
          <label className="field">
            Specialization
            <input
              type="text"
              value={specializationQuery}
              onChange={(event) => setSpecializationQuery(event.target.value)}
              placeholder="Cardiology"
            />
          </label>
          <button type="submit" className="primary form--span">
            Search doctors
          </button>
        </form>

        {doctors.length === 0 ? (
          <p className="hint">No doctors found yet. Try another search.</p>
        ) : (
          <div className="cards">
            {doctors.map((doctor) => {
              const availability = availabilityMap[doctor.userId];

              return (
                <article key={doctor.id} className="card">
                  <div className="card__header">
                    <div>
                      <h3>{doctor.name}</h3>
                      <p>{doctor.specialization}</p>
                    </div>
                    <span className="pill">Fee {doctor.consultationFee ?? 'TBD'}</span>
                  </div>
                  <p>{doctor.bio}</p>
                  {doctor.credentials && (
                    <p className="card__meta">{doctor.credentials}</p>
                  )}
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => handleLoadAvailability(doctor.userId)}
                  >
                    {availability?.status === 'loading'
                      ? 'Loading schedules...'
                      : 'View availability'}
                  </button>
                  {availability?.status === 'ready' && (
                    <ul className="availability">
                      {availability.slots.length === 0 ? (
                        <li>No open slots yet.</li>
                      ) : (
                        availability.slots.map((slot) => {
                          const isSelected =
                            selectedSlot?.slot?.id === slot.id &&
                            selectedSlot?.doctor?.userId === doctor.userId;

                          return (
                          <li key={slot.id}>
                            <div className={isSelected ? 'slot-row slot-row--active' : 'slot-row'}>
                              <span>
                                {new Date(slot.startAt).toLocaleString()} -{' '}
                                {new Date(slot.endAt).toLocaleTimeString()}
                              </span>
                              <button
                                type="button"
                                className="ghost ghost--compact"
                                onClick={() => handleSelectSlot(doctor, slot)}
                                disabled={isSelected}
                              >
                                {isSelected ? 'Selected' : 'Book'}
                              </button>
                            </div>
                          </li>
                        );
                        })
                      )}
                    </ul>
                  )}
                  {availability?.status === 'error' && (
                    <p className="hint">{availability.message}</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientProfilePage;
