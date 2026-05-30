import { useCallback, useEffect, useMemo, useState } from 'react';
import { createConsultationNote, getDoctorNotes, getPatientNotes } from '../api/client';

const emptyForm = {
  appointmentId: '',
  note: ''
};

const useConsultationNotes = (role) => {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = role === 'doctor' ? await getDoctorNotes() : await getPatientNotes();
      setNotes(data.results || []);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (role !== 'doctor') {
      return;
    }

    if (!form.appointmentId || !form.note.trim()) {
      setStatus({ type: 'error', message: 'Appointment and note are required.' });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const payload = {
        appointmentId: form.appointmentId,
        note: form.note.trim()
      };
      const data = await createConsultationNote(payload);
      setNotes((prev) => [data.note, ...prev]);
      setForm(emptyForm);
      setStatus({ type: 'success', message: 'Consultation note saved.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const hasNotes = useMemo(() => notes.length > 0, [notes]);

  return {
    notes,
    status,
    loading,
    saving,
    form,
    hasNotes,
    handleChange,
    handleSubmit,
    reload: loadNotes
  };
};

export { useConsultationNotes };
export default useConsultationNotes;
