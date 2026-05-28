const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { PatientProfile } = require('../models/PatientProfile');
const {
  requireFields,
  requireNestedFields,
  formatMissingFieldsMessage
} = require('../utils/validation');

const router = express.Router();

const requirePatient = [authenticate, requireRole(['patient'])];

// Ensures Mongoose validators run on PATCH updates.
const updateOptions = { new: true, runValidators: true, context: 'query' };

router.post('/profile', requirePatient, async (req, res, next) => {
  try {
    const {
      name,
      birthday,
      weight,
      height,
      profilePictureUrl,
      contactDetails,
      medicalHistory
    } = req.body || {};

    const missingFields = requireFields(
      { name, birthday, weight, height, contactDetails, medicalHistory },
      ['name', 'birthday', 'weight', 'height', 'contactDetails', 'medicalHistory']
    );
    const missingContact = requireNestedFields(contactDetails, 'contactDetails', [
      'phone',
      'address',
      'emergencyContact'
    ]);
    const missing = [...missingFields, ...missingContact];
    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
    }

    const existingProfile = await PatientProfile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(409).json({ message: 'Profile already exists' });
    }

    const profile = await PatientProfile.create({
      user: req.user.id,
      name,
      birthday,
      weight,
      height,
      profilePictureUrl: profilePictureUrl || '',
      contactDetails,
      medicalHistory
    });

    return res.status(201).json({ profile });
  } catch (error) {
    return next(error);
  }
});

router.get('/profile/me', requirePatient, async (req, res, next) => {
  try {
    const profile = await PatientProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    return next(error);
  }
});

router.patch('/profile/me', requirePatient, async (req, res, next) => {
  try {
    const updates = req.body || {};

    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      updateOptions
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
