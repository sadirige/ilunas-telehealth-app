import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createDoctorAvailability,
  deleteDoctorAvailability,
  getDoctorAvailabilities
} from '../api/client';

const emptyForm = {
  startAt: '',
  endAt: '',
  slotMinutes: '30'
};

const formatLocalDateTime = (date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
};

const useDoctorAvailability = () => {
  const [form, setForm] = useState(emptyForm);
  const [availabilities, setAvailabilities] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    if (!form.startAt || !form.endAt) {
      return { slots: [], error: '' };
    }

    const startDate = new Date(form.startAt);
    const endDate = new Date(form.endAt);
    const slotMinutes = Number(form.slotMinutes);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { slots: [], error: 'Start and end must be valid dates.' };
    }

    if (!slotMinutes || slotMinutes <= 0) {
      return { slots: [], error: 'Slot duration must be at least 1 minute.' };
    }

    if (endDate <= startDate) {
      return { slots: [], error: 'End time must be after start time.' };
    }

    const durationMs = endDate.getTime() - startDate.getTime();
    const slotMs = slotMinutes * 60000;
    const slotCount = Math.floor(durationMs / slotMs);

    if (slotCount <= 0) {
      return { slots: [], error: 'Time range must be at least one slot long.' };
    }

    const slots = Array.from({ length: slotCount }, (_, index) => {
      const slotStart = new Date(startDate.getTime() + index * slotMs);
      const slotEnd = new Date(slotStart.getTime() + slotMs);
      return { startAt: slotStart, endAt: slotEnd };
    });

    return { slots, error: '' };
  }, [form.startAt, form.endAt, form.slotMinutes]);

  const loadAvailabilities = useCallback(async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = await getDoctorAvailabilities();
      setAvailabilities(data.results || []);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailabilities();
  }, [loadAvailabilities]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const startDate = new Date(form.startAt);
      const endDate = new Date(form.endAt);
      const slotMinutes = Number(form.slotMinutes);

      if (!form.startAt || Number.isNaN(startDate.getTime())) {
        throw new Error('Start time is required');
      }

      if (!slotMinutes || slotMinutes <= 0) {
        throw new Error('Slot duration must be at least 1 minute');
      }

      if (!form.endAt || Number.isNaN(endDate.getTime())) {
        throw new Error('End time is required');
      }

      if (endDate <= startDate) {
        throw new Error('End time must be after start time');
      }

      const durationMs = endDate.getTime() - startDate.getTime();
      const slotMs = slotMinutes * 60000;
      const slotCount = Math.floor(durationMs / slotMs);

      if (slotCount <= 0) {
        throw new Error('Time range must be at least one slot long');
      }

      const requests = Array.from({ length: slotCount }, (_, index) => {
        const slotStart = new Date(startDate.getTime() + index * slotMs);
        const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60000);

        return createDoctorAvailability({
          startAt: formatLocalDateTime(slotStart),
          endAt: formatLocalDateTime(slotEnd)
        });
      });

      await Promise.all(requests);
      setStatus({ type: 'success', message: 'Availability added.' });
      setForm(emptyForm);
      await loadAvailabilities();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (availabilityId) => {
    setStatus({ type: 'idle', message: '' });

    try {
      await deleteDoctorAvailability(availabilityId);
      setAvailabilities((prev) => prev.filter((item) => item.id !== availabilityId));
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  return {
    form,
    availabilities,
    previewSlots: preview.slots,
    previewError: preview.error,
    status,
    loading,
    saving,
    handleChange,
    handleSubmit,
    handleDelete
  };
};

export default useDoctorAvailability;
