# Telehealth Client Application

React frontend for the telehealth web application. Built with React 19, Vite, and plain CSS, it provides a responsive interface for patients and doctors to manage consultations, schedules, and medical records.

## Tech Stack

- **React 19** — component-based UI
- **Vite 8** — dev server and production builds
- **react-router-dom 7** — client-side routing
- **CSS variables** — theming and layout
- **Fetch API** — REST calls via `src/api/client.js`

## Project Structure

```
client/
├── public/                 # Static assets (favicon, icons)
├── src/
│   ├── api/               # API client (`client.js`)
│   ├── components/
│   │   ├── doctor/        # Doctor dashboard panels and calendar
│   │   ├── layout/        # AppShell, Sidebar
│   │   ├── patient/       # Patient dashboard panels
│   │   ├── shared/        # NotificationsPanel
│   │   └── ui/            # Reusable UI (FormField, SlotPicker, etc.)
│   ├── hooks/             # Custom React hooks (see below)
│   ├── pages/             # AuthPage, PatientDashboardPage, DoctorDashboardPage
│   ├── styles/            # CSS organized by base, components, features, utilities
│   ├── utils/             # datetime, export, avatarColors, availabilityTemplates
│   ├── App.jsx            # Auth gate and role-based route trees
│   └── main.jsx           # Entry point
├── .env                   # VITE_API_BASE_URL
└── package.json
```

## Routing and Authentication

There is no separate `/login` route. Authentication is handled at the app root:

- **Unauthenticated users** see `AuthPage` on all paths.
- **Patients** use `/patient/:section` (e.g. `/patient/doctors`, `/patient/appointments`).
- **Doctors** use `/doctor/:section` (e.g. `/doctor/availability`, `/doctor/clinical`).

Auth state lives in `App.jsx` (not React Context):

- JWT stored in `localStorage` as `authToken`
- User object stored as `authUser`
- `useAuthForm.js` handles register/login and session persistence
- New users are redirected to the profile section until onboarding is complete

### Patient sections

`overview`, `notifications`, `profile`, `doctors`, `ai`, `appointments`, `records`

### Doctor sections

`overview`, `today`, `notifications`, `profile`, `availability`, `appointments`, `clinical`

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuthForm` | Register, login, password validation, session storage |
| `usePatientProfileForm` | Patient profile create/update and picture upload |
| `useDoctorProfileForm` | Doctor profile create/update |
| `useDoctorDiscovery` | Browse, search, and filter doctors; load availability |
| `useRecommendations` | AI symptom-based doctor recommendations |
| `useAppointmentBooking` | Book, reschedule, cancel, fetch meeting links |
| `useDoctorAvailability` | Calendar availability CRUD |
| `useAvailabilityTemplates` | Recurring weekly schedule templates |
| `useDoctorAppointments` | Doctor appointment list and status updates |
| `useNotifications` | SSE stream + polling fallback, unread count |
| `useMedicalRecords` | View/create medical record summaries |
| `useConsultationNotes` | View/create consultation notes |
| `usePrescriptions` | View/create prescriptions |
| `useMeetingLinkGenerator` | Client-side Jitsi URL generation |
| `useModal` | Generic modal open/close state |

## Key Features

### Real-time notifications

`useNotifications.js` connects to `GET /api/notifications/stream` (SSE) with a 20-second polling fallback. Unread counts appear on sidebar nav items.

### AI recommendation

Patients describe symptoms in `PatientAiPanel.jsx`. The backend returns ranked doctors using a keyword-based specialization matcher. The UI includes quick symptom chips (including common Tagalog terms) for faster input.

### Doctor discovery and booking

Patients search by name or specialization, view availability via `SlotPicker`, and book through `PatientBookingConfirmModal`.

### Availability calendar

Doctors manage schedules with `WeekCalendar` (drag-to-select), recurring templates, and manual datetime entry. The calendar scrolls inside its panel at narrow widths and browser zoom levels so it does not overflow sibling content.

### Consultation sessions

Video is handled via third-party links (Jitsi, Google Meet, Zoom). Doctors set meeting URLs; patients join in a new browser tab.

### Medical records

Patients read records, notes, and prescriptions in `PatientRecordsPanel`. Doctors write clinical data in `DoctorClinicalPanel` after appointments.

## Environment Variables

Create `client/.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Demo Accounts

After running the server seed script (`npm run seed` in `server/`), log in with:

| Role | Email | Password |
|------|-------|----------|
| Patient | `patient.demo@ilunas.test` | `Demo1234!` |
| Doctor (Cardiology) | `doctor.cardio@ilunas.test` | `Demo1234!` |
| Doctor (Dermatology) | `doctor.derm@ilunas.test` | `Demo1234!` |
| Doctor (Pediatrics) | `doctor.pedia@ilunas.test` | `Demo1234!` |

## Design Notes

- Healthcare-focused UX: emergency disclaimer for patients, clear appointment statuses, accessible forms
- Responsive layout with collapsible sidebar below 980px
- Local component state + custom hooks; no global state library
- CSS organized to mirror feature areas (`styles/features/`, `styles/components/`)

## Future Enhancements

- React Context or auth provider for cleaner session management
- Embedded video SDK (Jitsi React SDK, Daily.co)
- Token refresh and global 401 handling
- TypeScript, E2E tests, PWA push notifications
