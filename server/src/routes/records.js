const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { Appointment } = require('../models/Appointment');
const { MedicalRecord } = require('../models/MedicalRecord');
const { requireFields, formatMissingFieldsMessage } = require('../utils/validation');

const router = express.Router();

const requireDoctor = [authenticate, requireRole(['doctor'])];
const requirePatient = [authenticate, requireRole(['patient'])];

const buildRecordResponse = (record) => ({
  id: record.id,
  appointment: record.appointment,
  patient: record.patient,
  doctor: record.doctor,
  summary: record.summary,
  diagnosis: record.diagnosis,
  createdAt: record.createdAt
});

router.post('/', requireDoctor, async (req, res, next) => {
  try {
    const { appointmentId, summary, diagnosis } = req.body || {};
    const missing = requireFields(
      { appointmentId, summary },
      ['appointmentId', 'summary']
    );

    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctor.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const existing = await MedicalRecord.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(409).json({ message: 'Medical record already exists' });
    }

    const record = await MedicalRecord.create({
      appointment: appointment.id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      summary,
      diagnosis: diagnosis || ''
    });

    return res.status(201).json({ record: buildRecordResponse(record) });
  } catch (error) {
    return next(error);
  }
});

router.get('/patient', requirePatient, async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ results: records.map(buildRecordResponse) });
  } catch (error) {
    return next(error);
  }
});

router.get('/doctor', requireDoctor, async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ doctor: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ results: records.map(buildRecordResponse) });
  } catch (error) {
    return next(error);
  }
});

router.get('/appointment/:appointmentId', requireDoctor, async (req, res, next) => {
  try {
    const record = await MedicalRecord.findOne({ appointment: req.params.appointmentId });
    if (!record || record.doctor.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    return res.status(200).json({ record: buildRecordResponse(record) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
