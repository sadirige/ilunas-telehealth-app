const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { Appointment } = require('../models/Appointment');
const { Prescription } = require('../models/Prescription');
const { requireFields, formatMissingFieldsMessage } = require('../utils/validation');

const router = express.Router();

const requireDoctor = [authenticate, requireRole(['doctor'])];
const requirePatient = [authenticate, requireRole(['patient'])];

const buildPrescriptionResponse = (prescription) => ({
  id: prescription.id,
  appointment: prescription.appointment,
  patient: prescription.patient,
  doctor: prescription.doctor,
  medications: prescription.medications,
  notes: prescription.notes,
  createdAt: prescription.createdAt
});

router.post('/', requireDoctor, async (req, res, next) => {
  try {
    const { appointmentId, medications, notes } = req.body || {};
    const missing = requireFields({ appointmentId, medications }, ['appointmentId', 'medications']);

    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
    }

    if (!Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ message: 'At least one medication is required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctor.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const prescription = await Prescription.create({
      appointment: appointment.id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      medications,
      notes: notes || ''
    });

    return res.status(201).json({ prescription: buildPrescriptionResponse(prescription) });
  } catch (error) {
    return next(error);
  }
});

router.get('/patient', requirePatient, async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ results: prescriptions.map(buildPrescriptionResponse) });
  } catch (error) {
    return next(error);
  }
});

router.get('/doctor', requireDoctor, async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ results: prescriptions.map(buildPrescriptionResponse) });
  } catch (error) {
    return next(error);
  }
});

router.get('/appointment/:appointmentId', requireDoctor, async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ appointment: req.params.appointmentId })
      .sort({ createdAt: -1 });

    if (prescriptions.length === 0) {
      return res.status(200).json({ results: [] });
    }

    if (prescriptions[0].doctor.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Prescriptions not found' });
    }

    return res.status(200).json({ results: prescriptions.map(buildPrescriptionResponse) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
