const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 5;

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'for',
  'from',
  'has',
  'have',
  'i',
  'in',
  'is',
  'it',
  'my',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with'
]);

const SPECIALIZATION_KEYWORDS = {
  cardiology: ['heart', 'chest', 'palpitations', 'blood pressure', 'hypertension'],
  dermatology: ['skin', 'rash', 'acne', 'itch', 'eczema'],
  neurology: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness'],
  pediatrics: ['child', 'infant', 'baby', 'newborn', 'pediatric'],
  psychiatry: ['anxiety', 'depression', 'stress', 'panic', 'sleep'],
  orthopedics: ['joint', 'bone', 'fracture', 'back pain', 'knee'],
  gastroenterology: ['stomach', 'abdominal', 'nausea', 'vomit', 'diarrhea'],
  pulmonology: ['cough', 'breath', 'asthma', 'shortness', 'wheezing'],
  ent: ['ear', 'nose', 'throat', 'sinus', 'tonsil'],
  ophthalmology: ['eye', 'vision', 'blurred', 'redness'],
  family medicine: ['general', 'checkup', 'flu', 'fever', 'cold']
};

const tokenize = (text) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOPWORDS.has(token));

const normalizeSpecialization = (value) => (value || '').trim().toLowerCase();

const buildSpecializationScores = (tokens) => {
  const scores = {};

  Object.entries(SPECIALIZATION_KEYWORDS).forEach(([specialization, keywords]) => {
    const matched = keywords.filter((keyword) =>
      tokens.some((token) => keyword.includes(token) || token.includes(keyword))
    );

    if (matched.length > 0) {
      scores[specialization] = matched.length;
    }
  });

  return scores;
};

const scoreDoctor = (doctor, tokens, specializationScores) => {
  const specialization = normalizeSpecialization(doctor.specialization);
  const baseScore = specializationScores[specialization] || 0;
  const text = `${doctor.name} ${doctor.bio} ${doctor.specialization}`.toLowerCase();
  const textScore = tokens.reduce(
    (acc, token) => (text.includes(token) ? acc + 0.25 : acc),
    0
  );

  return baseScore + textScore;
};

const parseLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
};

module.exports = {
  tokenize,
  buildSpecializationScores,
  scoreDoctor,
  parseLimit,
  normalizeSpecialization
};
