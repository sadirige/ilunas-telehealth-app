import { useMemo, useState } from 'react';
import { groupSlotsByDate, formatSlotTime, slotDurationMinutes, getTimezoneLabel } from '../../utils/datetime';

const SlotPicker = ({ slots, selectedSlotId, onSelectSlot }) => {
  const dateGroups = useMemo(() => groupSlotsByDate(slots), [slots]);
  const [activeDateKey, setActiveDateKey] = useState(dateGroups[0]?.dateKey || '');

  const activeGroup = dateGroups.find((g) => g.dateKey === activeDateKey) || dateGroups[0];

  if (!slots.length) {
    return (
      <div className="slot-picker slot-picker--empty">
        <p className="hint">No available time slots</p>
        <p className="hint hint--subtle">Check back later for new openings</p>
      </div>
    );
  }

  return (
    <div className="slot-picker">
      <div className="slot-picker__header">
        <h4>Choose a time</h4>
        <span className="slot-picker__tz" title="Times shown in your local timezone">
          {getTimezoneLabel()}
        </span>
      </div>

      {dateGroups.length > 1 && (
        <div className="slot-picker__dates" role="tablist" aria-label="Available dates">
          {dateGroups.map((group) => (
            <button
              key={group.dateKey}
              type="button"
              role="tab"
              aria-selected={activeGroup?.dateKey === group.dateKey}
              className={
                activeGroup?.dateKey === group.dateKey
                  ? 'slot-picker__date slot-picker__date--active'
                  : 'slot-picker__date'
              }
              onClick={() => setActiveDateKey(group.dateKey)}
            >
              <span className="slot-picker__date-label">{group.label}</span>
              <span className="slot-picker__date-count">{group.slots.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="slot-picker__times" role="group" aria-label="Available times">
        {activeGroup?.slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const duration = slotDurationMinutes(slot);

          return (
            <button
              key={slot.id}
              type="button"
              className={
                isSelected ? 'slot-chip slot-chip--selected' : 'slot-chip'
              }
              onClick={() => onSelectSlot(slot)}
              aria-pressed={isSelected}
              aria-label={`${formatSlotTime(slot.startAt)}, ${duration} minutes${isSelected ? ', selected' : ''}`}
            >
              <span className="slot-chip__time">{formatSlotTime(slot.startAt)}</span>
              <span className="slot-chip__duration">{duration} min</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotPicker;
