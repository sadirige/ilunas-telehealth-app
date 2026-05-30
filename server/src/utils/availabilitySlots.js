const parseTimeParts = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

const applyTimeToDate = (date, timeStr) => {
  const { hours, minutes } = parseTimeParts(timeStr);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const getMondayWeekStart = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
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

  if (slotCount <= 0) {
    return [];
  }

  return Array.from({ length: slotCount }, (_, index) => {
    const slotStart = new Date(startDate.getTime() + index * slotMs);
    const slotEnd = new Date(slotStart.getTime() + slotMs);
    return { startAt: slotStart, endAt: slotEnd };
  });
};

const buildTemplateOccurrence = (template, weekStart) => {
  const dayDate = getDateForWeekday(weekStart, template.weekday);
  const startAt = applyTimeToDate(dayDate, template.startTime);
  const endAt = applyTimeToDate(dayDate, template.endTime);

  if (endAt <= startAt) {
    return null;
  }

  return buildSlotsInRange(startAt, endAt, template.slotMinutes);
};

const generateTemplateSlots = (templates, { weeksAhead = 4, fromDate = new Date() } = {}) => {
  const now = new Date(fromDate);
  const weekStart = getMondayWeekStart(now);
  const allSlots = [];

  for (let week = 0; week < weeksAhead; week += 1) {
    const currentWeekStart = new Date(weekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + week * 7);

    templates.forEach((template) => {
      if (!template.isActive) {
        return;
      }

      const slots = buildTemplateOccurrence(template, currentWeekStart) || [];
      slots.forEach((slot) => {
        if (slot.startAt > now) {
          allSlots.push(slot);
        }
      });
    });
  }

  return allSlots;
};

module.exports = {
  parseTimeParts,
  applyTimeToDate,
  getMondayWeekStart,
  getDateForWeekday,
  buildSlotsInRange,
  buildTemplateOccurrence,
  generateTemplateSlots
};
