const mongoose = require('mongoose');

// Consultation notes capture detailed findings per appointment.
const consultationNoteSchema = new mongoose.Schema(
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
    note: {
      type: String,
      trim: true,
      required: true,
      maxlength: 4000
    }
  },
  { timestamps: true }
);

consultationNoteSchema.index({ appointment: 1, createdAt: -1 });
consultationNoteSchema.index({ patient: 1, createdAt: -1 });
consultationNoteSchema.index({ doctor: 1, createdAt: -1 });

const ConsultationNote = mongoose.model('ConsultationNote', consultationNoteSchema);

module.exports = { ConsultationNote };
