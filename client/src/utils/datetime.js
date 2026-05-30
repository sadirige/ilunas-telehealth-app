export const getTimezoneLabel = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Local time';
  }
};

export const formatSlotDate = (dateString, { weekday = 'short' } = {}) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday, month: 'short', day: 'numeric' });
};

export const formatSlotTime = (dateString) =>
  new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

export const formatSlotDateTime = (dateString, { long = false } = {}) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const dateStr = isToday
    ? 'Today'
    : date.toLocaleDateString('en-US', {
        weekday: long ? 'long' : 'short',
        month: long ? 'long' : 'short',
        day: 'numeric'
      });

  return `${dateStr} at ${formatSlotTime(dateString)}`;
};

export const formatLocalDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
};

export const slotDurationMinutes = (slot) =>
  Math.round((new Date(slot.endAt) - new Date(slot.startAt)) / 60000);

export const groupSlotsByDate = (slots) => {
  const groups = new Map();

  slots.forEach((slot) => {
    const key = new Date(slot.startAt).toDateString();
    if (!groups.has(key)) {
      groups.set(key, { dateKey: key, label: formatSlotDate(slot.startAt), slots: [] });
    }
    groups.get(key).slots.push(slot);
  });

  return Array.from(groups.values()).sort(
    (a, b) => new Date(a.slots[0].startAt) - new Date(b.slots[0].startAt)
  );
};

export const formatAvailabilityRange = (startAt, endAt) => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${formatSlotDate(startAt, { weekday: 'long' })}, ${formatSlotTime(startAt)} – ${formatSlotTime(endAt)}`;
  }

  return `${formatSlotDateTime(startAt)} – ${formatSlotDateTime(endAt)}`;
};

/** Monday-based week start (local time). */
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

export const getWeekDays = (weekStart) =>
  Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + index);
    return day;
  });

export const addWeeks = (weekStart, weeks) => {
  const next = new Date(weekStart);
  next.setDate(next.getDate() + weeks * 7);
  return next;
};

export const formatWeekRange = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = weekEnd.toLocaleDateString('en-US', {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: weekStart.getFullYear() !== weekEnd.getFullYear() ? 'numeric' : undefined
  });

  if (weekStart.getFullYear() !== new Date().getFullYear()) {
    return `${startStr} – ${endStr}, ${weekStart.getFullYear()}`;
  }

  return `${startStr} – ${endStr}`;
};

export const dateToLocalInput = (date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
};

export const buildDateTime = (day, hour, minute) => {
  const d = new Date(day);
  d.setHours(hour, minute, 0, 0);
  return d;
};

export const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

export const isToday = (date) => isSameDay(date, new Date());

export const isPastDay = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(date);
  check.setHours(0, 0, 0, 0);
  return check < today;
};

/** True when the slot's end time is at or before now. */
export const isPastSlot = (slot) => {
  const endAt = new Date(slot?.endAt ?? slot);
  if (Number.isNaN(endAt.getTime())) return false;
  return endAt.getTime() <= Date.now();
};

export const filterUpcomingSlots = (slots) => slots.filter((slot) => !isPastSlot(slot));

export const WEEKDAYS = [
  { value: 0, label: 'Monday', short: 'Mon' },
  { value: 1, label: 'Tuesday', short: 'Tue' },
  { value: 2, label: 'Wednesday', short: 'Wed' },
  { value: 3, label: 'Thursday', short: 'Thu' },
  { value: 4, label: 'Friday', short: 'Fri' },
  { value: 5, label: 'Saturday', short: 'Sat' },
  { value: 6, label: 'Sunday', short: 'Sun' }
];

export const formatTime12h = (time24) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const getWeekdayLabel = (weekday, { short = false } = {}) => {
  const match = WEEKDAYS.find((d) => d.value === weekday);
  if (!match) return '';
  return short ? match.short : match.label;
};
