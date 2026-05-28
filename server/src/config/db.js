const mongoose = require('mongoose');

const connectDb = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
};

module.exports = { connectDb };
