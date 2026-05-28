const mongoose = require('mongoose');

// Doctor profile data is required for discovery and booking flows.
const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: { type: String, trim: true, required: true },
    bio: { type: String, trim: true, required: true, maxlength: 1000 },
    specialization: { type: String, trim: true, required: true },
    profilePictureUrl: { type: String, trim: true }
  },
  { timestamps: true }
);

doctorProfileSchema.index({ specialization: 1, name: 1 });

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = { DoctorProfile };
