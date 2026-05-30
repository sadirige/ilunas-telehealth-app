import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import NotificationsPanel from '../components/shared/NotificationsPanel';
import PatientAiPanel from '../components/patient/PatientAiPanel';
import PatientAppointmentsPanel from '../components/patient/PatientAppointmentsPanel';
import PatientBookingConfirmModal from '../components/patient/PatientBookingConfirmModal';
import PatientDoctorDiscoveryPanel from '../components/patient/PatientDoctorDiscoveryPanel';
import PatientOverviewPanel from '../components/patient/PatientOverviewPanel';
import PatientProfilePanel from '../components/patient/PatientProfilePanel';
import PatientRecordsPanel from '../components/patient/PatientRecordsPanel';
import BookingBar from '../components/ui/BookingBar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useDoctorDiscovery from '../hooks/useDoctorDiscovery';
import useAppointmentBooking from '../hooks/useAppointmentBooking';
import { useConsultationNotes } from '../hooks/useConsultationNotes';
import useMedicalRecords from '../hooks/useMedicalRecords';
import useNotifications from '../hooks/useNotifications';
import usePatientProfileForm from '../hooks/usePatientProfileForm';
import { usePrescriptions } from '../hooks/usePrescriptions';
import useRecommendations from '../hooks/useRecommendations';
import { downloadPdf } from '../utils/export';

