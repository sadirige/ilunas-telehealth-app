const mongoose = require('mongoose');

// Recurring weekly windows — e.g. every Monday 9:00–17:00.
// weekday: 0 = Monday … 6 = Sunday (matches the doctor calendar).
const availabilityTemplateSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    weekday: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    },
    slotMinutes: {
      type: Number,
      required: true,
      min: 1,
      default: 30
    },
    label: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

availabilityTemplateSchema.index({ doctor: 1, weekday: 1, startTime: 1, endTime: 1 });

const AvailabilityTemplate = mongoose.model('AvailabilityTemplate', availabilityTemplateSchema);

module.exports = { AvailabilityTemplate };
