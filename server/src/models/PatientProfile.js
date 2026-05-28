const mongoose = require('mongoose');

const contactDetailsSchema = new mongoose.Schema(
  {
    phone: { type: String, trim: true, required: true },
    address: { type: String, trim: true, required: true },
    emergencyContact: { type: String, trim: true, required: true }
  },
  { _id: false }
);

// Patient profile data anchors identity and medical context.
const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: { type: String, trim: true, required: true },
    birthday: { type: Date, required: true },
    weight: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
    profilePictureUrl: { type: String, trim: true },
    contactDetails: { type: contactDetailsSchema, required: true },
    medicalHistory: { type: String, trim: true, required: true, maxlength: 2000 }
  },
  { timestamps: true }
);

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

module.exports = { PatientProfile };
