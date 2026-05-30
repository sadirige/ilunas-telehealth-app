import { getWeekStart } from './datetime';

const applyTimeToDate = (date, timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const getDateForWeekday = (weekStart, weekday) => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + weekday);
  return d;
};

const buildSlotsInRange = (startDate, endDate, slotMinutes) => {
  const durationMs = endDate.getTime() - startDate.getTime();
  const slotMs = slotMinutes * 60000;
  const slotCount = Math.floor(durationMs / slotMs);
  if (slotCount <= 0) return [];

  return Array.from({ length: slotCount }, (_, index) => {
    const slotStart = new Date(startDate.getTime() + index * slotMs);
    const slotEnd = new Date(slotStart.getTime() + slotMs);
    return { startAt: slotStart, endAt: slotEnd };
  });
};

export const buildTemplateOccurrenceSlots = (template, weekStart) => {
  const dayDate = getDateForWeekday(weekStart, template.weekday);
  const startAt = applyTimeToDate(dayDate, template.startTime);
  const endAt = applyTimeToDate(dayDate, template.endTime);
  if (endAt <= startAt) return [];
  return buildSlotsInRange(startAt, endAt, template.slotMinutes);
};

export const previewTemplateSlots = (templates, weeksAhead = 4) => {
  const now = new Date();
  const weekStart = getWeekStart(now);
  let count = 0;

  for (let week = 0; week < weeksAhead; week += 1) {
    const currentWeekStart = new Date(weekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + week * 7);

    templates.forEach((template) => {
      if (!template.isActive) return;
      const slots = buildTemplateOccurrenceSlots(template, currentWeekStart);
      count += slots.filter((slot) => slot.startAt > now).length;
    });
  }

  return count;
};

export const formatTemplateSummary = (template, formatTime12h, getWeekdayLabel) =>
  `Every ${getWeekdayLabel(template.weekday)}, ${formatTime12h(template.startTime)} – ${formatTime12h(template.endTime)} (${template.slotMinutes} min slots)`;
