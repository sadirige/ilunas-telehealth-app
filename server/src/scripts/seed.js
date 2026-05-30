/**
 * Demo seed data for reviewers and local development.
 *
 * Usage:
 *   node src/scripts/seed.js          # Skip if demo users already exist
 *   node src/scripts/seed.js --fresh  # Drop demo-related data and reseed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const { User } = require('../models/User');
const { PatientProfile } = require('../models/PatientProfile');
const { DoctorProfile } = require('../models/DoctorProfile');
const { Availability } = require('../models/Availability');
const { AvailabilityTemplate } = require('../models/AvailabilityTemplate');
const { Appointment } = require('../models/Appointment');
const { MedicalRecord } = require('../models/MedicalRecord');
const { ConsultationNote } = require('../models/ConsultationNote');
const { Prescription } = require('../models/Prescription');
const { Notification } = require('../models/Notification');

const DEMO_PASSWORD = 'Demo1234!';

const DEMO_EMAILS = [
  'patient.demo@ilunas.test',
  'doctor.cardio@ilunas.test',
  'doctor.derm@ilunas.test',
  'doctor.pedia@ilunas.test'
];

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const setTime = (date, hour, minute = 0) => {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
};

const getMonday = (date = new Date()) => {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, diff));
};

const hashPassword = async (password) => bcrypt.hash(password, 12);

const createUser = async ({ email, role, displayName }) => {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  return User.create({ email, passwordHash, role, displayName });
};

const seed = async () => {
  const isFresh = process.argv.includes('--fresh');

  await connectDb(process.env.MONGO_URI);

  if (isFresh) {
    const existingUsers = await User.find({ email: { $in: DEMO_EMAILS } }).select('_id');
    const userIds = existingUsers.map((user) => user._id);

    if (userIds.length > 0) {
      await Promise.all([
        Notification.deleteMany({ user: { $in: userIds } }),
        Prescription.deleteMany({ $or: [{ patient: { $in: userIds } }, { doctor: { $in: userIds } }] }),
        ConsultationNote.deleteMany({ $or: [{ patient: { $in: userIds } }, { doctor: { $in: userIds } }] }),
        MedicalRecord.deleteMany({ $or: [{ patient: { $in: userIds } }, { doctor: { $in: userIds } }] }),
        Appointment.deleteMany({ $or: [{ patient: { $in: userIds } }, { doctor: { $in: userIds } }] }),
        Availability.deleteMany({ doctor: { $in: userIds } }),
        AvailabilityTemplate.deleteMany({ doctor: { $in: userIds } }),
        PatientProfile.deleteMany({ user: { $in: userIds } }),
        DoctorProfile.deleteMany({ user: { $in: userIds } }),
        User.deleteMany({ _id: { $in: userIds } })
      ]);
    }

    console.log('Cleared existing demo data.');
  } else {
    const existing = await User.findOne({ email: DEMO_EMAILS[0] });
    if (existing) {
      console.log('Demo data already exists. Run with --fresh to reset.');
      await mongoose.disconnect();
      return;
    }
  }

  const patientUser = await createUser({
    email: DEMO_EMAILS[0],
    role: 'patient',
    displayName: 'Juan Dela Cruz'
  });

  const cardioUser = await createUser({
    email: DEMO_EMAILS[1],
    role: 'doctor',
    displayName: 'Dr. Maria Santos'
  });

  const dermUser = await createUser({
    email: DEMO_EMAILS[2],
    role: 'doctor',
    displayName: 'Dr. James Chen'
  });

  const pediaUser = await createUser({
    email: DEMO_EMAILS[3],
    role: 'doctor',
    displayName: 'Dr. Ana Reyes'
  });

  await PatientProfile.create({
    user: patientUser._id,
    name: 'Juan Dela Cruz',
    birthday: new Date('1992-03-15'),
    weight: 72,
    height: 170,
    contactDetails: {
      phone: '+63 917 555 0101',
      address: 'Quezon City, Metro Manila',
      emergencyContact: 'Maria Dela Cruz (+63 917 555 0102)'
    },
    medicalHistory: 'Seasonal allergies. No chronic conditions. Last physical exam: 2025.'
  });

  const cardioProfile = await DoctorProfile.create({
    user: cardioUser._id,
    name: 'Dr. Maria Santos',
    bio: 'Board-certified cardiologist with 12 years of experience in hypertension, chest pain, and preventive heart care.',
    specialization: 'cardiology',
    credentials: 'MD, FPCP, Diplomate in Cardiology',
    consultationFee: 850
  });

  const dermProfile = await DoctorProfile.create({
    user: dermUser._id,
    name: 'Dr. James Chen',
    bio: 'Dermatologist focused on acne, eczema, rashes, and skin cancer screening for teens and adults.',
    specialization: 'dermatology',
    credentials: 'MD, FPDS',
    consultationFee: 750
  });

  const pediaProfile = await DoctorProfile.create({
    user: pediaUser._id,
    name: 'Dr. Ana Reyes',
    bio: 'Pediatrician supporting families with well-child visits, fever management, and vaccination guidance.',
    specialization: 'pediatrics',
    credentials: 'MD, FPPS',
    consultationFee: 700
  });

  const doctorSeeds = [
    { user: cardioUser, profile: cardioProfile, weekdayHours: { start: '09:00', end: '17:00' } },
    { user: dermUser, profile: dermProfile, weekdayHours: { start: '10:00', end: '16:00' } },
    { user: pediaUser, profile: pediaProfile, weekdayHours: { start: '08:00', end: '15:00' } }
  ];

  for (const doctor of doctorSeeds) {
    for (let weekday = 0; weekday <= 4; weekday += 1) {
      await AvailabilityTemplate.create({
        doctor: doctor.user._id,
        weekday,
        startTime: doctor.weekdayHours.start,
        endTime: doctor.weekdayHours.end,
        slotMinutes: 30,
        label: 'Clinic hours',
        isActive: true
      });
    }

    for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
      const day = addDays(getMonday(), dayOffset);
      const dayOfWeek = day.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const [startHour] = doctor.weekdayHours.start.split(':').map(Number);
      const [endHour] = doctor.weekdayHours.end.split(':').map(Number);

      await Availability.create({
        doctor: doctor.user._id,
        startAt: setTime(day, startHour),
        endAt: setTime(day, endHour),
        isAvailable: true
      });
    }
  }

  const completedAt = setTime(addDays(new Date(), -7), 10, 0);
  const completedEnd = setTime(addDays(new Date(), -7), 10, 30);

  const completedAppointment = await Appointment.create({
    patient: patientUser._id,
    doctor: cardioUser._id,
    doctorProfile: cardioProfile._id,
    scheduledAt: completedAt,
    durationMinutes: 30,
    reason: 'Follow-up for elevated blood pressure readings',
    status: 'completed',
    meetingProvider: 'jitsi',
    meetingUrl: 'https://meet.jit.si/ilunas-demo-cardio-completed'
  });

  const upcomingAt = setTime(addDays(new Date(), 2), 14, 0);

  const upcomingAppointment = await Appointment.create({
    patient: patientUser._id,
    doctor: dermUser._id,
    doctorProfile: dermProfile._id,
    scheduledAt: upcomingAt,
    durationMinutes: 30,
    reason: 'Persistent facial rash and itching',
    status: 'scheduled',
    meetingProvider: 'jitsi',
    meetingUrl: 'https://meet.jit.si/ilunas-demo-derm-upcoming',
    meetingHostUrl: 'https://meet.jit.si/ilunas-demo-derm-upcoming'
  });

  await MedicalRecord.create({
    appointment: completedAppointment._id,
    patient: patientUser._id,
    doctor: cardioUser._id,
    summary:
      'Blood pressure reviewed via home readings. Lifestyle counseling provided. Continue monitoring twice weekly.',
    diagnosis: 'Stage 1 hypertension, well controlled on current plan'
  });

  await ConsultationNote.create({
    appointment: completedAppointment._id,
    patient: patientUser._id,
    doctor: cardioUser._id,
    note:
      'Patient reports mild headaches in the morning. No chest pain or shortness of breath. Advised low-sodium diet and daily walks.'
  });

  await Prescription.create({
    appointment: completedAppointment._id,
    patient: patientUser._id,
    doctor: cardioUser._id,
    medications: [
      {
        name: 'Losartan',
        dosage: '50 mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning with water.'
      }
    ],
    notes: 'Return if blood pressure remains above 140/90 after two weeks.'
  });

  await Notification.create([
    {
      user: patientUser._id,
      type: 'appointment_booked',
      title: 'Consultation booked',
      message: `Your dermatology visit with Dr. James Chen is scheduled for ${upcomingAt.toLocaleString()}.`,
      data: { appointmentId: upcomingAppointment._id.toString() }
    },
    {
      user: patientUser._id,
      type: 'appointment_completed',
      title: 'Visit summary available',
      message: 'Your cardiology consultation summary and prescription are ready to review.',
      data: { appointmentId: completedAppointment._id.toString() }
    },
    {
      user: dermUser._id,
      type: 'appointment_booked',
      title: 'New patient booking',
      message: 'Juan Dela Cruz booked a consultation for persistent facial rash.',
      data: { appointmentId: upcomingAppointment._id.toString() }
    }
  ]);

  console.log('\nDemo seed complete.\n');
  console.log('Demo password for all accounts:', DEMO_PASSWORD);
  console.log('\nPatient login:');
  console.log(`  ${DEMO_EMAILS[0]}`);
  console.log('\nDoctor logins:');
  DEMO_EMAILS.slice(1).forEach((email) => console.log(`  ${email}`));
  console.log('\nIncludes: 3 doctors, 1 patient, availability for 2 weeks, 1 completed + 1 upcoming appointment, records, notes, prescriptions, and notifications.\n');

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
