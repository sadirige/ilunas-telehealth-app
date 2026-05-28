const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { DoctorProfile } = require('../models/DoctorProfile');
const { RecommendationEvent } = require('../models/RecommendationEvent');
const {
  tokenize,
  buildSpecializationScores,
  scoreDoctor,
  parseLimit,
  normalizeSpecialization
} = require('../utils/recommendations');

const router = express.Router();

const requirePatient = [authenticate, requireRole(['patient'])];

const buildRecommendationResponse = (profile, score) => ({
  id: profile.id,
  userId: profile.user.toString(),
  name: profile.name,
  bio: profile.bio,
  specialization: profile.specialization,
  profilePictureUrl: profile.profilePictureUrl,
  score
});

router.post('/', requirePatient, async (req, res, next) => {
  try {
    const { symptoms, limit } = req.body || {};
    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ message: 'symptoms is required' });
    }

    const tokens = tokenize(symptoms);
    if (tokens.length === 0) {
      return res.status(400).json({ message: 'symptoms must include meaningful keywords' });
    }

    const specializationScores = buildSpecializationScores(tokens);
    const doctorProfiles = await DoctorProfile.find({}).sort({ createdAt: -1 });

    const ranked = doctorProfiles
      .map((profile) => ({
        profile,
        score: scoreDoctor(profile, tokens, specializationScores)
      }))
      .sort((a, b) => b.score - a.score);

    const maxResults = parseLimit(limit);
    const results = ranked
      .filter((item) => item.score > 0)
      .slice(0, maxResults);

    const fallback = results.length === 0
      ? doctorProfiles.slice(0, maxResults).map((profile) => ({
          profile,
          score: 0
        }))
      : results;

    const matchedSpecializations = Object.keys(specializationScores).map(normalizeSpecialization);
    const recommendedSpecializations = fallback
      .map((item) => normalizeSpecialization(item.profile.specialization))
      .filter(Boolean);

    await RecommendationEvent.create({
      user: req.user.id,
      query: symptoms,
      matchedSpecializations,
      recommendedSpecializations
    });

    return res.status(200).json({
      query: symptoms,
      matchedSpecializations,
      recommendations: fallback.map((item) =>
        buildRecommendationResponse(item.profile, item.score)
      )
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
