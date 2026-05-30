import { useState } from 'react';
import FormField from '../ui/FormField';
import ConfirmDialog from '../ui/ConfirmDialog';
import DisclosurePanel from '../ui/DisclosurePanel';
import WeeklyTemplatesSection from './WeeklyTemplatesSection';
import WeekCalendar from './WeekCalendar';
import {
  formatAvailabilityRange,
  formatSlotTime,
  formatWeekRange,
  getTimezoneLabel
} from '../../utils/datetime';

const DURATION_PRESETS = [
  { label: '30 min', value: '30' },
  { label: '45 min', value: '45' },
  { label: '60 min', value: '60' }
];

const DoctorAvailabilityPanel = ({
  availabilityForm,
  availabilities,
  weekStart,
  weekAvailabilities,
  calendarSelection,
  previewSlots,
  previewError,
  availabilityStatus,
  availabilityLoading,
  availabilitySaving,
  handleAvailabilityChange,
  handleAvailabilitySubmit,
  handleAvailabilityDelete,
  handleWeekChange,
  handleGoToToday,
  handleCalendarSelectRange,
  handleCalendarClearSelection,
  handleCalendarSubmit,
  templates,
  templateForm,
  templateStatus,
  templatesLoading,
  templatesSaving,
  templatesApplying,
  templatePreviewCount,
  activeTemplatePreviewCount,
  handleTemplateFormChange,
  handleCreateTemplates,
  handleToggleActive,
  handleDeleteTemplate,
  handleApplyAll
}) => {
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const applyDurationPreset = (minutes) => {
    handleAvailabilityChange({ target: { name: 'slotMinutes', value: minutes } });
    handleTemplateFormChange({ target: { name: 'slotMinutes', value: minutes } });
  };

  const deleteTarget = deleteTargetId
    ? availabilities.find((item) => item.id === deleteTargetId)
    : null;

  return (
    <section className="panel panel--availability">
      <div className="section__header section__header--compact">
        <div>
          <h2>Manage availability</h2>
          <p>Drag on the calendar to add slots. Expand sections below for templates and other options.</p>
        </div>
      </div>

      {availabilityStatus.type !== 'idle' && (
        <div className={`alert alert--${availabilityStatus.type}`} role="status">
          {availabilityStatus.message}
        </div>
      )}

      <div className="availability-calendar-primary">
        <div className="availability-calendar-primary__toolbar">
          <div className="duration-presets duration-presets--toolbar">
            <span className="availability-toolbar__label">Slot length</span>
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={
                  availabilityForm.slotMinutes === preset.value
                    ? 'duration-preset duration-preset--active'
                    : 'duration-preset'
                }
                onClick={() => applyDurationPreset(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <span className="slot-picker__tz">{getTimezoneLabel()}</span>
        </div>

        {availabilityLoading ? (
          <p className="hint">Loading calendar...</p>
        ) : (
          <WeekCalendar
            weekStart={weekStart}
            weekRangeLabel={formatWeekRange(weekStart)}
            availabilities={weekAvailabilities}
            slotMinutes={Number(availabilityForm.slotMinutes) || 30}
            pendingSelection={calendarSelection}
            saving={availabilitySaving}
            onWeekChange={handleWeekChange}
            onGoToToday={handleGoToToday}
            onSelectRange={handleCalendarSelectRange}
            onClearSelection={handleCalendarClearSelection}
            onSubmitSelection={handleCalendarSubmit}
            onDeleteSlot={(slot) => setDeleteTargetId(slot.id)}
          />
        )}

        {calendarSelection && previewSlots.length > 0 && (
          <div className="availability__preview availability__preview--compact">
            <p className="hint">
              {previewSlots.length} bookable slot{previewSlots.length === 1 ? '' : 's'}:{' '}
              {previewSlots.slice(0, 6).map((slot) => formatSlotTime(slot.startAt)).join(', ')}
              {previewSlots.length > 6 ? ` +${previewSlots.length - 6} more` : ''}
            </p>
            {previewError && <p className="hint hint--error">{previewError}</p>}
          </div>
        )}
      </div>

      <div className="availability-disclosures">
        <DisclosurePanel
          title="Recurring weekly templates"
          description="Set regular hours once, then apply to upcoming weeks"
          badge={templates.length > 0 ? templates.length : undefined}
          defaultOpen={templates.length === 0}
        >
          <WeeklyTemplatesSection
            templates={templates}
            templateForm={templateForm}
            templateStatus={templateStatus}
            templatesLoading={templatesLoading}
            templatesSaving={templatesSaving}
            templatesApplying={templatesApplying}
            templatePreviewCount={templatePreviewCount}
            activeTemplatePreviewCount={activeTemplatePreviewCount}
            onFormChange={handleTemplateFormChange}
            onCreateTemplates={handleCreateTemplates}
            onToggleActive={handleToggleActive}
            onDeleteTemplate={handleDeleteTemplate}
            onApplyAll={handleApplyAll}
          />
        </DisclosurePanel>

        <DisclosurePanel
          title="Manual entry"
          description="Add a specific date and time without using the calendar"
        >
          <form className="form form--grid form--section-inner" onSubmit={handleAvailabilitySubmit}>
            <FormField label="Start" required>
              <input
                type="datetime-local"
                name="startAt"
                value={availabilityForm.startAt}
                onChange={handleAvailabilityChange}
                required
              />
            </FormField>

            <FormField label="End" required>
              <input
                type="datetime-local"
                name="endAt"
                value={availabilityForm.endAt}
                onChange={handleAvailabilityChange}
                required
              />
            </FormField>

            <FormField label="Slot duration (minutes)">
              <input
                type="number"
                name="slotMinutes"
                value={availabilityForm.slotMinutes}
                onChange={handleAvailabilityChange}
                min="1"
                className="duration-presets__custom"
              />
            </FormField>

            <button type="submit" className="primary form--span" disabled={availabilitySaving}>
              {availabilitySaving ? 'Saving...' : 'Add availability'}
            </button>
          </form>

          {!calendarSelection && previewSlots.length > 0 && availabilityForm.startAt && (
            <div className="slot-preview slot-preview--chips">
              {previewSlots.map((slot, index) => (
                <span key={`${slot.startAt.toISOString()}-${index}`} className="slot-chip slot-chip--preview">
                  {formatSlotTime(slot.startAt)}
                </span>
              ))}
            </div>
          )}
          {previewError && availabilityForm.startAt && (
            <p className="hint hint--error">{previewError}</p>
          )}
        </DisclosurePanel>

        {!availabilityLoading && availabilities.length > 0 && (
          <DisclosurePanel
            title="All saved slots"
            description="Upcoming bookable slots — past times are hidden"
            badge={availabilities.length}
          >
            <div className="availability__list availability__list--flat">
              {availabilities.map((slot) => (
                <div key={slot.id} className="availability__item">
                  <div>
                    <h4>{formatAvailabilityRange(slot.startAt, slot.endAt)}</h4>
                    <p className="hint hint--subtle">
                      {Math.round((new Date(slot.endAt) - new Date(slot.startAt)) / 60000)} min slot
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ghost ghost--compact ghost--danger"
                    onClick={() => setDeleteTargetId(slot.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </DisclosurePanel>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Remove availability?"
        message={
          deleteTarget
            ? `Remove ${formatAvailabilityRange(deleteTarget.startAt, deleteTarget.endAt)}? Patients will no longer be able to book this slot.`
            : 'Patients will no longer be able to book this time slot. Existing appointments are not affected.'
        }
        confirmLabel="Remove"
        loading={false}
        onConfirm={() => {
          handleAvailabilityDelete(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </section>
  );
};

export default DoctorAvailabilityPanel;
