const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true },
    instructions: { type: String, trim: true }
  },
  { _id: false }
);

// Prescriptions issued by doctors after a consultation.
const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    medications: {
      type: [medicationSchema],
      validate: [(value) => Array.isArray(value) && value.length > 0, 'At least one medication is required']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000
    }
  },
  { timestamps: true }
);

prescriptionSchema.index({ appointment: 1, createdAt: -1 });
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = { Prescription };
