const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Notification } = require('../models/Notification');

const router = express.Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parseLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
};

const buildNotificationResponse = (notification) => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  data: notification.data,
  readAt: notification.readAt,
  createdAt: notification.createdAt
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, limit } = req.query || {};
    const query = { user: req.user.id };

    if (status === 'unread') {
      query.readAt = { $exists: false };
    } else if (status === 'read') {
      query.readAt = { $exists: true };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseLimit(limit));

    return res.status(200).json({ results: notifications.map(buildNotificationResponse) });
  } catch (error) {
    return next(error);
  }
});

router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      readAt: { $exists: false }
    });

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:notificationId/read', authenticate, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        user: req.user.id
      },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({ notification: buildNotificationResponse(notification) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      {
        user: req.user.id,
        readAt: { $exists: false }
      },
      { $set: { readAt: new Date() } }
    );

    return res.status(200).json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
