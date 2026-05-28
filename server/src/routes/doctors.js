const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { DoctorProfile } = require('../models/DoctorProfile');

const router = express.Router();

const requireDoctor = [authenticate, requireRole(['doctor'])];

router.post('/profile', requireDoctor, async (req, res, next) => {
  try {
    const { name, bio, specialization, profilePictureUrl } = req.body || {};

    if (!name || !bio || !specialization) {
      return res.status(400).json({ message: 'Missing required profile fields' });
    }

    const existingProfile = await DoctorProfile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(409).json({ message: 'Profile already exists' });
    }

    const profile = await DoctorProfile.create({
      user: req.user.id,
      name,
      bio,
      specialization,
      profilePictureUrl: profilePictureUrl || ''
    });

    return res.status(201).json({ profile });
  } catch (error) {
    return next(error);
  }
});

router.get('/profile/me', requireDoctor, async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    return next(error);
  }
});

router.patch('/profile/me', requireDoctor, async (req, res, next) => {
  try {
    const updates = req.body || {};

    const profile = await DoctorProfile.findOneAndUpdate(
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
