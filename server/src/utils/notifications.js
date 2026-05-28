const { Notification } = require('../models/Notification');

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

    await Notification.create(buildNotification(payload));
  } catch (error) {
    console.error('Failed to create notification', error);
  }
};

module.exports = {
  createNotificationSafe
};
