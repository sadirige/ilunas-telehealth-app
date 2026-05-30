const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'appointment_booked',
  'appointment_rescheduled',
  'appointment_canceled',
  'appointment_completed',
  'appointment_reminder',
  'availability_created',
  'availability_removed'
];

// Notifications are stored for polling and status tracking.
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 200
    },
    message: {
      type: String,
      trim: true,
      required: true,
      maxlength: 1000
    },
    data: {
      type: Object,
      default: {}
    },
    readAt: {
      type: Date
    }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification, NOTIFICATION_TYPES };
