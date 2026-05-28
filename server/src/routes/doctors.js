const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { DoctorProfile } = require('../models/DoctorProfile');
const { requireFields, formatMissingFieldsMessage } = require('../utils/validation');

const router = express.Router();

const requireDoctor = [authenticate, requireRole(['doctor'])];
const requirePatient = [authenticate, requireRole(['patient'])];

// Ensures Mongoose validators run on PATCH updates.
const updateOptions = { new: true, runValidators: true, context: 'query' };

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildDoctorProfileResponse = (profile) => ({
  id: profile.id,
  userId: profile.user.toString(),
  name: profile.name,
  bio: profile.bio,
  specialization: profile.specialization,
  profilePictureUrl: profile.profilePictureUrl
});

router.post('/profile', requireDoctor, async (req, res, next) => {
  try {
    const { name, bio, specialization, profilePictureUrl } = req.body || {};

    const missing = requireFields(
      { name, bio, specialization },
      ['name', 'bio', 'specialization']
    );
    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
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

// Patient-facing discovery endpoints.
router.get('/', requirePatient, async (req, res, next) => {
  try {
    const { specialization, q } = req.query || {};
    const filter = {};

    if (specialization) {
      filter.specialization = new RegExp(escapeRegExp(specialization), 'i');
    }

    if (q) {
      const query = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [{ name: query }, { bio: query }, { specialization: query }];
    }

    const profiles = await DoctorProfile.find(filter)
      .sort({ createdAt: -1 })
      .select('user name bio specialization profilePictureUrl');

    return res.status(200).json({ results: profiles.map(buildDoctorProfileResponse) });
  } catch (error) {
    return next(error);
  }
});

router.get('/:doctorId', requirePatient, async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findById(req.params.doctorId).select(
      'user name bio specialization profilePictureUrl'
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({ profile: buildDoctorProfileResponse(profile) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
