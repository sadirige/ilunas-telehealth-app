const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const availabilityRoutes = require('./routes/availabilities');
const recordRoutes = require('./routes/records');
const noteRoutes = require('./routes/notes');
const prescriptionRoutes = require('./routes/prescriptions');
const notificationRoutes = require('./routes/notifications');
const recommendationRoutes = require('./routes/recommendations');

const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || '*'
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    return res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/availabilities', availabilityRoutes);
  app.use('/api/records', recordRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/recommendations', recommendationRoutes);

  app.use((req, res) => {
    return res.status(404).json({ message: 'Not found' });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  });

  return app;
};

module.exports = { createApp };
