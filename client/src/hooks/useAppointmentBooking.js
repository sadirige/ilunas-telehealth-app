import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelAppointment,
  createAppointment,
  getAppointmentMeeting,
  getPatientAppointments,
  rescheduleAppointment
} from '../api/client';

const defaultForm = {
  durationMinutes: '30',
  reason: ''
};

const useAppointmentBooking = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentsStatus, setAppointmentsStatus] = useState({ type: 'idle', message: '' });
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState(defaultForm);
  const [bookingStatus, setBookingStatus] = useState({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [actionStatus, setActionStatus] = useState({ type: 'idle', message: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [rescheduleId, setRescheduleId] = useState('');
  const [rescheduleAt, setRescheduleAt] = useState('');

  const hasSelection = useMemo(() => Boolean(selectedSlot), [selectedSlot]);

  const loadAppointments = useCallback(async () => {
    setLoadingAppointments(true);
    setAppointmentsStatus({ type: 'idle', message: '' });

    try {
      const data = await getPatientAppointments();
      setAppointments(data.results || []);
    } catch (error) {
      setAppointmentsStatus({ type: 'error', message: error.message });
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleSelectSlot = (doctor, slot) => {
    setSelectedSlot({ doctor, slot });
    setBookingStatus({ type: 'idle', message: '' });
    setIsConfirmOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedSlot(null);
    setBookingStatus({ type: 'idle', message: '' });
    setIsConfirmOpen(false);
  };

  const handleOpenConfirm = () => {
    if (selectedSlot) {
      setIsConfirmOpen(true);
    }
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
  };

  const formatLocalDateTime = (value) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const local = new Date(date.getTime() - offsetMs);
    return local.toISOString().slice(0, 16);
  };

  const handleStartReschedule = (appointment) => {
    setRescheduleId(appointment.id);
    setRescheduleAt(formatLocalDateTime(appointment.scheduledAt));
    setActionStatus({ type: 'idle', message: '' });
  };

  const handleRescheduleChange = (event) => {
    setRescheduleAt(event.target.value);
  };

  const handleCancelReschedule = () => {
    setRescheduleId('');
    setRescheduleAt('');
  };

  const handleRescheduleSubmit = async (event) => {
    event.preventDefault();

    if (!rescheduleId || !rescheduleAt) {
      setActionStatus({ type: 'error', message: 'Select a new date and time.' });
      return;
    }

    setActionLoading(true);
    setActionStatus({ type: 'idle', message: '' });

    try {
      await rescheduleAppointment(rescheduleId, { scheduledAt: rescheduleAt });
      setActionStatus({ type: 'success', message: 'Appointment rescheduled.' });
      setRescheduleId('');
      setRescheduleAt('');
      await loadAppointments();
    } catch (error) {
      setActionStatus({ type: 'error', message: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    setActionLoading(true);
    setActionStatus({ type: 'idle', message: '' });

    try {
      await cancelAppointment(appointmentId);
      setActionStatus({ type: 'success', message: 'Appointment canceled.' });
      await loadAppointments();
    } catch (error) {
      setActionStatus({ type: 'error', message: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFetchMeeting = async (appointmentId) => {
    setActionLoading(true);
    setActionStatus({ type: 'idle', message: '' });

    try {
      const data = await getAppointmentMeeting(appointmentId);
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId
            ? {
                ...item,
                meetingUrl: data.meeting?.meetingUrl || item.meetingUrl,
                meetingProvider: data.meeting?.meetingProvider || item.meetingProvider,
                meetingHostUrl: data.meeting?.meetingHostUrl || item.meetingHostUrl,
                meetingMeta: data.meeting?.meetingMeta || item.meetingMeta
              }
            : item
        )
      );
    } catch (error) {
      setActionStatus({ type: 'error', message: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSlot) {
      setBookingStatus({ type: 'error', message: 'Select an available slot to book.' });
      return;
    }

    setSubmitting(true);
    setBookingStatus({ type: 'idle', message: '' });

    try {
      const durationMinutes = Number(bookingForm.durationMinutes) || 30;
      const payload = {
        doctorProfileId: selectedSlot.doctor.id,
        scheduledAt: selectedSlot.slot.startAt,
        durationMinutes,
        reason: bookingForm.reason.trim()
      };

      await createAppointment(payload);
      setBookingStatus({ type: 'success', message: 'Appointment booked successfully.' });
      setBookingForm(defaultForm);
      setSelectedSlot(null);
      setIsConfirmOpen(false);
      await loadAppointments();
    } catch (error) {
      setBookingStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
};

export default useAppointmentBooking;
