const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { Availability } = require('../models/Availability');
const { requireFields, formatMissingFieldsMessage } = require('../utils/validation');
const { createNotificationSafe } = require('../utils/notifications');

const router = express.Router();

const requireDoctor = [authenticate, requireRole(['doctor'])];
const requirePatient = [authenticate, requireRole(['patient'])];

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildAvailabilityResponse = (availability) => ({
  id: availability.id,
  doctor: availability.doctor,
  startAt: availability.startAt,
  endAt: availability.endAt,
  isAvailable: availability.isAvailable
});

router.post('/', requireDoctor, async (req, res, next) => {
  try {
    const { startAt, endAt } = req.body || {};
    const missing = requireFields({ startAt, endAt }, ['startAt', 'endAt']);

    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
    }

    const parsedStart = parseDate(startAt);
    const parsedEnd = parseDate(endAt);

    if (!parsedStart || !parsedEnd) {
      return res.status(400).json({ message: 'Invalid date format. Please provide valid start and end dates.' });
    }

    if (parsedEnd <= parsedStart) {
      return res.status(400).json({ message: 'End time must be after start time. Please check your availability window.' });
    }

    const availability = await Availability.create({
      doctor: req.user.id,
      startAt: parsedStart,
      endAt: parsedEnd,
      isAvailable: true
    });

    await createNotificationSafe({
      user: req.user.id,
      type: 'availability_created',
      title: 'Availability added',
      message: 'Your schedule was updated.',
      data: { availabilityId: availability.id }
    });

    return res.status(201).json({ availability: buildAvailabilityResponse(availability) });
  } catch (error) {
    return next(error);
  }
});

router.get('/doctor', requireDoctor, async (req, res, next) => {
  try {
    const availabilities = await Availability.find({ doctor: req.user.id })
      .sort({ startAt: 1 });

    return res.status(200).json({
      results: availabilities.map(buildAvailabilityResponse)
    });
  } catch (error) {
    return next(error);
  }
});

// Patient-facing availability lookup per doctor.
router.get('/doctor/:doctorId', requirePatient, async (req, res, next) => {
  try {
    const { from, to } = req.query || {};
    const parsedFrom = from ? parseDate(from) : null;
    const parsedTo = to ? parseDate(to) : null;

    if ((from && !parsedFrom) || (to && !parsedTo)) {
      return res.status(400).json({ message: 'Invalid date format in query parameters. Please provide valid dates.' });
    }

    if (parsedFrom && parsedTo && parsedTo <= parsedFrom) {
      return res.status(400).json({ message: 'End date must be after start date. Please check your date range.' });
    }

    const availabilityFilter = {
      doctor: req.params.doctorId,
      isAvailable: true
    };

    if (parsedFrom) {
      availabilityFilter.endAt = { $gte: parsedFrom };
    }

    if (parsedTo) {
      availabilityFilter.startAt = { $lte: parsedTo };
    }

    const availabilities = await Availability.find({
      ...availabilityFilter
    }).sort({ startAt: 1 });

    return res.status(200).json({
      results: availabilities.map(buildAvailabilityResponse)
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:availabilityId', requireDoctor, async (req, res, next) => {
  try {
    const availability = await Availability.findOneAndDelete({
      _id: req.params.availabilityId,
      doctor: req.user.id
    });

    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    await createNotificationSafe({
      user: req.user.id,
      type: 'availability_removed',
      title: 'Availability removed',
      message: 'Your schedule was updated.',
      data: { availabilityId: availability.id }
    });

    return res.status(200).json({ availability: buildAvailabilityResponse(availability) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
