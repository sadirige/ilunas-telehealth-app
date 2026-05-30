import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import DoctorAppointmentsPanel from '../components/doctor/DoctorAppointmentsPanel';
import DoctorAvailabilityPanel from '../components/doctor/DoctorAvailabilityPanel';
import DoctorClinicalPanel from '../components/doctor/DoctorClinicalPanel';
import DoctorMeetingGuideModal from '../components/doctor/DoctorMeetingGuideModal';
import DoctorOverviewPanel from '../components/doctor/DoctorOverviewPanel';
import DoctorProfilePanel from '../components/doctor/DoctorProfilePanel';
import DoctorSendLinkModal from '../components/doctor/DoctorSendLinkModal';
import DoctorTodayPanel from '../components/doctor/DoctorTodayPanel';
import NotificationsPanel from '../components/shared/NotificationsPanel';
import useDoctorAvailability from '../hooks/useDoctorAvailability';
import useAvailabilityTemplates from '../hooks/useAvailabilityTemplates';
import useDoctorAppointments from '../hooks/useDoctorAppointments';
import useDoctorProfileForm from '../hooks/useDoctorProfileForm';
import { useConsultationNotes } from '../hooks/useConsultationNotes';
import useMeetingLinkGenerator from '../hooks/useMeetingLinkGenerator';
import useMedicalRecords from '../hooks/useMedicalRecords';
import useNotifications from '../hooks/useNotifications';
import { usePrescriptions } from '../hooks/usePrescriptions';
import { downloadPdf } from '../utils/export';

const DOCTOR_SECTIONS = {
  overview: { title: 'Overview', subtitle: 'Quick snapshot of your clinic activity.' },
  today: { title: "Today's schedule", subtitle: 'Upcoming consultations for today.' },
  notifications: { title: 'Notifications', subtitle: 'Updates for bookings and schedule changes.' },
  profile: { title: 'Your profile', subtitle: 'Share credentials so patients can book confidently.' },
  availability: { title: 'Availability', subtitle: 'Set the time windows when patients can book you.' },
  appointments: { title: 'Appointments', subtitle: 'Manage consultations and meeting details.' },
  clinical: { title: 'Clinical records', subtitle: 'Document summaries, notes, and prescriptions.' }
};

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

