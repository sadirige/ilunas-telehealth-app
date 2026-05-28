const mongoose = require('mongoose');

// Medical records summarize the outcome of a consultation.
const medicalRecordSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true
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
    summary: {
      type: String,
      trim: true,
      required: true,
      maxlength: 2000
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1, createdAt: -1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = { MedicalRecord };
