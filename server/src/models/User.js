const mongoose = require('mongoose');

const USER_ROLES = ['patient', 'doctor'];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES
    },
    displayName: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

module.exports = { User, USER_ROLES };
