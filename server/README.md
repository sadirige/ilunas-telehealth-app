# Telehealth Server Application

Express.js backend for the telehealth web application. Provides REST API endpoints for authentication, appointments, availability, clinical records, real-time notifications (SSE), and symptom-based doctor recommendations.

## Tech Stack

- **Node.js** + **Express.js** — REST API
- **MongoDB** + **Mongoose** — data layer
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT authentication
- **Server-Sent Events (SSE)** — real-time notifications

## Project Structure

```
server/
├── src/
│   ├── config/              # Database connection
│   ├── middleware/          # auth.js, requireRole.js
│   ├── models/              # Mongoose schemas (11 collections)
│   ├── routes/              # Feature route handlers
│   ├── scripts/             # seed.js for demo data
│   ├── utils/               # recommendations, notifications, reminders, validation
│   ├── app.js               # Express app setup
│   └── server.js            # Entry point
├── .env
└── package.json
```

Route handlers contain business logic directly (no separate controllers layer). This keeps the MVP structure simple while remaining easy to split later.

## Database Collections

| Collection | Model file | Purpose |
|------------|------------|---------|
| users | `User.js` | Email, password hash, role (`patient` / `doctor`) |
| patientprofiles | `PatientProfile.js` | Demographics, contact, medical history |
| doctorprofiles | `DoctorProfile.js` | Bio, specialization, credentials, fee |
| appointments | `Appointment.js` | Scheduling, status, meeting links |
| availabilities | `Availability.js` | Doctor bookable time windows |
| availabilitytemplates | `AvailabilityTemplate.js` | Recurring weekly schedule rules |
| medicalrecords | `MedicalRecord.js` | Visit summaries (one per appointment) |
| consultationnotes | `ConsultationNote.js` | Detailed consultation notes |
| prescriptions | `Prescription.js` | Medications issued after visits |
| notifications | `Notification.js` | In-app notification feed |
| recommendationevents | `RecommendationEvent.js` | AI recommendation query logs |

## Environment Variables

Create `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ilunas
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

> **Note:** The environment variable is `MONGO_URI` (not `MONGODB_URI`).

## Development

```bash
npm install
npm start          # or npm run dev
```

Health check: `GET /api/health`

## Demo Seed Data

Populate the database with reviewer-ready demo accounts:

```bash
npm run seed         # Skip if demo users already exist
npm run seed:fresh   # Remove demo data and reseed
```

**Demo password (all accounts):** `Demo1234!`

| Role | Email |
|------|-------|
| Patient | `patient.demo@ilunas.test` |
| Doctor — Cardiology | `doctor.cardio@ilunas.test` |
| Doctor — Dermatology | `doctor.derm@ilunas.test` |
| Doctor — Pediatrics | `doctor.pedia@ilunas.test` |

The seed script creates profiles, two weeks of availability, weekly templates, one completed appointment (with record, note, prescription), one upcoming appointment (with meeting link), and sample notifications.

## Authentication

- **Register:** `POST /api/auth/register` — returns JWT (7-day expiry)
- **Login:** `POST /api/auth/login`
- **Current user:** `GET /api/auth/me` (Bearer token)

Protected routes use `authenticate` middleware. Role-restricted routes use `requireRole('patient')` or `requireRole('doctor')`. SSE accepts `?token=` as an alternative to the Authorization header.

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Login |
| GET | `/me` | JWT | Current user |

### Patients — `/api/patients`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/profile` | patient | Create profile |
| GET | `/profile/me` | patient | Get own profile |
| PATCH | `/profile/me` | patient | Update profile |
| PATCH | `/profile/me/picture` | patient | Set profile picture URL |

### Doctors — `/api/doctors`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/profile` | doctor | Create profile |
| GET | `/profile/me` | doctor | Get own profile |
| PATCH | `/profile/me` | doctor | Update profile |
| PATCH | `/profile/me/picture` | doctor | Set profile picture URL |
| GET | `/` | patient | List/search doctors (`?specialization=`, `?q=`) |
| GET | `/:doctorId` | patient | Doctor profile by ID |

