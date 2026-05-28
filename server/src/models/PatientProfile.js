const mongoose = require('mongoose');

const contactDetailsSchema = new mongoose.Schema(
  {
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    emergencyContact: { type: String, trim: true }
  },
  { _id: false }
);

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: { type: String, trim: true },
    birthday: { type: Date },
    weight: { type: Number },
    height: { type: Number },
    profilePictureUrl: { type: String, trim: true },
    contactDetails: contactDetailsSchema,
    medicalHistory: { type: String, trim: true }
  },
  { timestamps: true }
);

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

module.exports = { PatientProfile };
