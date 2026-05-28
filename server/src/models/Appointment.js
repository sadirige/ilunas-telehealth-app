const mongoose = require('mongoose');

const APPOINTMENT_STATUS = ['scheduled', 'canceled', 'completed'];

// Appointments link patients to doctors for telehealth sessions.
const appointmentSchema = new mongoose.Schema(
  {
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
    doctorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 10,
      max: 180
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    meetingUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUS,
      default: 'scheduled'
    }
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, scheduledAt: 1 });
appointmentSchema.index({ patient: 1, scheduledAt: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = { Appointment, APPOINTMENT_STATUS };