### Appointments — `/api/appointments`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | patient | Book appointment |
| GET | `/patient` | patient | List patient appointments |
| GET | `/doctor` | doctor | List doctor appointments |
| PATCH | `/:appointmentId/reschedule` | patient | Reschedule |
| PATCH | `/:appointmentId/cancel` | patient | Cancel |
| PATCH | `/:appointmentId/complete` | doctor | Mark completed |
| PATCH | `/:appointmentId/status` | doctor | Update status |
| PATCH | `/:appointmentId/meeting` | doctor | Set meeting link/provider |
| GET | `/:appointmentId/meeting` | participant | Get meeting details |

### Availabilities — `/api/availabilities`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | doctor | Create availability window |
| GET | `/doctor` | doctor | List own windows |
| GET | `/doctor/:doctorId` | patient | List doctor windows (`?from=`, `?to=`) |
| DELETE | `/:availabilityId` | doctor | Delete window |

### Availability templates — `/api/availability-templates`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/doctor` | doctor | List templates |
| POST | `/` | doctor | Create template (optional `applyWeeks`) |
| PATCH | `/:templateId` | doctor | Update template |
| DELETE | `/:templateId` | doctor | Delete template |
| POST | `/apply` | doctor | Materialize slots from active templates |

### Medical records — `/api/records`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | doctor | Create record (one per appointment) |
| GET | `/patient` | patient | List own records |
| GET | `/doctor` | doctor | List records created by doctor |
| GET | `/appointment/:appointmentId` | doctor | Record for appointment |

### Consultation notes — `/api/notes`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | doctor | Add note |
| GET | `/patient` | patient | List own notes |
| GET | `/doctor` | doctor | List own notes |
| GET | `/appointment/:appointmentId` | doctor | Notes for appointment |

### Prescriptions — `/api/prescriptions`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | doctor | Create prescription |
| GET | `/patient` | patient | List own prescriptions |
| GET | `/doctor` | doctor | List own prescriptions |
| GET | `/appointment/:appointmentId` | doctor | Prescriptions for appointment |

### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | JWT | List notifications (`?status=`, `?limit=`) |
| GET | `/stream` | JWT | SSE real-time stream |
| GET | `/unread-count` | JWT | Unread count |
| PATCH | `/:notificationId/read` | JWT | Mark one read |
| PATCH | `/read-all` | JWT | Mark all read |

### Recommendations — `/api/recommendations`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | patient | Symptom-based doctor ranking |

## Key Implementation Details

### AI recommendations

Rule-based keyword engine in `utils/recommendations.js`:

- Tokenizes symptom text and removes stopwords
- Scores doctors against 14 specialization keyword maps
- Returns ranked results with matched specialization reasoning
- Logs queries to `RecommendationEvent` for future ML upgrades

This satisfies the MVP “AI recommendation” requirement without an external LLM dependency.

### Real-time notifications

Notifications are persisted in MongoDB and pushed via SSE (`utils/notificationStream.js`). Appointment state changes and availability updates trigger notifications. A background job in `utils/appointmentReminders.js` sends upcoming appointment reminders.

### Video conferencing

The server stores meeting metadata on appointments (`meetingUrl`, `meetingProvider`, `meetingHostUrl`). Link generation for Jitsi happens on the client; Google Meet and Zoom links are entered manually by doctors.

## Security (current)

- bcrypt password hashing (cost factor 12)
- JWT with role-based route protection
- Input validation in route handlers and Mongoose schemas

## Future Enhancements

- Rate limiting, refresh tokens, password reset
- Controllers/service layer split for larger codebase
- LLM-backed recommendations
- Zoom/Meet API integration for automatic link creation
- Email/SMS reminders (Nodemailer, Twilio)
- Automated tests and OpenAPI documentation
