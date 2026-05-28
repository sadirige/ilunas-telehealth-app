const { Notification } = require('../models/Notification');
const { emitToUser } = require('./notificationStream');

const buildNotification = ({ user, type, title, message, data }) => ({
  user,
  type,
  title,
  message,
  data: data || {}
});

const createNotificationSafe = async (payload) => {
  try {
    if (!payload || !payload.user) {
      return;
    }

    const notification = await Notification.create(buildNotification(payload));
    emitToUser(notification.user, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      readAt: notification.readAt,
      createdAt: notification.createdAt
    });
  } catch (error) {
    console.error('Failed to create notification', error);
  }
};

module.exports = {
  createNotificationSafe
};
