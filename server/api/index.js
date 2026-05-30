const { createApp } = require('../src/app');
const { connectDb } = require('../src/config/db');

let app;
let dbConnected = false;

async function handler(req, res) {
  try {
    console.log('Handler invoked, method:', req.method, 'path:', req.url);
    console.log('MONGO_URI set:', !!process.env.MONGO_URI);

    if (!dbConnected) {
      console.log('Connecting to database...');
      await connectDb(process.env.MONGO_URI);
      dbConnected = true;
      console.log('Database connected successfully');
    }

    if (!app) {
      console.log('Creating Express app...');
      app = createApp();
      console.log('Express app created');
    }

    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = handler;
