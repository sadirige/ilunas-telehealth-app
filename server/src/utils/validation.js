const requireFields = (payload, fields) =>
  fields.filter((field) => !payload || payload[field] === undefined || payload[field] === null || payload[field] === '');

const requireNestedFields = (payload, field, nestedFields) => {
  const container = payload ? payload[field] : undefined;
  if (!container) {
    return nestedFields.map((name) => `${field}.${name}`);
  }

  return nestedFields
    .filter((name) => container[name] === undefined || container[name] === null || container[name] === '')
    .map((name) => `${field}.${name}`);
};

const formatMissingFieldsMessage = (missingFields) =>
  `Missing required fields: ${missingFields.join(', ')}`;

const isValidUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

module.exports = {
  requireFields,
  requireNestedFields,
  formatMissingFieldsMessage,
  isValidUrl
};
