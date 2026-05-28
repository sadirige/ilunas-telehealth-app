const { randomUUID } = require('crypto');

const listeners = new Map();

const addClient = (userId, res) => {
  const key = userId.toString();
  const clientId = randomUUID();

  if (!listeners.has(key)) {
    listeners.set(key, new Map());
  }

  listeners.get(key).set(clientId, res);

  return () => {
    const userListeners = listeners.get(key);
    if (userListeners) {
      userListeners.delete(clientId);
      if (userListeners.size === 0) {
        listeners.delete(key);
      }
    }
  };
};

const emitToUser = (userId, payload) => {
  const key = userId.toString();
  const userListeners = listeners.get(key);

  if (!userListeners) {
    return;
  }

  const data = `event: notification\ndata: ${JSON.stringify(payload)}\n\n`;
  userListeners.forEach((res) => {
    res.write(data);
  });
};

module.exports = {
  addClient,
  emitToUser
};
