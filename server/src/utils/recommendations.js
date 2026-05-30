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
  cardiology: [
    'heart', 'chest', 'palpitations', 'blood pressure', 'hypertension',
    'heart attack', 'cardiac', 'arrhythmia', 'chest pain', 'shortness of breath',
    'swelling', 'fatigue', 'fainting', 'high cholesterol'
  ],
  dermatology: [
    'skin', 'rash', 'acne', 'itch', 'eczema',
    'psoriasis', 'dermatitis', 'hives', 'fungal', 'moles',
    'sunburn', 'dry skin', 'blisters', 'warts', 'hair loss'
  ],
  neurology: [
    'headache', 'migraine', 'dizziness', 'seizure', 'numbness',
    'stroke', 'memory loss', 'tremor', 'parkinson', 'multiple sclerosis',
    'tingling', 'weakness', 'coordination', 'balance', 'neuropathy'
  ],
  pediatrics: [
    'child', 'infant', 'baby', 'newborn', 'pediatric',
    'kids', 'children', 'toddler', 'teenager', 'adolescent',
    'growth', 'development', 'vaccination', 'newborn care', 'pediatric fever'
  ],
  psychiatry: [
    'anxiety', 'depression', 'stress', 'panic', 'sleep',
    'bipolar', 'schizophrenia', 'ptsd', 'ocd', 'mental health',
    'insomnia', 'mood', 'behavioral', 'therapy', 'counseling'
  ],
  orthopedics: [
    'joint', 'bone', 'fracture', 'back pain', 'knee',
    'shoulder', 'hip', 'sprain', 'strain', 'arthritis',
    'sports injury', 'carpal tunnel', 'scoliosis', 'osteoporosis', 'dislocation'
  ],
  gastroenterology: [
    'stomach', 'abdominal', 'nausea', 'vomit', 'diarrhea',
    'constipation', 'acid reflux', 'gerd', 'ulcer', 'liver',
    'gallbladder', 'pancreas', 'digestive', 'bloating', 'irritable bowel'
  ],
  pulmonology: [
    'cough', 'breath', 'asthma', 'shortness', 'wheezing',
    'pneumonia', 'bronchitis', 'copd', 'lung', 'respiratory',
    'breathing difficulty', 'chest tightness', 'sleep apnea', 'tuberculosis'
  ],
  ent: [
    'ear', 'nose', 'throat', 'sinus', 'tonsil',
    'hearing loss', 'ear infection', 'sore throat', 'allergies', 'sinusitis',
    'tonsillitis', 'voice', 'swallowing', 'vertigo', 'adenoids'
  ],
  ophthalmology: [
    'eye', 'vision', 'blurred', 'redness',
    'cataract', 'glaucoma', 'dry eye', 'conjunctivitis', 'retina',
    'eye strain', 'floaters', 'macular degeneration', 'cornea', 'eyelid'
  ],
  family_medicine: [
    'general', 'checkup', 'flu', 'fever', 'cold',
    'routine exam', 'preventive care', 'vaccination', 'health screening', 'primary care',
    'wellness', 'chronic disease', 'diabetes', 'hypertension', 'general practitioner'
  ],
  internal_medicine: [
    'diabetes', 'thyroid', 'kidney', 'liver disease', 'infection',
    'autoimmune', 'endocrine', 'metabolic', 'chronic illness', 'complex conditions'
  ],
  obstetrics_gynecology: [
    'pregnancy', 'women health', 'menstrual', 'ovarian', 'uterine',
    'fertility', 'prenatal', 'postnatal', 'menopause', 'pap smear'
  ],
  urology: [
    'urinary', 'kidney stone', 'bladder', 'prostate', 'urination',
    'incontinence', 'uti', 'erectile', 'testicular', 'urological'
  ]
};

const tokenize = (text) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOPWORDS.has(token));

const normalizeSpecialization = (value) => (value || '').trim().toLowerCase();

const buildSpecializationScores = (tokens) => {
  const scores = {};
  const matchedKeywords = {};

  Object.entries(SPECIALIZATION_KEYWORDS).forEach(([specialization, keywords]) => {
    const matched = keywords.filter((keyword) =>
      tokens.some((token) => keyword.includes(token) || token.includes(keyword))
    );

    if (matched.length > 0) {
      scores[specialization] = matched.length;
      matchedKeywords[specialization] = matched;
    }
  });

  return { scores, matchedKeywords };
};

const scoreDoctor = (doctor, tokens, specializationScores, matchedKeywords) => {
  const specialization = normalizeSpecialization(doctor.specialization);
  const baseScore = specializationScores[specialization] || 0;
  const text = `${doctor.name} ${doctor.bio} ${doctor.specialization}`.toLowerCase();
  const textScore = tokens.reduce(
    (acc, token) => (text.includes(token) ? acc + 0.25 : acc),
    0
  );

  const matchedSymptoms = matchedKeywords[specialization] || [];

  return {
    score: baseScore + textScore,
    matchedSymptoms
  };
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