const PATIENT_SECTIONS = {
  overview: { title: 'Overview', subtitle: 'Quick snapshot of your care activity.' },
  notifications: { title: 'Notifications', subtitle: 'Updates for bookings and schedule changes.' },
  profile: { title: 'Your profile', subtitle: 'Help us match you with the right clinician.' },
  doctors: { title: 'Find doctors', subtitle: 'Search by name, specialty, or symptoms.' },
  ai: { title: 'AI recommendations', subtitle: 'Describe symptoms to find the best fit.' },
  appointments: { title: 'Appointments', subtitle: 'Book, reschedule, or join consultations.' },
  records: { title: 'Medical records', subtitle: 'Visit summaries, notes, and prescriptions.' }
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

const PatientDashboardPage = ({ onLogout }) => {
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

  const profile = usePatientProfileForm(storedUser?.displayName || '');
  const discovery = useDoctorDiscovery();
  const recommendations = useRecommendations();
  const booking = useAppointmentBooking();
  const notifications = useNotifications();
  const medicalRecords = useMedicalRecords('patient');
  const consultationNotes = useConsultationNotes('patient');
  const prescriptionsHook = usePrescriptions('patient');

  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [appointmentTimeFilter, setAppointmentTimeFilter] = useState('upcoming');
  const [activeSection, setActiveSection] = useState(section || 'overview');

  useEffect(() => {
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [section, activeSection]);

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`/patient/${sectionId}`);
  };

  const patientNav = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'doctors', label: 'Find doctors' },
      { id: 'ai', label: 'AI recommendations' },
      { id: 'appointments', label: 'Appointments' },
      { id: 'records', label: 'Medical records' },
      { id: 'profile', label: 'Profile' },
      { id: 'notifications', label: 'Notifications', badge: notifications.unreadCount }
    ],
    [notifications.unreadCount]
  );

  const sectionMeta = PATIENT_SECTIONS[activeSection] || PATIENT_SECTIONS.overview;

  const doctorNameMap = useMemo(() => {
    const map = new Map();
    discovery.doctors.forEach((doctor) => {
      map.set(doctor.userId, doctor.name);
    });
    return map;
  }, [discovery.doctors]);

  const now = Date.now();
  const filteredAppointments = useMemo(() => {
    return booking.appointments.filter((appointment) => {
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
  }, [booking.appointments, appointmentStatusFilter, appointmentTimeFilter, now]);

  const appointmentCounts = useMemo(() => {
    return booking.appointments.reduce(
      (acc, appointment) => {
        acc.total += 1;
        if (appointment.status === 'scheduled') acc.scheduled += 1;
        if (appointment.status === 'completed') acc.completed += 1;
        if (appointment.status === 'canceled') acc.canceled += 1;
        return acc;
      },
      { total: 0, scheduled: 0, completed: 0, canceled: 0 }
    );
  }, [booking.appointments]);

  const handleExportRecords = () => {
    const rows = medicalRecords.records.map((record) => [
      record.id,
      record.appointment || '',
      record.summary || '',
      record.diagnosis || '',
      record.createdAt || ''
    ]);
    downloadPdf(
      'Medical records',
      ['id', 'appointmentId', 'summary', 'diagnosis', 'createdAt'],
      rows
    );
  };

  const handleExportPrescriptions = () => {
    const rows = prescriptionsHook.prescriptions.map((prescription) => [
      prescription.id,
      prescription.appointment || '',
      (prescription.medications || [])
        .map((med) => [med.name, med.dosage, med.frequency].filter(Boolean).join(' '))
        .join(' | '),
      prescription.notes || '',
      prescription.createdAt || ''
    ]);
    downloadPdf(
      'Prescriptions',
      ['id', 'appointmentId', 'medications', 'notes', 'createdAt'],
      rows
    );
  };

  if (profile.loading) {
    return (
      <AppShell
        roleLabel="Patient"
        userName={storedUser?.displayName}
        navItems={[{ id: 'overview', label: 'Overview' }]}
        activeSection="overview"
        onNavigate={() => {}}
        onLogout={onLogout}
        title="Loading..."
        subtitle="Setting up your profile"
        showEmergencyBanner
      >
        <div className="panel panel--loading">Loading your profile...</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      roleLabel="Patient"
      userName={storedUser?.displayName || profile.form.name}
      profilePictureUrl={profile.previewUrl}
      navItems={patientNav}
      activeSection={activeSection}
      onNavigate={handleNavigate}
      onLogout={onLogout}
      title={sectionMeta.title}
      subtitle={sectionMeta.subtitle}
      showEmergencyBanner
    >
      {activeSection === 'overview' && (
        <PatientOverviewPanel
          appointmentCounts={appointmentCounts}
          recordsCount={medicalRecords.records.length}
          notesCount={consultationNotes.notes.length}
          prescriptionsCount={prescriptionsHook.prescriptions.length}
          unreadCount={notifications.unreadCount}
          onNavigate={handleNavigate}
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
        <PatientProfilePanel
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

      {activeSection === 'ai' && (
        <PatientAiPanel
          recommendations={recommendations.recommendations}
          recommendationQuery={recommendations.recommendationQuery}
          recommendationStatus={recommendations.recommendationStatus}
          availabilityMap={discovery.availabilityMap}
          selectedSlot={booking.selectedSlot}
          setRecommendationQuery={recommendations.setRecommendationQuery}
          handleRecommendation={recommendations.handleRecommendation}
          handleLoadAvailability={discovery.handleLoadAvailability}
          handleSelectSlot={booking.handleSelectSlot}
          onOpenConfirm={booking.handleOpenConfirm}
        />
      )}

      {activeSection === 'appointments' && (
        <PatientAppointmentsPanel
          appointmentsStatus={booking.appointmentsStatus}
          bookingStatus={booking.bookingStatus}
          actionStatus={booking.actionStatus}
          hasSelection={booking.hasSelection}
          selectedSlot={booking.selectedSlot}
          loadingAppointments={booking.loadingAppointments}
          filteredAppointments={filteredAppointments}
          appointmentStatusFilter={appointmentStatusFilter}
          appointmentTimeFilter={appointmentTimeFilter}
          doctorNameMap={doctorNameMap}
          rescheduleId={booking.rescheduleId}
          rescheduleAt={booking.rescheduleAt}
          actionLoading={booking.actionLoading}
          buildReminderLabel={buildReminderLabel}
          onStatusFilterChange={(event) => setAppointmentStatusFilter(event.target.value)}
          onTimeFilterChange={(event) => setAppointmentTimeFilter(event.target.value)}
          onOpenConfirm={booking.handleOpenConfirm}
          onClearSelection={booking.handleClearSelection}
          onStartReschedule={booking.handleStartReschedule}
          onRequestCancel={booking.handleRequestCancel}
          onFetchMeeting={booking.handleFetchMeeting}
          onRescheduleChange={booking.handleRescheduleChange}
          onRescheduleSubmit={booking.handleRescheduleSubmit}
          onCancelReschedule={booking.handleCancelReschedule}
          onNavigateToDoctors={() => handleNavigate('doctors')}
        />
      )}

      {booking.isConfirmOpen && booking.selectedSlot && (
        <PatientBookingConfirmModal
          selectedSlot={booking.selectedSlot}
          bookingForm={booking.bookingForm}
          submitting={booking.submitting}
          onClose={booking.handleCloseConfirm}
          onSubmit={booking.handleBookingSubmit}
          onChange={booking.handleBookingChange}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(booking.cancelTargetId)}
        title="Cancel appointment?"
        message="This will free up the time slot. You can always book a new consultation later."
        confirmLabel="Yes, cancel"
        loading={booking.actionLoading}
        onConfirm={booking.handleConfirmCancel}
        onCancel={booking.handleDismissCancel}
      />

      {booking.hasSelection && !booking.isConfirmOpen && (
        <BookingBar
          selectedSlot={booking.selectedSlot}
          onConfirm={booking.handleOpenConfirm}
          onClear={booking.handleClearSelection}
          onNavigate={
            activeSection !== 'doctors' ? () => handleNavigate('doctors') : undefined
          }
        />
      )}

      {activeSection === 'records' && (
        <PatientRecordsPanel
          records={medicalRecords.records}
          notes={consultationNotes.notes}
          prescriptions={prescriptionsHook.prescriptions}
          recordStatus={medicalRecords.status}
          noteStatus={consultationNotes.status}
          prescriptionStatus={prescriptionsHook.status}
          recordLoading={medicalRecords.loading}
          noteLoading={consultationNotes.loading}
          prescriptionLoading={prescriptionsHook.loading}
          onExportRecords={handleExportRecords}
          onExportPrescriptions={handleExportPrescriptions}
          onNavigateToDoctors={() => handleNavigate('doctors')}
        />
      )}

      {activeSection === 'doctors' && (
        <PatientDoctorDiscoveryPanel
          doctors={discovery.doctors}
          doctorQuery={discovery.doctorQuery}
          specializationQuery={discovery.specializationQuery}
          doctorStatus={discovery.doctorStatus}
          availabilityMap={discovery.availabilityMap}
          selectedSlot={booking.selectedSlot}
          setDoctorQuery={discovery.setDoctorQuery}
          setSpecializationQuery={discovery.setSpecializationQuery}
          handleDoctorSearch={discovery.handleDoctorSearch}
          handleLoadAvailability={discovery.handleLoadAvailability}
          handleSelectSlot={booking.handleSelectSlot}
          onOpenConfirm={booking.handleOpenConfirm}
        />
      )}
    </AppShell>
  );
};

export default PatientDashboardPage;
