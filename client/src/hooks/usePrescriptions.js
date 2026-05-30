import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPrescription, getDoctorPrescriptions, getPatientPrescriptions } from '../api/client';

const emptyForm = {
  appointmentId: '',
  medicationName: '',
  dosage: '',
  frequency: '',
  notes: ''
};

const normalizeMedications = (form) => {
  const name = form.medicationName.trim();
  if (!name) {
    return [];
  }

  return [
    {
      name,
      dosage: form.dosage.trim(),
      frequency: form.frequency.trim()
    }
  ];
};

const usePrescriptions = (role) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = role === 'doctor' ? await getDoctorPrescriptions() : await getPatientPrescriptions();
      setPrescriptions(data.results || []);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (role !== 'doctor') {
      return;
    }

    if (!form.appointmentId) {
      setStatus({ type: 'error', message: 'Appointment is required.' });
      return;
    }

    const medications = normalizeMedications(form);
    if (medications.length === 0) {
      setStatus({ type: 'error', message: 'Medication name is required.' });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const payload = {
        appointmentId: form.appointmentId,
        medications,
        notes: form.notes.trim()
      };
      const data = await createPrescription(payload);
      setPrescriptions((prev) => [data.prescription, ...prev]);
      setForm(emptyForm);
      setStatus({ type: 'success', message: 'Prescription saved.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const hasPrescriptions = useMemo(() => prescriptions.length > 0, [prescriptions]);

  return {
    prescriptions,
    status,
    loading,
    saving,
    form,
    hasPrescriptions,
    handleChange,
    handleSubmit,
    reload: loadPrescriptions
  };
};

export { usePrescriptions };
export default usePrescriptions;
