const { createApp } = require('../src/app');
const { connectDb } = require('../src/config/db');

let app;

async function handler(req, res) {
  if (!app) {
    await connectDb(process.env.MONGO_URI);
    app = createApp();
  }
  return app(req, res);
}

module.exports = handler;
