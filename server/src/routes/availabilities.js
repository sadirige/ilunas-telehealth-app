const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { Availability } = require('../models/Availability');
const { requireFields, formatMissingFieldsMessage } = require('../utils/validation');

const router = express.Router();

const requireDoctor = [authenticate, requireRole(['doctor'])];

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

    if (!parsedStart || !parsedEnd || parsedEnd <= parsedStart) {
      return res.status(400).json({ message: 'Availability window is invalid' });
    }

    const availability = await Availability.create({
      doctor: req.user.id,
      startAt: parsedStart,
      endAt: parsedEnd,
      isAvailable: true
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

router.delete('/:availabilityId', requireDoctor, async (req, res, next) => {
  try {
    const availability = await Availability.findOneAndDelete({
      _id: req.params.availabilityId,
      doctor: req.user.id
    });

    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    return res.status(200).json({ availability: buildAvailabilityResponse(availability) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
