import { useState } from 'react';
import FormField from '../ui/FormField';
import ConfirmDialog from '../ui/ConfirmDialog';
import {
  formatTime12h,
  getWeekdayLabel,
  WEEKDAYS
} from '../../utils/datetime';
import { formatTemplateSummary } from '../../utils/availabilityTemplates';

const APPLY_WEEK_OPTIONS = [
  { value: '0', label: 'Save only (don\'t apply yet)' },
  { value: '2', label: 'Apply for next 2 weeks' },
  { value: '4', label: 'Apply for next 4 weeks' },
  { value: '8', label: 'Apply for next 8 weeks' }
];

const WeeklyTemplatesSection = ({
  templates,
  templateForm,
  templateStatus,
  templatesLoading,
  templatesSaving,
  templatesApplying,
  templatePreviewCount,
  activeTemplatePreviewCount,
  onFormChange,
  onCreateTemplates,
  onToggleActive,
  onDeleteTemplate,
  onApplyAll
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [applyWeeks, setApplyWeeks] = useState('4');

  const syncSlotMinutes = (minutes) => {
    onFormChange({ target: { name: 'slotMinutes', value: minutes } });
  };

  return (
    <div className="weekly-templates">
      {templateStatus.type !== 'idle' && (
        <div className={`alert alert--${templateStatus.type}`} role="status">
          {templateStatus.message}
        </div>
      )}

      <form className="form weekly-templates__form" onSubmit={onCreateTemplates}>
        <fieldset className="weekly-templates__days">
          <legend className="field__label">Repeat on</legend>
          <div className="weekday-picker">
            {WEEKDAYS.map((day) => {
              const checked = templateForm.weekdays.includes(day.value);
              return (
                <label
                  key={day.value}
                  className={`weekday-picker__day ${checked ? 'weekday-picker__day--active' : ''}`}
                >
                  <input
                    type="checkbox"
                    name="weekday"
                    value={day.value}
                    checked={checked}
                    onChange={onFormChange}
                  />
                  <span>{day.short}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="form form--grid form--section-inner">
          <FormField label="Start time" required>
            <input
              type="time"
              name="startTime"
              value={templateForm.startTime}
              onChange={onFormChange}
              required
            />
          </FormField>

          <FormField label="End time" required>
            <input
              type="time"
              name="endTime"
              value={templateForm.endTime}
              onChange={onFormChange}
              required
            />
          </FormField>

          <FormField label="Slot length" hint="Matches your calendar slot length">
            <div className="duration-presets">
              {['30', '45', '60'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    templateForm.slotMinutes === value
                      ? 'duration-preset duration-preset--active'
                      : 'duration-preset'
                  }
                  onClick={() => syncSlotMinutes(value)}
                >
                  {value} min
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Label (optional)" hint="e.g. Morning clinic">
            <input
              type="text"
              name="label"
              value={templateForm.label}
              onChange={onFormChange}
              placeholder="Morning clinic"
            />
          </FormField>

          <FormField
            label="When saving"
            hint={
              templatePreviewCount > 0
                ? `Will create up to ${templatePreviewCount} bookable slot(s) across selected days`
                : 'Select days and times to preview slot count'
            }
            className="form--span"
          >
            <select name="applyWeeks" value={templateForm.applyWeeks} onChange={onFormChange}>
              {APPLY_WEEK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <button type="submit" className="primary" disabled={templatesSaving}>
          {templatesSaving ? 'Saving...' : 'Save weekly template'}
        </button>
      </form>

      {templatesLoading ? (
        <p className="hint">Loading templates...</p>
      ) : templates.length === 0 ? (
        <div className="weekly-templates__empty">
          <p className="hint">No recurring templates yet.</p>
          <p className="hint hint--subtle">
            Example: Every Mon, Wed, Fri from 9:00 AM to 5:00 PM with 30-minute slots.
          </p>
        </div>
      ) : (
        <div className="weekly-templates__list">
          <div className="weekly-templates__list-header">
            <h4>Saved templates ({templates.length})</h4>
            <div className="weekly-templates__apply-row">
              <select
                value={applyWeeks}
                onChange={(event) => setApplyWeeks(event.target.value)}
                aria-label="Weeks to apply"
              >
                <option value="2">2 weeks</option>
                <option value="4">4 weeks</option>
                <option value="8">8 weeks</option>
              </select>
              <button
                type="button"
                className="primary primary--compact"
                onClick={() => onApplyAll(Number(applyWeeks))}
                disabled={templatesApplying || !templates.some((t) => t.isActive)}
              >
                {templatesApplying ? 'Applying...' : 'Apply all active'}
              </button>
            </div>
          </div>

          {activeTemplatePreviewCount > 0 && (
            <p className="hint hint--subtle">
              Active templates can generate up to {activeTemplatePreviewCount} slot(s) over{' '}
              {applyWeeks} weeks (excluding duplicates).
            </p>
          )}

          <ul className="template-list">
            {templates.map((template) => (
              <li
                key={template.id}
                className={`template-list__item ${!template.isActive ? 'template-list__item--inactive' : ''}`}
              >
                <div className="template-list__info">
                  <span className="template-list__day">{getWeekdayLabel(template.weekday)}</span>
                  <span className="template-list__times">
                    {formatTime12h(template.startTime)} – {formatTime12h(template.endTime)}
                  </span>
                  <span className="template-list__meta">
                    {template.slotMinutes} min slots
                    {template.label ? ` · ${template.label}` : ''}
                  </span>
                </div>
                <div className="template-list__actions">
                  <label className="template-list__toggle">
                    <input
                      type="checkbox"
                      checked={template.isActive}
                      onChange={() => onToggleActive(template)}
                    />
                    <span>{template.isActive ? 'Active' : 'Paused'}</span>
                  </label>
                  <button
                    type="button"
                    className="ghost ghost--compact ghost--danger"
                    onClick={() => setDeleteTarget(template)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Remove template?"
        message={
          deleteTarget
            ? `Remove "${formatTemplateSummary(deleteTarget, formatTime12h, getWeekdayLabel)}"? Existing calendar slots are not affected.`
            : 'This template will be removed. Existing calendar slots are not affected.'
        }
        confirmLabel="Remove"
        onConfirm={() => {
          onDeleteTemplate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default WeeklyTemplatesSection;
