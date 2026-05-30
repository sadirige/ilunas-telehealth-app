import { useCallback, useEffect, useMemo, useState } from 'react';
import { createMedicalRecord, getDoctorRecords, getPatientRecords } from '../api/client';

const emptyForm = {
  appointmentId: '',
  summary: '',
  diagnosis: ''
};

const useMedicalRecords = (role) => {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = role === 'doctor' ? await getDoctorRecords() : await getPatientRecords();
      setRecords(data.results || []);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (role !== 'doctor') {
      return;
    }

    if (!form.appointmentId || !form.summary.trim()) {
      setStatus({ type: 'error', message: 'Appointment and summary are required.' });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const payload = {
        appointmentId: form.appointmentId,
        summary: form.summary.trim(),
        diagnosis: form.diagnosis.trim()
      };
      const data = await createMedicalRecord(payload);
      setRecords((prev) => [data.record, ...prev]);
      setForm(emptyForm);
      setStatus({ type: 'success', message: 'Medical record saved.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const hasRecords = useMemo(() => records.length > 0, [records]);

  return {
    records,
    status,
    loading,
    saving,
    form,
    hasRecords,
    handleChange,
    handleSubmit,
    reload: loadRecords
  };
};

export default useMedicalRecords;
