import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  completeAppointment,
  getDoctorAppointments,
  setAppointmentMeeting,
  updateAppointmentStatus
} from '../api/client';

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'no_show', label: 'No show' },
  { value: 'completed', label: 'Completed' }
];

const useDoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState({ type: 'idle', message: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [meetingDrafts, setMeetingDrafts] = useState({});

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = await getDoctorAppointments();
      const results = data.results || [];
      setAppointments(results);
      setStatusDrafts(
        results.reduce((acc, item) => {
          acc[item.id] = item.status || 'scheduled';
          return acc;
        }, {})
      );
      setMeetingDrafts(
        results.reduce((acc, item) => {
          acc[item.id] = {
            meetingUrl: item.meetingUrl || '',
            meetingProvider: item.meetingProvider || 'custom',
            meetingHostUrl: item.meetingHostUrl || ''
          };
          return acc;
        }, {})
      );
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleStatusDraftChange = (appointmentId, value) => {
    setStatusDrafts((prev) => ({ ...prev, [appointmentId]: value }));
  };

  const handleMeetingDraftChange = (appointmentId, field, value) => {
    setMeetingDrafts((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [field]: value
      }
    }));
  };

  const handleSaveStatus = async (appointmentId) => {
    const nextStatus = statusDrafts[appointmentId];
    if (!nextStatus) {
      return;
    }

    setActionLoading(true);
    setActionStatus({ type: 'idle', message: '' });

    try {
      const data = await updateAppointmentStatus(appointmentId, { status: nextStatus });
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointmentId ? data.appointment : item))
      );
      setActionStatus({ type: 'success', message: 'Appointment status updated.' });
    } catch (error) {
      setActionStatus({ type: 'error', message: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (appointmentId) => {
    setActionLoading(true);
    setActionStatus({ type: 'idle', message: '' });

    try {
      const data = await completeAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointmentId ? data.appointment : item))
      );
      setStatusDrafts((prev) => ({ ...prev, [appointmentId]: 'completed' }));
      setActionStatus({ type: 'success', message: 'Appointment marked as completed.' });
    } catch (error) {
      setActionStatus({ type: 'error', message: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveMeeting = async (appointmentId) => {
    const draft = meetingDrafts[appointmentId] || {};

    if (!draft.meetingUrl) {
      setActionStatus({ type: 'error', message: 'Meeting URL is required.' });
      return;
    }

    setActionLoading(true);
    setActionStatus({ type: 'idle', message: '' });

    try {
      const data = await setAppointmentMeeting(appointmentId, {
        meetingUrl: draft.meetingUrl,
        meetingProvider: draft.meetingProvider,
        meetingHostUrl: draft.meetingHostUrl
      });
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointmentId ? data.appointment : item))
      );
      setActionStatus({ type: 'success', message: 'Meeting details saved.' });
    } catch (error) {
      setActionStatus({ type: 'error', message: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const meetingProviders = useMemo(
    () => [
      { value: 'custom', label: 'Custom' },
      { value: 'google_meet', label: 'Google Meet' },
      { value: 'zoom', label: 'Zoom' },
      { value: 'jitsi', label: 'Jitsi' }
    ],
    []
  );

  const canStartSession = (appointment, startWindowMinutes = 10) => {
    if (!appointment || appointment.status !== 'scheduled') {
      return false;
    }

    const scheduledAt = new Date(appointment.scheduledAt).getTime();
    if (Number.isNaN(scheduledAt)) {
      return false;
    }

    const diffMinutes = (scheduledAt - Date.now()) / 60000;
    return diffMinutes <= startWindowMinutes && diffMinutes >= -15;
  };

  const buildTodaySchedule = (appointments) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return appointments.filter((appointment) => {
      const scheduledAt = new Date(appointment.scheduledAt);
      return scheduledAt >= startOfDay && scheduledAt < endOfDay;
    });
  };

  return {
    appointments,
    status,
    loading,
    actionStatus,
    actionLoading,
    statusOptions,
    meetingProviders,
    canStartSession,
    buildTodaySchedule,
    statusDrafts,
    meetingDrafts,
    loadAppointments,
    handleStatusDraftChange,
    handleMeetingDraftChange,
    handleSaveStatus,
    handleComplete,
    handleSaveMeeting
  };
};

export default useDoctorAppointments;
