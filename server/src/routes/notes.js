const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { Appointment } = require('../models/Appointment');
const { ConsultationNote } = require('../models/ConsultationNote');
const { requireFields, formatMissingFieldsMessage } = require('../utils/validation');

const router = express.Router();

const requireDoctor = [authenticate, requireRole(['doctor'])];
const requirePatient = [authenticate, requireRole(['patient'])];

const buildNoteResponse = (note) => ({
  id: note.id,
  appointment: note.appointment,
  patient: note.patient,
  doctor: note.doctor,
  note: note.note,
  createdAt: note.createdAt
});

router.post('/', requireDoctor, async (req, res, next) => {
  try {
    const { appointmentId, note } = req.body || {};
    const missing = requireFields({ appointmentId, note }, ['appointmentId', 'note']);

    if (missing.length > 0) {
      return res.status(400).json({ message: formatMissingFieldsMessage(missing) });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctor.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const record = await ConsultationNote.create({
      appointment: appointment.id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      note
    });

    return res.status(201).json({ note: buildNoteResponse(record) });
  } catch (error) {
    return next(error);
  }
});

router.get('/patient', requirePatient, async (req, res, next) => {
  try {
    const notes = await ConsultationNote.find({ patient: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ results: notes.map(buildNoteResponse) });
  } catch (error) {
    return next(error);
  }
});

router.get('/doctor', requireDoctor, async (req, res, next) => {
  try {
    const notes = await ConsultationNote.find({ doctor: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ results: notes.map(buildNoteResponse) });
  } catch (error) {
    return next(error);
  }
});

router.get('/appointment/:appointmentId', requireDoctor, async (req, res, next) => {
  try {
    const notes = await ConsultationNote.find({ appointment: req.params.appointmentId })
      .sort({ createdAt: -1 });

    if (notes.length === 0) {
      return res.status(200).json({ results: [] });
    }

    if (notes[0].doctor.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Consultation notes not found' });
    }

    return res.status(200).json({ results: notes.map(buildNoteResponse) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
