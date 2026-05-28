const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { PatientProfile } = require('../models/PatientProfile');

const router = express.Router();

const requirePatient = [authenticate, requireRole(['patient'])];

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

    if (!name || !birthday || !weight || !height || !contactDetails || !medicalHistory) {
      return res.status(400).json({ message: 'Missing required profile fields' });
    }

    const hasContactDetails =
      contactDetails.phone && contactDetails.address && contactDetails.emergencyContact;
    if (!hasContactDetails) {
      return res.status(400).json({ message: 'Contact details are incomplete' });
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
      { new: true }
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