const DoctorProfilePage = ({ onLogout }) => {
  const { section } = useParams();
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }, []);

  const profile = useDoctorProfileForm(storedUser?.displayName || '');
  const availability = useDoctorAvailability();
  const availabilityTemplates = useAvailabilityTemplates(availability.refreshAvailabilities);
  const notifications = useNotifications();
  const appointmentsHook = useDoctorAppointments();
  const meetingLink = useMeetingLinkGenerator();
  const medicalRecords = useMedicalRecords('doctor');
  const consultationNotes = useConsultationNotes('doctor');
  const prescriptionsHook = usePrescriptions('doctor');

  const [meetingGuideProvider, setMeetingGuideProvider] = useState('');
  const [sendLinkAppointment, setSendLinkAppointment] = useState(null);
  const [sessionStatus, setSessionStatus] = useState({ type: 'idle', message: '' });
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [appointmentTimeFilter, setAppointmentTimeFilter] = useState('all');
  const [activeSection, setActiveSection] = useState(section || 'overview');

  useEffect(() => {
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [section, activeSection]);

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`/doctor/${sectionId}`);
  };

  const doctorNav = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'today', label: "Today's schedule" },
      { id: 'appointments', label: 'Appointments' },
      { id: 'availability', label: 'Availability' },
      { id: 'clinical', label: 'Clinical records' },
      { id: 'profile', label: 'Profile' },
      { id: 'notifications', label: 'Notifications', badge: notifications.unreadCount }
    ],
    [notifications.unreadCount]
  );

  const sectionMeta = DOCTOR_SECTIONS[activeSection] || DOCTOR_SECTIONS.overview;

  const now = Date.now();
  const filteredAppointments = useMemo(() => {
    return appointmentsHook.appointments.filter((appointment) => {
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
  }, [appointmentsHook.appointments, appointmentStatusFilter, appointmentTimeFilter, now]);

  const todayAppointments = useMemo(
    () => appointmentsHook.buildTodaySchedule(appointmentsHook.appointments),
    [appointmentsHook.appointments, appointmentsHook.buildTodaySchedule]
  );

  const appointmentCounts = useMemo(() => {
    return appointmentsHook.appointments.reduce(
      (acc, appointment) => {
        acc.total += 1;
        if (appointment.status === 'scheduled') acc.scheduled += 1;
        if (appointment.status === 'completed') acc.completed += 1;
        if (appointment.status === 'canceled') acc.canceled += 1;
        return acc;
      },
      { total: 0, scheduled: 0, completed: 0, canceled: 0 }
    );
  }, [appointmentsHook.appointments]);

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

  const handleExportRecords = () => {
    const rows = medicalRecords.records.map((record) => [
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
    const rows = prescriptionsHook.prescriptions.map((prescription) => [
      prescription.id,
      prescription.appointment || '',
      prescription.patient || '',
      (prescription.medications || [])
        .map((med) => [med.name, med.dosage, med.frequency].filter(Boolean).join(' '))
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

  const handleCopyMeetingLink = () => {
    navigator.clipboard?.writeText(sendLinkAppointment.meetingUrl);
    setSessionStatus({ type: 'success', message: 'Meeting link copied.' });
    setSendLinkAppointment(null);
  };

  if (profile.loading) {
    return (
      <AppShell
        roleLabel="Doctor"
        userName={storedUser?.displayName}
        navItems={[{ id: 'overview', label: 'Overview' }]}
        activeSection="overview"
        onNavigate={() => {}}
        onLogout={onLogout}
        title="Loading..."
        subtitle="Setting up your profile"
      >
        <div className="panel panel--loading">Loading your profile...</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      roleLabel="Doctor"
      userName={storedUser?.displayName || profile.form.name}
      navItems={doctorNav}
      activeSection={activeSection}
      onNavigate={handleNavigate}
      onLogout={onLogout}
      title={sectionMeta.title}
      subtitle={sectionMeta.subtitle}
    >
      {activeSection === 'overview' && (
        <DoctorOverviewPanel
          appointmentCounts={appointmentCounts}
          recordsCount={medicalRecords.records.length}
          notesCount={consultationNotes.notes.length}
          prescriptionsCount={prescriptionsHook.prescriptions.length}
          unreadCount={notifications.unreadCount}
          onNavigate={handleNavigate}
        />
      )}

      {activeSection === 'today' && (
        <DoctorTodayPanel
          todayAppointments={todayAppointments}
          canStartSession={appointmentsHook.canStartSession}
          onStartSession={handleStartSession}
          onSendLink={setSendLinkAppointment}
          onNavigateToAvailability={() => handleNavigate('availability')}
        />
      )}

      {activeSection === 'notifications' && (
        <NotificationsPanel
          notifications={notifications.notifications}
          notificationStatus={notifications.status}
          notificationLoading={notifications.loading}
          streamStatus={notifications.streamStatus}
          refreshNotifications={notifications.refreshNotifications}
          handleMarkRead={notifications.handleMarkRead}
          handleMarkAllRead={notifications.handleMarkAllRead}
        />
      )}

      {activeSection === 'profile' && (
        <DoctorProfilePanel
          form={profile.form}
          hasProfile={profile.hasProfile}
          saving={profile.saving}
          uploading={profile.uploading}
          previewUrl={profile.previewUrl}
          status={profile.status}
          handleChange={profile.handleChange}
          handleSubmit={profile.handleSubmit}
          handleUpload={profile.handleUpload}
        />
      )}

      {activeSection === 'availability' && (
        <DoctorAvailabilityPanel
          availabilityForm={availability.form}
          availabilities={availability.availabilities}
          weekStart={availability.weekStart}
          weekAvailabilities={availability.weekAvailabilities}
          calendarSelection={availability.calendarSelection}
          showManualForm={availability.showManualForm}
          previewSlots={availability.previewSlots}
          previewError={availability.previewError}
          availabilityStatus={availability.status}
          availabilityLoading={availability.loading}
          availabilitySaving={availability.saving}
          handleAvailabilityChange={availability.handleChange}
          handleAvailabilitySubmit={availability.handleSubmit}
          handleAvailabilityDelete={availability.handleDelete}
          handleWeekChange={availability.handleWeekChange}
          handleGoToToday={availability.handleGoToToday}
          handleCalendarSelectRange={availability.handleCalendarSelectRange}
          handleCalendarClearSelection={availability.handleCalendarClearSelection}
          handleCalendarSubmit={availability.handleCalendarSubmit}
          templates={availabilityTemplates.templates}
          templateForm={availabilityTemplates.templateForm}
          templateStatus={availabilityTemplates.templateStatus}
          templatesLoading={availabilityTemplates.templatesLoading}
          templatesSaving={availabilityTemplates.templatesSaving}
          templatesApplying={availabilityTemplates.templatesApplying}
          templatePreviewCount={availabilityTemplates.templatePreviewCount}
          activeTemplatePreviewCount={availabilityTemplates.activeTemplatePreviewCount}
          handleTemplateFormChange={availabilityTemplates.handleTemplateFormChange}
          handleCreateTemplates={availabilityTemplates.handleCreateTemplates}
          handleToggleActive={availabilityTemplates.handleToggleActive}
          handleDeleteTemplate={availabilityTemplates.handleDeleteTemplate}
          handleApplyAll={availabilityTemplates.handleApplyAll}
        />
      )}

      {activeSection === 'appointments' && (
        <DoctorAppointmentsPanel
          filteredAppointments={filteredAppointments}
          appointmentStatusFilter={appointmentStatusFilter}
          appointmentTimeFilter={appointmentTimeFilter}
          appointmentStatus={appointmentsHook.status}
          appointmentActionStatus={appointmentsHook.actionStatus}
          meetingLinkStatus={meetingLink.status}
          sessionStatus={sessionStatus}
          appointmentLoading={appointmentsHook.loading}
          appointmentActionLoading={appointmentsHook.actionLoading}
          statusOptions={appointmentsHook.statusOptions}
          meetingProviders={appointmentsHook.meetingProviders}
          statusDrafts={appointmentsHook.statusDrafts}
          meetingDrafts={appointmentsHook.meetingDrafts}
          buildReminderLabel={buildReminderLabel}
          canStartSession={appointmentsHook.canStartSession}
          generateLink={meetingLink.generateLink}
          onStatusFilterChange={(event) => setAppointmentStatusFilter(event.target.value)}
          onTimeFilterChange={(event) => setAppointmentTimeFilter(event.target.value)}
          onStatusDraftChange={appointmentsHook.handleStatusDraftChange}
          onMeetingDraftChange={appointmentsHook.handleMeetingDraftChange}
          onSaveStatus={appointmentsHook.handleSaveStatus}
          onComplete={appointmentsHook.handleComplete}
          onStartSession={handleStartSession}
          onSendLink={setSendLinkAppointment}
          onOpenMeetingGuide={setMeetingGuideProvider}
          onSaveMeeting={appointmentsHook.handleSaveMeeting}
          onNavigateToAvailability={() => handleNavigate('availability')}
        />
      )}

      {activeSection === 'clinical' && (
        <DoctorClinicalPanel
          appointments={appointmentsHook.appointments}
          records={medicalRecords.records}
          notes={consultationNotes.notes}
          prescriptions={prescriptionsHook.prescriptions}
          recordStatus={medicalRecords.status}
          noteStatus={consultationNotes.status}
          prescriptionStatus={prescriptionsHook.status}
          recordLoading={medicalRecords.loading}
          noteLoading={consultationNotes.loading}
          prescriptionLoading={prescriptionsHook.loading}
          recordSaving={medicalRecords.saving}
          noteSaving={consultationNotes.saving}
          prescriptionSaving={prescriptionsHook.saving}
          recordForm={medicalRecords.form}
          noteForm={consultationNotes.form}
          prescriptionForm={prescriptionsHook.form}
          handleRecordChange={medicalRecords.handleChange}
          handleRecordSubmit={medicalRecords.handleSubmit}
          handleNoteChange={consultationNotes.handleChange}
          handleNoteSubmit={consultationNotes.handleSubmit}
          handlePrescriptionChange={prescriptionsHook.handleChange}
          handlePrescriptionSubmit={prescriptionsHook.handleSubmit}
          onExportRecords={handleExportRecords}
          onExportPrescriptions={handleExportPrescriptions}
          onNavigateToAppointments={() => handleNavigate('appointments')}
        />
      )}

      {meetingGuideProvider && (
        <DoctorMeetingGuideModal
          provider={meetingGuideProvider}
          onClose={() => setMeetingGuideProvider('')}
        />
      )}

      {sendLinkAppointment && (
        <DoctorSendLinkModal
          appointment={sendLinkAppointment}
          buildEmailLink={buildEmailLink}
          buildSmsLink={buildSmsLink}
          onClose={() => setSendLinkAppointment(null)}
          onCopy={handleCopyMeetingLink}
        />
      )}
    </AppShell>
  );
};

export default DoctorProfilePage;
