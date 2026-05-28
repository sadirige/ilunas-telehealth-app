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

module.exports = {
  requireFields,
  requireNestedFields,
  formatMissingFieldsMessage
};
