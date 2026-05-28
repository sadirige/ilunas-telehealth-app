require('dotenv').config();
const { createApp } = require('./app');
const { connectDb } = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDb(process.env.MONGO_URI);
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
