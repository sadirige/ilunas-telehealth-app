const mongoose = require('mongoose');

// Availability windows define when a doctor can accept appointments.
const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startAt: {
      type: Date,
      required: true
    },
    endAt: {
      type: Date,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

availabilitySchema.index({ doctor: 1, startAt: 1, endAt: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = { Availability };
