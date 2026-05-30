import { useMemo, useState } from 'react';
import useDoctorAvailability from '../hooks/useDoctorAvailability';
import useDoctorAppointments from '../hooks/useDoctorAppointments';
import useDoctorProfileForm from '../hooks/useDoctorProfileForm';
import { useConsultationNotes } from '../hooks/useConsultationNotes';
import useMeetingLinkGenerator from '../hooks/useMeetingLinkGenerator';
import useMedicalRecords from '../hooks/useMedicalRecords';
import useNotifications from '../hooks/useNotifications';
import { usePrescriptions } from '../hooks/usePrescriptions';
import { downloadPdf } from '../utils/export';
import '../App.css';

const DoctorProfilePage = ({ onLogout }) => {
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
    hasProfile,
    loading,
    saving,
    uploading,
    previewUrl,
    status,
    handleChange,
    handleSubmit,
    handleUpload
  } = useDoctorProfileForm(storedUser?.displayName || '');

  const {
    form: availabilityForm,
    availabilities,
    previewSlots,
    previewError,
    status: availabilityStatus,
    loading: availabilityLoading,
    saving: availabilitySaving,
    handleChange: handleAvailabilityChange,
    handleSubmit: handleAvailabilitySubmit,
    handleDelete: handleAvailabilityDelete
  } = useDoctorAvailability();

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
    appointments,
    status: appointmentStatus,
    loading: appointmentLoading,
    actionStatus: appointmentActionStatus,
    actionLoading: appointmentActionLoading,
    statusOptions,
    meetingProviders,
    statusDrafts,
    meetingDrafts,
    handleStatusDraftChange,
    handleMeetingDraftChange,
    handleSaveStatus,
    handleComplete,
    handleSaveMeeting,
    canStartSession,
    buildTodaySchedule
  } = useDoctorAppointments();

  const {
    status: meetingLinkStatus,
    generateLink
  } = useMeetingLinkGenerator();

  const [meetingGuideProvider, setMeetingGuideProvider] = useState('');
  const [sendLinkAppointment, setSendLinkAppointment] = useState(null);
  const [sessionStatus, setSessionStatus] = useState({ type: 'idle', message: '' });

  const openMeetingGuide = (provider) => {
    setMeetingGuideProvider(provider);
  };

  const closeMeetingGuide = () => {
    setMeetingGuideProvider('');
  };

  const openSendLink = (appointment) => {
    setSendLinkAppointment(appointment);
  };

  const closeSendLink = () => {
    setSendLinkAppointment(null);
  };

  const handleStartSession = (appointment) => {
    if (!appointment?.meetingUrl) {
      setSessionStatus({ type: 'error', message: 'Meeting link is missing.' });
      return;
    }

    window.open(appointment.meetingUrl, '_blank', 'noopener,noreferrer');
  };

  const buildEmailLink = (meetingUrl) => {
    const subject = encodeURIComponent('Telehealth appointment link');
    const body = encodeURIComponent(`Here is the meeting link: ${meetingUrl}`);
    return `mailto:?subject=${subject}&body=${body}`;
  };

  const buildSmsLink = (meetingUrl) => {
    const body = encodeURIComponent(`Telehealth meeting link: ${meetingUrl}`);
    return `sms:?body=${body}`;
  };

  const {
    records,
    status: recordStatus,
    loading: recordLoading,
    saving: recordSaving,
    form: recordForm,
    handleChange: handleRecordChange,
    handleSubmit: handleRecordSubmit
  } = useMedicalRecords('doctor');

  const {
    notes,
    status: noteStatus,
    loading: noteLoading,
    saving: noteSaving,
    form: noteForm,
    handleChange: handleNoteChange,
    handleSubmit: handleNoteSubmit
  } = useConsultationNotes('doctor');

  const {
    prescriptions,
    status: prescriptionStatus,
    loading: prescriptionLoading,
    saving: prescriptionSaving,
    form: prescriptionForm,
    handleChange: handlePrescriptionChange,
    handleSubmit: handlePrescriptionSubmit
  } = usePrescriptions('doctor');

  const handleExportRecords = () => {
    const rows = records.map((record) => [
      record.id,
      record.appointment || '',
      record.patient || '',
      record.summary || '',
      record.diagnosis || '',
      record.createdAt || ''
    ]);
    downloadPdf(
      'Medical records',
      ['id', 'appointmentId', 'patientId', 'summary', 'diagnosis', 'createdAt'],
      rows
    );
  };

  const handleExportPrescriptions = () => {
    const rows = prescriptions.map((prescription) => [
      prescription.id,
      prescription.appointment || '',
      prescription.patient || '',
      (prescription.medications || [])
        .map((med) =>
          [med.name, med.dosage, med.frequency].filter(Boolean).join(' ')
        )
        .join(' | '),
      prescription.notes || '',
      prescription.createdAt || ''
    ]);
    downloadPdf(
      'Prescriptions',
      ['id', 'appointmentId', 'patientId', 'medications', 'notes', 'createdAt'],
      rows
    );
  };

  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [appointmentTimeFilter, setAppointmentTimeFilter] = useState('all');

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

  const todayAppointments = useMemo(
    () => buildTodaySchedule(appointments),
    [appointments, buildTodaySchedule]
  );

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
          <h1>Doctor profile</h1>
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
          <h1>Complete your doctor profile</h1>
          <p>Share credentials and pricing so patients can book confidently.</p>
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
            <p>Quick snapshot of your clinic activity.</p>
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

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Today’s schedule</h2>
            <p>Upcoming consultations for today.</p>
          </div>
        </div>

        {todayAppointments.length === 0 ? (
          <p className="hint">No appointments scheduled for today.</p>
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
                  <p className="appointment__meta">Status: {appointment.status}</p>
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
                    onClick={() => handleStartSession(appointment)}
                  >
                    Start session
                  </button>
                  <button
                    type="button"
                    className="ghost ghost--compact"
                    onClick={() => openSendLink(appointment)}
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
            Specialization
            <input
              type="text"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="Family Medicine, Dermatology"
              required
            />
          </label>

          <label className="field form--span">
            Credentials
            <input
              type="text"
              name="credentials"
              value={form.credentials}
              onChange={handleChange}
              placeholder="MD, Board Certified"
              required
            />
          </label>

          <label className="field">
            Consultation fee
            <input
              type="number"
              name="consultationFee"
              value={form.consultationFee}
              onChange={handleChange}
              min="0"
              required
            />
          </label>

          <label className="field">
            Bio
            <textarea
              name="bio"
              rows="4"
              value={form.bio}
              onChange={handleChange}
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

          <button type="submit" className="primary form--span" disabled={saving}>
            {saving ? 'Saving...' : hasProfile ? 'Update profile' : 'Save profile'}
          </button>
        </form>
      </div>

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Availability</h2>
            <p>Set the time windows when patients can book you.</p>
          </div>
        </div>

        {availabilityStatus.type !== 'idle' && (
          <div className={`alert alert--${availabilityStatus.type}`} role="status">
            {availabilityStatus.message}
          </div>
        )}

        <form className="form form--grid" onSubmit={handleAvailabilitySubmit}>
          <label className="field">
            Start time
            <input
              type="datetime-local"
              name="startAt"
              value={availabilityForm.startAt}
              onChange={handleAvailabilityChange}
              required
            />
          </label>
          <label className="field">
            End time
            <input
              type="datetime-local"
              name="endAt"
              value={availabilityForm.endAt}
              onChange={handleAvailabilityChange}
              required
            />
          </label>
          <label className="field">
            Slot duration (minutes)
            <input
              type="number"
              name="slotMinutes"
              value={availabilityForm.slotMinutes}
              onChange={handleAvailabilityChange}
              min="1"
              list="slot-duration-options"
            />
            <datalist id="slot-duration-options">
              <option value="30" />
              <option value="45" />
              <option value="60" />
              <option value="120" />
            </datalist>
          </label>
          <button
            type="submit"
            className="primary form--span"
            disabled={availabilitySaving}
          >
            {availabilitySaving ? 'Saving...' : 'Add availability'}
          </button>
        </form>

        <div className="availability__preview">
          <div className="section__header">
            <div>
              <h3>Slot preview</h3>
              <p>Review generated slots before saving.</p>
            </div>
          </div>
          {previewError ? (
            <p className="hint">{previewError}</p>
          ) : previewSlots.length === 0 ? (
            <p className="hint">Add a time range to preview slots.</p>
          ) : (
            <div className="slot-preview">
              {previewSlots.map((slot, index) => (
                <div key={`${slot.startAt.toISOString()}-${index}`} className="slot-preview__item">
                  <span>{new Date(slot.startAt).toLocaleString()}</span>
                  <span>→ {new Date(slot.endAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {availabilityLoading ? (
          <p className="hint">Loading availability...</p>
        ) : availabilities.length === 0 ? (
          <p className="hint">No availability windows yet. Add your first slot above.</p>
        ) : (
          <div className="availability__list">
            {availabilities.map((slot) => (
              <div key={slot.id} className="availability__item">
                <div>
                  <h4>{new Date(slot.startAt).toLocaleString()}</h4>
                  <p>Ends {new Date(slot.endAt).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  className="ghost ghost--compact"
                  onClick={() => handleAvailabilityDelete(slot.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Appointments</h2>
            <p>Manage upcoming consultations and meeting details.</p>
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
          <p className="hint">Loading appointments...</p>
        ) : filteredAppointments.length === 0 ? (
          <p className="hint">No appointments booked yet.</p>
        ) : (
          <div className="appointment__list">
            {filteredAppointments.map((appointment) => {
              const statusValue = statusDrafts[appointment.id] || appointment.status;
              const meetingDraft = meetingDrafts[appointment.id] || {};
              const patientId = appointment.patient || '';

              return (
                <div key={appointment.id} className="appointment__item">
                  <div className="appointment__details">
                    <h4>Patient {patientId.slice(-6) || 'Unknown'}</h4>
                    <p>
                      {new Date(appointment.scheduledAt).toLocaleString()} ·{' '}
                      {appointment.durationMinutes} min
                    </p>
                    <p className="appointment__meta">Status: {appointment.status}</p>
                    {buildReminderLabel(appointment) && (
                      <span className="pill pill--warning">{buildReminderLabel(appointment)}</span>
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
                            handleStatusDraftChange(appointment.id, event.target.value)
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
                          onClick={() => handleSaveStatus(appointment.id)}
                          disabled={appointmentActionLoading || appointment.status === 'canceled'}
                        >
                          Save status
                        </button>
                        <button
                          type="button"
                          className="ghost ghost--compact"
                          onClick={() => handleComplete(appointment.id)}
                          disabled={appointmentActionLoading || appointment.status !== 'scheduled'}
                        >
                          Mark complete
                        </button>
                        <button
                          type="button"
                          className="primary"
                          disabled={!canStartSession(appointment)}
                          onClick={() => handleStartSession(appointment)}
                        >
                          Start session
                        </button>
                        <button
                          type="button"
                          className="ghost ghost--compact"
                          onClick={() => openSendLink(appointment)}
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
                            handleMeetingDraftChange(
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
                            handleMeetingDraftChange(
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
                              handleMeetingDraftChange(appointment.id, 'meetingUrl', link);
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
                            onClick={() => openMeetingGuide(meetingDraft.meetingProvider)}
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
                            handleMeetingDraftChange(
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
                          onClick={() => handleSaveMeeting(appointment.id)}
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

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Medical records</h2>
            <p>Document summaries after consultations.</p>
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

        {recordStatus.type !== 'idle' && (
          <div className={`alert alert--${recordStatus.type}`} role="status">
            {recordStatus.message}
          </div>
        )}

        <form className="form form--grid" onSubmit={handleRecordSubmit}>
          <label className="field">
            Appointment
            <select
              name="appointmentId"
              value={recordForm.appointmentId}
              onChange={handleRecordChange}
              required
            >
              <option value="">Select appointment</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {new Date(appointment.scheduledAt).toLocaleString()} · {appointment.id.slice(-6)}
                </option>
              ))}
            </select>
          </label>
          <label className="field form--span">
            Summary
            <textarea
              name="summary"
              rows="4"
              value={recordForm.summary}
              onChange={handleRecordChange}
              required
            />
          </label>
          <label className="field form--span">
            Diagnosis (optional)
            <input
              type="text"
              name="diagnosis"
              value={recordForm.diagnosis}
              onChange={handleRecordChange}
            />
          </label>
          <button type="submit" className="primary form--span" disabled={recordSaving}>
            {recordSaving ? 'Saving...' : 'Save record'}
          </button>
        </form>

        {recordLoading ? (
          <p className="hint">Loading records...</p>
        ) : records.length === 0 ? (
          <p className="hint">No records created yet.</p>
        ) : (
          <div className="records__list">
            {records.map((record) => (
              <div key={record.id} className="records__item">
                <div>
                  <h4>Appointment {record.appointment?.slice(-6)}</h4>
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

      {meetingGuideProvider && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <div>
                <h3>Generate meeting link</h3>
                <p>
                  {meetingGuideProvider === 'google_meet'
                    ? 'Create a Google Meet and paste the link.'
                    : 'Create a Zoom meeting and paste the link.'}
                </p>
              </div>
              <button type="button" className="ghost ghost--compact" onClick={closeMeetingGuide}>
                Close
              </button>
            </div>
            <div className="modal__actions">
              {meetingGuideProvider === 'google_meet' && (
                <a className="primary" href="https://meet.google.com" target="_blank" rel="noreferrer">
                  Open Google Meet
                </a>
              )}
              {meetingGuideProvider === 'zoom' && (
                <a className="primary" href="https://zoom.us/start" target="_blank" rel="noreferrer">
                  Open Zoom
                </a>
              )}
              <button type="button" className="ghost" onClick={closeMeetingGuide}>
                I will paste the link
              </button>
            </div>
            <p className="hint">
              After creating the meeting, copy the link and paste it into the “Meeting URL” field.
            </p>
          </div>
        </div>
      )}

      {sendLinkAppointment && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <div>
                <h3>Send meeting link</h3>
                <p>Choose how you want to share the link.</p>
              </div>
              <button type="button" className="ghost ghost--compact" onClick={closeSendLink}>
                Close
              </button>
            </div>
            <div className="modal__actions">
              <a
                className="primary"
                href={buildEmailLink(sendLinkAppointment.meetingUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Email
              </a>
              <a
                className="primary"
                href={buildSmsLink(sendLinkAppointment.meetingUrl)}
                target="_blank"
                rel="noreferrer"
              >
                SMS
              </a>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  navigator.clipboard?.writeText(sendLinkAppointment.meetingUrl);
                  setSessionStatus({ type: 'success', message: 'Meeting link copied.' });
                  closeSendLink();
                }}
              >
                Copy link
              </button>
            </div>
            <p className="hint">You can paste the link into any messaging app.</p>
          </div>
        </div>
      )}

      <section className="panel panel--spaced">
        <div className="section__header">
          <div>
            <h2>Consultation notes</h2>
            <p>Capture clinical notes for each appointment.</p>
          </div>
        </div>

        {noteStatus.type !== 'idle' && (
          <div className={`alert alert--${noteStatus.type}`} role="status">
            {noteStatus.message}
          </div>
        )}

        <form className="form form--grid" onSubmit={handleNoteSubmit}>
          <label className="field">
            Appointment
            <select
              name="appointmentId"
              value={noteForm.appointmentId}
              onChange={handleNoteChange}
              required
            >
              <option value="">Select appointment</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {new Date(appointment.scheduledAt).toLocaleString()} · {appointment.id.slice(-6)}
                </option>
              ))}
            </select>
          </label>
          <label className="field form--span">
            Note
            <textarea
              name="note"
              rows="4"
              value={noteForm.note}
              onChange={handleNoteChange}
              required
            />
          </label>
          <button type="submit" className="primary form--span" disabled={noteSaving}>
            {noteSaving ? 'Saving...' : 'Save note'}
          </button>
        </form>

        {noteLoading ? (
          <p className="hint">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="hint">No consultation notes yet.</p>
        ) : (
          <div className="records__list">
            {notes.map((note) => (
              <div key={note.id} className="records__item">
                <div>
                  <h4>Appointment {note.appointment?.slice(-6)}</h4>
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
            <p>Issue medications and patient instructions.</p>
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

        {prescriptionStatus.type !== 'idle' && (
          <div className={`alert alert--${prescriptionStatus.type}`} role="status">
            {prescriptionStatus.message}
          </div>
        )}

        <form className="form form--grid" onSubmit={handlePrescriptionSubmit}>
          <label className="field">
            Appointment
            <select
              name="appointmentId"
              value={prescriptionForm.appointmentId}
              onChange={handlePrescriptionChange}
              required
            >
              <option value="">Select appointment</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {new Date(appointment.scheduledAt).toLocaleString()} · {appointment.id.slice(-6)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Medication name
            <input
              type="text"
              name="medicationName"
              value={prescriptionForm.medicationName}
              onChange={handlePrescriptionChange}
              required
            />
          </label>
          <label className="field">
            Dosage
            <input
              type="text"
              name="dosage"
              value={prescriptionForm.dosage}
              onChange={handlePrescriptionChange}
            />
          </label>
          <label className="field">
            Frequency
            <input
              type="text"
              name="frequency"
              value={prescriptionForm.frequency}
              onChange={handlePrescriptionChange}
            />
          </label>
          <label className="field form--span">
            Notes (optional)
            <textarea
              name="notes"
              rows="3"
              value={prescriptionForm.notes}
              onChange={handlePrescriptionChange}
            />
          </label>
          <button type="submit" className="primary form--span" disabled={prescriptionSaving}>
            {prescriptionSaving ? 'Saving...' : 'Save prescription'}
          </button>
        </form>

        {prescriptionLoading ? (
          <p className="hint">Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <p className="hint">No prescriptions yet.</p>
        ) : (
          <div className="records__list">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="records__item">
                <div>
                  <h4>Appointment {prescription.appointment?.slice(-6)}</h4>
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
    </div>
  );
};

export default DoctorProfilePage;
