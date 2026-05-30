const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { Availability } = require('../models/Availability');
const { AvailabilityTemplate } = require('../models/AvailabilityTemplate');
const { requireFields, formatMissingFieldsMessage } = require('../utils/validation');
const { createNotificationSafe } = require('../utils/notifications');
const { generateTemplateSlots } = require('../utils/availabilitySlots');

const router = express.Router();

const requireDoctor = [authenticate, requireRole(['doctor'])];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const buildTemplateResponse = (template) => ({
  id: template.id,
  doctor: template.doctor,
  weekday: template.weekday,
  startTime: template.startTime,
  endTime: template.endTime,
  slotMinutes: template.slotMinutes,
  label: template.label || '',
  isActive: template.isActive
});

const validateTemplatePayload = (payload, { partial = false } = {}) => {
  const errors = [];
  const { weekday, startTime, endTime, slotMinutes } = payload || {};

  if (!partial || weekday !== undefined) {
    const day = Number(weekday);
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      errors.push('weekday must be 0 (Monday) through 6 (Sunday)');
    }
  }

  if (!partial || startTime !== undefined) {
    if (!startTime || !TIME_PATTERN.test(startTime)) {
      errors.push('startTime must be HH:MM (24-hour)');
    }
  }

  if (!partial || endTime !== undefined) {
    if (!endTime || !TIME_PATTERN.test(endTime)) {
      errors.push('endTime must be HH:MM (24-hour)');
    }
  }

  if (startTime && endTime && TIME_PATTERN.test(startTime) && TIME_PATTERN.test(endTime)) {
    if (endTime <= startTime) {
      errors.push('endTime must be after startTime');
    }
  }

  if (!partial || slotMinutes !== undefined) {
    const minutes = Number(slotMinutes);
    if (!minutes || minutes <= 0) {
      errors.push('slotMinutes must be at least 1');
    }
  }

  return errors;
};

const persistGeneratedSlots = async (doctorId, slots) => {
  let created = 0;
  let skipped = 0;

  for (const slot of slots) {
    const existing = await Availability.findOne({
      doctor: doctorId,
      startAt: slot.startAt,
      endAt: slot.endAt
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await Availability.create({
      doctor: doctorId,
      startAt: slot.startAt,
      endAt: slot.endAt,
      isAvailable: true
    });
    created += 1;
  }

  return { created, skipped };
};

router.get('/doctor', requireDoctor, async (req, res, next) => {
  try {
    const templates = await AvailabilityTemplate.find({ doctor: req.user.id }).sort({
      weekday: 1,
      startTime: 1
    });

    return res.status(200).json({
      results: templates.map(buildTemplateResponse)
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireDoctor, async (req, res, next) => {
  try {
    const { weekday, startTime, endTime, slotMinutes, label, isActive, applyWeeks } = req.body || {};
    const missing = requireFields({ weekday, startTime, endTime, slotMinutes }, [
      'weekday',
      'startTime',
      'endTime',
      'slotMinutes'
    ]);

    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
    }

    const validationErrors = validateTemplatePayload({ weekday, startTime, endTime, slotMinutes });
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join('. ') });
    }

    const template = await AvailabilityTemplate.create({
      doctor: req.user.id,
      weekday: Number(weekday),
      startTime,
      endTime,
      slotMinutes: Number(slotMinutes),
      label: label || '',
      isActive: isActive !== false
    });

    let applyResult = null;
    const weeks = Number(applyWeeks);

    if (weeks > 0) {
      const slots = generateTemplateSlots([template], { weeksAhead: weeks });
      applyResult = await persistGeneratedSlots(req.user.id, slots);
    }

    await createNotificationSafe({
      user: req.user.id,
      type: 'availability_created',
      title: 'Weekly template saved',
      message: applyResult
        ? `Template saved. ${applyResult.created} slot(s) added to your calendar.`
        : 'Your recurring schedule template was saved.',
      data: { templateId: template.id }
    });

    return res.status(201).json({
      template: buildTemplateResponse(template),
      applyResult
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:templateId', requireDoctor, async (req, res, next) => {
  try {
    const validationErrors = validateTemplatePayload(req.body || {}, { partial: true });
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join('. ') });
    }

    const updates = {};
    const { weekday, startTime, endTime, slotMinutes, label, isActive } = req.body || {};

    if (weekday !== undefined) updates.weekday = Number(weekday);
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (slotMinutes !== undefined) updates.slotMinutes = Number(slotMinutes);
    if (label !== undefined) updates.label = label;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const template = await AvailabilityTemplate.findOneAndUpdate(
      { _id: req.params.templateId, doctor: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    return res.status(200).json({ template: buildTemplateResponse(template) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:templateId', requireDoctor, async (req, res, next) => {
  try {
    const template = await AvailabilityTemplate.findOneAndDelete({
      _id: req.params.templateId,
      doctor: req.user.id
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    return res.status(200).json({ template: buildTemplateResponse(template) });
  } catch (error) {
    return next(error);
  }
});

router.post('/apply', requireDoctor, async (req, res, next) => {
  try {
    const weeksAhead = Number(req.body?.weeksAhead) || 4;

    if (weeksAhead <= 0 || weeksAhead > 52) {
      return res.status(400).json({ message: 'weeksAhead must be between 1 and 52' });
    }

    const templates = await AvailabilityTemplate.find({
      doctor: req.user.id,
      isActive: true
    });

    if (templates.length === 0) {
      return res.status(400).json({ message: 'No active templates to apply' });
    }

    const slots = generateTemplateSlots(templates, { weeksAhead });
    const applyResult = await persistGeneratedSlots(req.user.id, slots);

    await createNotificationSafe({
      user: req.user.id,
      type: 'availability_created',
      title: 'Schedule applied',
      message: `${applyResult.created} slot(s) added from your weekly templates.`,
      data: { weeksAhead }
    });

    return res.status(200).json({ applyResult, weeksAhead });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
