const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { Appointment, MEETING_PROVIDERS } = require('../models/Appointment');
const { DoctorProfile } = require('../models/DoctorProfile');
const { Availability } = require('../models/Availability');
const { requireFields, formatMissingFieldsMessage } = require('../utils/validation');
const { createNotificationSafe } = require('../utils/notifications');

const router = express.Router();

const requirePatient = [authenticate, requireRole(['patient'])];
const requireDoctor = [authenticate, requireRole(['doctor'])];

const updateOptions = { new: true, runValidators: true, context: 'query' };

const parseScheduledAt = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildAppointmentResponse = (appointment) => ({
  id: appointment.id,
  patient: appointment.patient,
  doctor: appointment.doctor,
  doctorProfile: appointment.doctorProfile,
  scheduledAt: appointment.scheduledAt,
  durationMinutes: appointment.durationMinutes,
  reason: appointment.reason,
  meetingUrl: appointment.meetingUrl,
  meetingProvider: appointment.meetingProvider,
  meetingHostUrl: appointment.meetingHostUrl,
  meetingMeta: appointment.meetingMeta,
  status: appointment.status
});

const getAppointmentEnd = (startAt, durationMinutes) =>
  new Date(startAt.getTime() + durationMinutes * 60 * 1000);

const doctorHasAvailability = async (doctorId, startAt, durationMinutes) => {
  const endAt = getAppointmentEnd(startAt, durationMinutes);
  const availability = await Availability.findOne({
    doctor: doctorId,
    isAvailable: true,
    startAt: { $lte: startAt },
    endAt: { $gte: endAt }
  });

  return Boolean(availability);
};

router.post('/', requirePatient, async (req, res, next) => {
  try {
    const { doctorProfileId, scheduledAt, durationMinutes, reason, meetingUrl } = req.body || {};
    const missing = requireFields(
      { doctorProfileId, scheduledAt },
      ['doctorProfileId', 'scheduledAt']
    );

    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
    }

    const parsedDate = parseScheduledAt(scheduledAt);
    if (!parsedDate) {
      return res.status(400).json({ message: 'scheduledAt must be a valid date' });
    }

    const doctorProfile = await DoctorProfile.findById(doctorProfileId).select('user');
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const existing = await Appointment.findOne({
      doctor: doctorProfile.user,
      scheduledAt: parsedDate,
      status: 'scheduled'
    });

    if (existing) {
      return res.status(409).json({ message: 'Doctor is not available at that time' });
    }

    const duration = durationMinutes || 30;
    const hasAvailability = await doctorHasAvailability(doctorProfile.user, parsedDate, duration);
    if (!hasAvailability) {
      return res.status(409).json({ message: 'Doctor is not available at that time' });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorProfile.user,
      doctorProfile: doctorProfile.id,
      scheduledAt: parsedDate,
      durationMinutes: duration,
      reason: reason || '',
      meetingUrl: meetingUrl || ''
    });

    await Promise.all([
      createNotificationSafe({
        user: req.user.id,
        type: 'appointment_booked',
        title: 'Appointment booked',
        message: 'Your appointment is scheduled.',
        data: { appointmentId: appointment.id }
      }),
      createNotificationSafe({
        user: doctorProfile.user,
        type: 'appointment_booked',
        title: 'New appointment booked',
        message: 'A patient booked a consultation.',
        data: { appointmentId: appointment.id }
      })
    ]);

    return res.status(201).json({ appointment: buildAppointmentResponse(appointment) });
  } catch (error) {
    return next(error);
  }
});

router.get('/patient', requirePatient, async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .sort({ scheduledAt: -1 });

    return res.status(200).json({
      results: appointments.map(buildAppointmentResponse)
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/doctor', requireDoctor, async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .sort({ scheduledAt: -1 });

    return res.status(200).json({
      results: appointments.map(buildAppointmentResponse)
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:appointmentId/reschedule', requirePatient, async (req, res, next) => {
  try {
    const { scheduledAt } = req.body || {};
    const missing = requireFields({ scheduledAt }, ['scheduledAt']);
    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
    }

    const parsedDate = parseScheduledAt(scheduledAt);
    if (!parsedDate) {
      return res.status(400).json({ message: 'scheduledAt must be a valid date' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      patient: req.user.id,
      status: 'scheduled'
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      scheduledAt: parsedDate,
      status: 'scheduled',
      _id: { $ne: appointment.id }
    });

    if (conflict) {
      return res.status(409).json({ message: 'Doctor is not available at that time' });
    }

    const duration = appointment.durationMinutes || 30;
    const hasAvailability = await doctorHasAvailability(appointment.doctor, parsedDate, duration);
    if (!hasAvailability) {
      return res.status(409).json({ message: 'Doctor is not available at that time' });
    }

    appointment.scheduledAt = parsedDate;
    await appointment.save();

    await Promise.all([
      createNotificationSafe({
        user: appointment.patient,
        type: 'appointment_rescheduled',
        title: 'Appointment rescheduled',
        message: 'Your appointment time was updated.',
        data: { appointmentId: appointment.id }
      }),
      createNotificationSafe({
        user: appointment.doctor,
        type: 'appointment_rescheduled',
        title: 'Appointment rescheduled',
        message: 'A patient rescheduled their appointment.',
        data: { appointmentId: appointment.id }
      })
    ]);

    return res.status(200).json({ appointment: buildAppointmentResponse(appointment) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:appointmentId/cancel', requirePatient, async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.appointmentId,
        patient: req.user.id,
        status: 'scheduled'
      },
      { $set: { status: 'canceled' } },
      updateOptions
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await createNotificationSafe({
      user: appointment.doctor,
      type: 'appointment_canceled',
      title: 'Appointment canceled',
      message: 'A patient canceled their appointment.',
      data: { appointmentId: appointment.id }
    });

    return res.status(200).json({ appointment: buildAppointmentResponse(appointment) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:appointmentId/complete', requireDoctor, async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.appointmentId,
        doctor: req.user.id,
        status: 'scheduled'
      },
      { $set: { status: 'completed' } },
      updateOptions
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await createNotificationSafe({
      user: appointment.patient,
      type: 'appointment_completed',
      title: 'Appointment completed',
      message: 'Your appointment was marked as completed.',
      data: { appointmentId: appointment.id }
    });

    return res.status(200).json({ appointment: buildAppointmentResponse(appointment) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:appointmentId/meeting', requireDoctor, async (req, res, next) => {
  try {
    const { meetingUrl, meetingProvider, meetingHostUrl, meetingMeta } = req.body || {};

    if (!meetingUrl) {
      return res.status(400).json({ message: 'meetingUrl is required' });
    }

    if (meetingProvider && !MEETING_PROVIDERS.includes(meetingProvider)) {
      return res.status(400).json({ message: 'Invalid meeting provider' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.appointmentId,
        doctor: req.user.id
      },
      {
        $set: {
          meetingUrl,
          meetingProvider: meetingProvider || 'custom',
          meetingHostUrl: meetingHostUrl || '',
          meetingMeta: meetingMeta || {}
        }
      },
      updateOptions
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    return res.status(200).json({ appointment: buildAppointmentResponse(appointment) });
  } catch (error) {
    return next(error);
  }
});

router.get('/:appointmentId/meeting', authenticate, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isParticipant =
      appointment.patient.toString() === req.user.id ||
      appointment.doctor.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json({
      meeting: {
        meetingUrl: appointment.meetingUrl,
        meetingProvider: appointment.meetingProvider,
        meetingHostUrl: appointment.meetingHostUrl,
        meetingMeta: appointment.meetingMeta
      }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
