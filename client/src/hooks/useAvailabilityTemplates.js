import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyAvailabilityTemplates,
  createAvailabilityTemplate,
  deleteAvailabilityTemplate,
  getAvailabilityTemplates,
  updateAvailabilityTemplate
} from '../api/client';
import { previewTemplateSlots } from '../utils/availabilityTemplates';

const emptyTemplateForm = {
  weekdays: [],
  startTime: '09:00',
  endTime: '17:00',
  slotMinutes: '30',
  label: '',
  applyWeeks: '4'
};

const useAvailabilityTemplates = (onApplied) => {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyTemplateForm);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = await getAvailabilityTemplates();
      setTemplates(data.results || []);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const applyWeeks = Number(form.applyWeeks) || 4;

  const previewCount = useMemo(() => {
    if (form.weekdays.length === 0) return 0;

    const draftTemplates = form.weekdays.map((weekday) => ({
      weekday,
      startTime: form.startTime,
      endTime: form.endTime,
      slotMinutes: Number(form.slotMinutes) || 30,
      isActive: true
    }));

    return previewTemplateSlots(draftTemplates, applyWeeks);
  }, [form, applyWeeks]);

  const activePreviewCount = useMemo(
    () => previewTemplateSlots(templates.filter((t) => t.isActive), applyWeeks),
    [templates, applyWeeks]
  );

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === 'weekday') {
      setForm((prev) => {
        const weekdays = checked
          ? [...prev.weekdays, Number(value)]
          : prev.weekdays.filter((d) => d !== Number(value));
        return { ...prev, weekdays: weekdays.sort((a, b) => a - b) };
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreateTemplates = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      if (form.weekdays.length === 0) {
        throw new Error('Select at least one day of the week');
      }

      if (form.endTime <= form.startTime) {
        throw new Error('End time must be after start time');
      }

      const slotMinutes = Number(form.slotMinutes);
      if (!slotMinutes || slotMinutes <= 0) {
        throw new Error('Slot duration must be at least 1 minute');
      }

      const weeks = Number(form.applyWeeks) || 0;
      let totalCreated = 0;

      for (const weekday of form.weekdays) {
        const data = await createAvailabilityTemplate({
          weekday,
          startTime: form.startTime,
          endTime: form.endTime,
          slotMinutes,
          label: form.label.trim(),
          applyWeeks: weeks
        });
        totalCreated += data.applyResult?.created || 0;
      }

      const dayCount = form.weekdays.length;
      setStatus({
        type: 'success',
        message:
          weeks > 0
            ? `${dayCount} template${dayCount === 1 ? '' : 's'} saved. ${totalCreated} slot(s) added to your calendar.`
            : `${dayCount} weekly template${dayCount === 1 ? '' : 's'} saved.`
      });

      setForm(emptyTemplateForm);
      await loadTemplates();
      if (weeks > 0 && onApplied) {
        await onApplied();
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (template) => {
    setStatus({ type: 'idle', message: '' });

    try {
      const data = await updateAvailabilityTemplate(template.id, {
        isActive: !template.isActive
      });
      setTemplates((prev) =>
        prev.map((item) => (item.id === template.id ? data.template : item))
      );
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    setStatus({ type: 'idle', message: '' });

    try {
      await deleteAvailabilityTemplate(templateId);
      setTemplates((prev) => prev.filter((item) => item.id !== templateId));
      setStatus({ type: 'success', message: 'Template removed.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleApplyAll = async (weeksAhead = 4) => {
    setApplying(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = await applyAvailabilityTemplates(weeksAhead);
      const { created, skipped } = data.applyResult || {};
      setStatus({
        type: 'success',
        message: `${created || 0} slot(s) added${skipped ? ` (${skipped} already existed)` : ''}.`
      });
      if (onApplied) {
        await onApplied();
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setApplying(false);
    }
  };

  return {
    templates,
    templateForm: form,
    templateStatus: status,
    templatesLoading: loading,
    templatesSaving: saving,
    templatesApplying: applying,
    templatePreviewCount: previewCount,
    activeTemplatePreviewCount: activePreviewCount,
    handleTemplateFormChange: handleFormChange,
    handleCreateTemplates,
    handleToggleActive,
    handleDeleteTemplate,
    handleApplyAll,
    reloadTemplates: loadTemplates
  };
};

export default useAvailabilityTemplates;
