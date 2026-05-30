import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildDateTime,
  formatSlotTime,
  getWeekDays,
  isPastDay,
  isToday
} from '../../utils/datetime';

export const CALENDAR_START_HOUR = 7;
export const CALENDAR_END_HOUR = 21;
export const CALENDAR_STEP_MINUTES = 30;

const TOTAL_ROWS =
  ((CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60) / CALENDAR_STEP_MINUTES;

const getResponsiveRowHeight = () => {
  if (typeof window === 'undefined') return 20;
  if (window.innerWidth >= 1400) return 16;
  if (window.innerWidth >= 1200) return 18;
  if (window.innerWidth <= 768) return 22;
  return 20;
};

const useCalendarRowHeight = () => {
  const [rowHeight, setRowHeight] = useState(getResponsiveRowHeight);

  useEffect(() => {
    const onResize = () => setRowHeight(getResponsiveRowHeight());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return rowHeight;
};

const formatHourLabel = (hour) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h} ${period}`;
};

const rowToTime = (row) => {
  const totalMinutes = CALENDAR_START_HOUR * 60 + row * CALENDAR_STEP_MINUTES;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return { hour, minute };
};

const WeekCalendar = ({
  weekStart,
  weekRangeLabel,
  availabilities,
  slotMinutes,
  pendingSelection,
  saving,
  onWeekChange,
  onGoToToday,
  onSelectRange,
  onClearSelection,
  onSubmitSelection,
  onDeleteSlot
}) => {
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const gridRef = useRef(null);
  const rowHeight = useCalendarRowHeight();
  const [drag, setDrag] = useState(null);

  const getBlockPosition = useCallback(
    (startAt, endAt) => {
      const start = new Date(startAt);
      const end = new Date(endAt);
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const gridStart = CALENDAR_START_HOUR * 60;
      const top = ((startMinutes - gridStart) / CALENDAR_STEP_MINUTES) * rowHeight;
      const height = ((endMinutes - startMinutes) / CALENDAR_STEP_MINUTES) * rowHeight;
      return { top, height };
    },
    [rowHeight]
  );

  const timeLabels = useMemo(() => {
    const labels = [];
    for (let hour = CALENDAR_START_HOUR; hour < CALENDAR_END_HOUR; hour += 1) {
      labels.push({ hour, label: formatHourLabel(hour) });
    }
    return labels;
  }, []);

  const slotsByDay = useMemo(() => {
    const map = new Map();
    weekDays.forEach((day) => map.set(day.toDateString(), []));

    availabilities.forEach((slot) => {
      const start = new Date(slot.startAt);
      const key = start.toDateString();
      if (map.has(key)) {
        map.get(key).push(slot);
      }
    });

    map.forEach((daySlots) => {
      daySlots.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    });

    return map;
  }, [availabilities, weekDays]);

  const isRowInPast = (day, row) => {
    if (!isToday(day)) return false;
    const endTime = rowToTime(row + 1);
    const slotEnd = buildDateTime(day, endTime.hour, endTime.minute);
    return slotEnd.getTime() <= Date.now();
  };

  const finalizeDrag = useCallback(
    (dragState) => {
      if (!dragState) return;

      const { day, startRow, endRow } = dragState;
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      const startTime = rowToTime(minRow);
      const endTime = rowToTime(maxRow + 1);

      const startAt = buildDateTime(day, startTime.hour, startTime.minute);
      const endAt = buildDateTime(day, endTime.hour, endTime.minute);

      onSelectRange({ startAt, endAt });
      setDrag(null);
    },
    [onSelectRange]
  );

  const handleCellMouseDown = (day, row, event) => {
    if (isPastDay(day) || isRowInPast(day, row) || saving) return;
    event.preventDefault();
    setDrag({ day, startRow: row, endRow: row });
  };

  const handleCellMouseEnter = (day, row) => {
    if (!drag || drag.day.toDateString() !== day.toDateString() || isRowInPast(day, row)) return;
    setDrag((prev) => (prev ? { ...prev, endRow: row } : null));
  };

  const handleMouseUp = () => {
    if (drag) {
      finalizeDrag(drag);
    }
  };

  const selectionStyle = useMemo(() => {
    if (!pendingSelection) return null;
    const { startAt, endAt } = pendingSelection;
    const start = new Date(startAt);
    const end = new Date(endAt);
    const dayKey = start.toDateString();
    const dayIndex = weekDays.findIndex((d) => d.toDateString() === dayKey);
    if (dayIndex < 0) return null;

    const { top, height } = getBlockPosition(start, end);
    return { dayIndex, top, height };
  }, [pendingSelection, weekDays, getBlockPosition]);

  const dragStyle = useMemo(() => {
    if (!drag) return null;
    const dayIndex = weekDays.findIndex((d) => d.toDateString() === drag.day.toDateString());
    if (dayIndex < 0) return null;

    const minRow = Math.min(drag.startRow, drag.endRow);
    const maxRow = Math.max(drag.startRow, drag.endRow);
    return {
      dayIndex,
      top: minRow * rowHeight,
      height: (maxRow - minRow + 1) * rowHeight
    };
  }, [drag, weekDays, rowHeight]);

  const gridHeight = TOTAL_ROWS * rowHeight;

  return (
    <div
      className="week-calendar"
      style={{ '--calendar-row-height': `${rowHeight}px` }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="week-calendar__toolbar">
        <div className="week-calendar__nav">
          <button type="button" className="ghost ghost--compact" onClick={() => onWeekChange(-1)}>
            ← Prev
          </button>
          <span className="week-calendar__range">{weekRangeLabel}</span>
          <button type="button" className="ghost ghost--compact" onClick={() => onWeekChange(1)}>
            Next →
          </button>
        </div>
        <button type="button" className="ghost ghost--compact" onClick={onGoToToday}>
          Today
        </button>
      </div>

      <div className="week-calendar__scroll" ref={gridRef}>
        <div className="week-calendar__header">
          <div className="week-calendar__corner" aria-hidden="true" />
          {weekDays.map((day) => (
            <div
              key={day.toDateString()}
              className={`week-calendar__day-header ${isToday(day) ? 'week-calendar__day-header--today' : ''}`}
            >
              <span className="week-calendar__weekday">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="week-calendar__date">{day.getDate()}</span>
            </div>
          ))}
        </div>

        <div className="week-calendar__body">
          <div className="week-calendar__times" aria-hidden="true">
            {timeLabels.map(({ hour, label }) => (
              <div
                key={hour}
                className="week-calendar__time-label"
                style={{ height: rowHeight * 2 }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="week-calendar__columns">
            {weekDays.map((day, dayIndex) => {
            const dayKey = day.toDateString();
            const past = isPastDay(day);
            const daySlots = slotsByDay.get(dayKey) || [];

            return (
              <div
                key={dayKey}
                className={`week-calendar__column ${past ? 'week-calendar__column--past' : ''}`}
                style={{ height: gridHeight }}
              >
                {!past &&
                  Array.from({ length: TOTAL_ROWS }, (_, row) => {
                    const rowPast = isRowInPast(day, row);
                    return (
                    <button
                      key={row}
                      type="button"
                      className={`week-calendar__cell ${rowPast ? 'week-calendar__cell--past' : ''}`}
                      style={{ height: rowHeight }}
                      aria-label={`Select time on ${day.toLocaleDateString()}`}
                      disabled={rowPast}
                      onMouseDown={(event) => handleCellMouseDown(day, row, event)}
                      onMouseEnter={() => handleCellMouseEnter(day, row)}
                    />
                    );
                  })}

                {daySlots.map((slot) => {
                  const { top, height } = getBlockPosition(slot.startAt, slot.endAt);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className="week-calendar__block"
                      style={{ top, height: Math.max(height - 2, Math.min(rowHeight, 18)) }}
                      title={`${formatSlotTime(slot.startAt)} – ${formatSlotTime(slot.endAt)}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteSlot(slot);
                      }}
                    >
                      <span className="week-calendar__block-time">
                        {formatSlotTime(slot.startAt)}
                      </span>
                    </button>
                  );
                })}

                {dragStyle?.dayIndex === dayIndex && (
                  <div
                    className="week-calendar__selection week-calendar__selection--dragging"
                    style={{ top: dragStyle.top, height: dragStyle.height }}
                  />
                )}

                {selectionStyle?.dayIndex === dayIndex && !drag && (
                  <div
                    className="week-calendar__selection"
                    style={{ top: selectionStyle.top, height: selectionStyle.height }}
                  />
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>

      <p className="week-calendar__hint hint hint--subtle">
        Click and drag on a day to select a time range. Click an existing block to remove it.
      </p>

      {pendingSelection && (
        <div className="week-calendar__action-panel">
          <div>
            <strong>New availability</strong>
            <p className="hint">
              {pendingSelection.startAt.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}{' '}
              · {formatSlotTime(pendingSelection.startAt)} –{' '}
              {formatSlotTime(pendingSelection.endAt)} · {slotMinutes} min slots
            </p>
          </div>
          <div className="week-calendar__action-buttons">
            <button
              type="button"
              className="primary primary--compact"
              onClick={onSubmitSelection}
              disabled={saving}
            >
              {saving ? 'Adding...' : 'Add slots'}
            </button>
            <button
              type="button"
              className="ghost ghost--compact"
              onClick={onClearSelection}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekCalendar;
