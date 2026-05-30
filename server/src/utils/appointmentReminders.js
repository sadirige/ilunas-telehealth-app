const { Appointment } = require('../models/Appointment');
const { Notification } = require('../models/Notification');
const { createNotificationSafe } = require('./notifications');

const DEFAULT_LEAD_MINUTES = 15;
const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_POLL_MS = 60000;

const getEnvNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildWindow = (leadMinutes, windowSeconds) => {
  const now = Date.now();
  const start = new Date(now + leadMinutes * 60 * 1000);
  const end = new Date(start.getTime() + windowSeconds * 1000);
  return { start, end };
};

const hasReminder = async (userId, appointmentId) => {
  const existing = await Notification.findOne({
    user: userId,
    type: 'appointment_reminder',
    'data.appointmentId': appointmentId
  }).select('_id');

  return Boolean(existing);
};

const sendReminder = async (appointment, userId, roleLabel) => {
  const appointmentId = appointment.id.toString();
  const alreadyNotified = await hasReminder(userId, appointmentId);
  if (alreadyNotified) {
    return;
  }

  await createNotificationSafe({
    user: userId,
    type: 'appointment_reminder',
    title: 'Upcoming appointment',
    message: `Your ${roleLabel} appointment starts soon.`,
    data: {
      appointmentId,
      scheduledAt: appointment.scheduledAt
    }
  });
};

const runReminderScan = async () => {
  const leadMinutes = getEnvNumber(
    process.env.APPOINTMENT_REMINDER_MINUTES,
    DEFAULT_LEAD_MINUTES
  );
  const windowSeconds = getEnvNumber(
    process.env.APPOINTMENT_REMINDER_WINDOW_SECONDS,
    DEFAULT_WINDOW_SECONDS
  );
  const { start, end } = buildWindow(leadMinutes, windowSeconds);

  const appointments = await Appointment.find({
    status: 'scheduled',
    scheduledAt: {
      $gte: start,
      $lt: end
    }
  }).select('patient doctor scheduledAt');

  await Promise.all(
    appointments.map(async (appointment) => {
      await Promise.all([
        sendReminder(appointment, appointment.patient, 'patient'),
        sendReminder(appointment, appointment.doctor, 'doctor')
      ]);
    })
  );
};

const startAppointmentReminderJob = () => {
  const pollMs = getEnvNumber(
    process.env.APPOINTMENT_REMINDER_POLL_MS,
    DEFAULT_POLL_MS
  );

  const run = async () => {
    try {
      await runReminderScan();
    } catch (error) {
      console.error('Appointment reminder scan failed', error);
    }
  };

  run();
  const timer = setInterval(run, pollMs);
  return () => clearInterval(timer);
};

module.exports = { startAppointmentReminderJob };
