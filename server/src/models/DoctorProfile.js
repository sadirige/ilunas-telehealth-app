const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: { type: String, trim: true },
    bio: { type: String, trim: true },
    specialization: { type: String, trim: true },
    profilePictureUrl: { type: String, trim: true }
  },
  { timestamps: true }
);

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = { DoctorProfile };
