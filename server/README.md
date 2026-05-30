# Telehealth Server Application

This is the Express.js backend for the telehealth web application. Built with Node.js, Express, and MongoDB, it provides REST API endpoints for authentication, appointment management, real-time notifications, and AI-powered doctor recommendations.

## Tech Stack

- **Node.js** - JavaScript runtime for server-side execution
- **Express.js** - Web framework for building REST APIs
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - ODM for MongoDB with schema validation
- **bcrypt** - Password hashing for security
- **jsonwebtoken** - JWT authentication
- **Server-Sent Events (SSE)** - Real-time notifications

## Project Structure

```
server/
├── src/
│   ├── config/         # Database configuration
│   ├── middleware/     # Custom middleware (auth, role-based access)
│   ├── models/         # Mongoose schemas and models
│   ├── routes/         # API route handlers
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app configuration
│   └── server.js       # Server entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Folder Structure Rationale

### `src/config/`
Contains database configuration:
- `db.js` - MongoDB connection setup using Mongoose

Centralizing database configuration makes it easy to modify connection settings (development vs production) and ensures consistent connection handling across the application.

### `src/middleware/`
Custom middleware for request processing:
- `auth.js` - JWT authentication middleware that verifies tokens and attaches user to request
- `requireRole.js` - Role-based access control middleware that restricts routes to specific roles (patient/doctor)

Middleware is organized separately from routes to promote reusability and separation of concerns. Authentication and authorization logic is decoupled from route handlers.

### `src/models/`
Mongoose schemas and models for MongoDB collections:
- `User.js` - User authentication and role assignment
- `PatientProfile.js` - Patient profile information
- `DoctorProfile.js` - Doctor profile information
- `Appointment.js` - Appointment scheduling and management
- `Availability.js` - Doctor availability time slots
- `ConsultationNote.js` - Doctor consultation notes
- `Prescription.js` - Medical prescriptions
- `Notification.js` - User notifications
- `RecommendationEvent.js` - AI recommendation query logging

Models enforce data integrity at the database level through schema validation, ensuring consistent data structure and preventing invalid data.

### `src/routes/`
API route handlers organized by feature:
- `auth.js` - Registration, login, and current user endpoints
- `patients.js` - Patient profile CRUD operations
- `doctors.js` - Doctor profile CRUD operations and search
- `appointments.js` - Appointment booking, rescheduling, cancellation, and status updates
- `availabilities.js` - Availability creation, retrieval, and deletion
- `notes.js` - Consultation notes creation and retrieval
- `prescriptions.js` - Prescription creation and retrieval
- `notifications.js` - Notification retrieval and SSE streaming
- `recommendations.js` - AI-powered doctor recommendations

Routes are organized by domain, making it easy to locate and modify specific functionality. Each route file handles all CRUD operations for its domain.

### `src/utils/`
Utility functions that support business logic:
- `recommendations.js` - AI recommendation engine with symptom-to-specialty matching
- `dateUtils.js` - Date formatting and validation helpers

Utility functions are separated from routes to promote reusability and testability.

### `src/app.js`
Express application configuration:
- Middleware setup (CORS, JSON parsing, error handling)
- Route registration
- Global error handler

Centralizing app configuration makes it easy to modify middleware order, add new middleware, or change error handling strategy.

### `src/server.js`
Server entry point:
- Database connection initialization
- HTTP server startup
- Graceful shutdown handling

Keeps server bootstrap logic separate from app configuration for cleaner separation of concerns.

## Key Features Implementation

### Authentication & Authorization
Authentication uses JWT tokens with bcrypt password hashing:
- **Registration**: Validates email uniqueness, role validity, and required fields
- **Login**: Verifies credentials and issues JWT token
- **Protected Routes**: `authenticate` middleware verifies JWT token and attaches user to request
- **Role-Based Access**: `requireRole` middleware restricts routes to specific roles (patient/doctor)

JWT tokens are stored in localStorage on the client and sent in the Authorization header (Bearer token) for all protected requests.

### Real-Time Notifications
Real-time notifications use Server-Sent Events (SSE):
- **Streaming Endpoint**: `/api/notifications/stream` establishes SSE connection
- **Event Types**: New notifications, connection status updates
- **Client-Side Retry**: Exponential backoff with max 5 attempts
- **Connection Cleanup**: Automatic cleanup on client disconnect

SSE was chosen over WebSockets because:
- Simpler to implement over standard HTTP
- One-way communication (server to client) is sufficient
- Better browser support
- Easier to debug

### AI Recommendation System
The AI recommendation engine uses keyword-based matching:
- **Symptom Tokenization**: Splits symptoms into tokens, removes stopwords
- **Specialization Scoring**: Matches symptom tokens to specialization keywords
- **Doctor Scoring**: Combines specialization match score with text similarity in doctor bio
- **Ranking**: Sorts doctors by score and returns top matches
- **Reasoning**: Returns matched symptoms for each recommendation

**Symptom-to-Specialization Knowledge Base**:
- 14 medical specializations with 15+ symptom keywords each
- Covers cardiology, dermatology, neurology, pediatrics, psychiatry, orthopedics, gastroenterology, pulmonology, ENT, ophthalmology, family medicine, internal medicine, obstetrics/gynecology, urology

**Logging**: All recommendation queries are logged to `RecommendationEvent` for analytics and future ML model training.

### Appointment Management
Appointment workflow with comprehensive validation:
- **Creation**: Validates date, doctor availability, time slot availability, and doctor status
- **Rescheduling**: Validates new date, checks for conflicts, verifies doctor availability
- **Cancellation**: Only allows cancellation of scheduled appointments
- **Status Updates**: Validates status transitions (scheduled → completed/canceled)
- **Meeting Details**: Updates video conferencing links (Google Meet, Zoom, Jitsi Meet)

**Notifications**: Real-time notifications are sent for all appointment state changes.

### Availability Management
Doctor availability management:
- **Creation**: Validates date format, ensures end time is after start time
- **Retrieval**: Query availability by date range with validation
- **Deletion**: Removes availability slots with notification to affected patients

**Templates**: Doctors can create availability templates for recurring schedules (not yet implemented in UI, but supported by data model).

### Consultation Notes & Prescriptions
Post-appointment documentation:
- **Notes**: Doctors add consultation notes for their own appointments only
- **Prescriptions**: Doctors prescribe medications for their own appointments only
- **Access Control**: Patients can only view notes/prescriptions from their own appointments
- **Validation**: Required fields (medication name, dosage, etc.) are validated

### Error Handling
Comprehensive error handling with specific, actionable messages:
- **Registration**: Distinguishes between invalid roles, existing emails, and missing fields
- **Login**: Distinguishes between missing fields, no account found, and incorrect password
- **Appointments**: Specific errors for invalid dates, doctor not found, time conflicts, doctor unavailability
- **Availabilities**: Specific errors for invalid date format and end time before start time
- **Profiles**: Specific errors for profile not found vs profile already exists

Error messages guide users toward resolution rather than generic failure messages.

## Database Schema

### Collections

**Users**
- Email, password (hashed), role (patient/doctor)

**PatientProfiles**
- Name, birthday, weight, height, profile picture URL, contact details, medical history

**DoctorProfiles**
- Name, bio, specialization, credentials, consultation fee, profile picture URL

**Appointments**
- Patient, doctor, date, time, status (scheduled/completed/canceled), meeting details (provider, URL)

**Availabilities**
- Doctor, date, start time, end time, recurring flag

**ConsultationNotes**
- Appointment, doctor, notes, summary

**Prescriptions**
- Appointment, doctor, medication name, dosage, frequency, instructions

**Notifications**
- User, type, message, read status, created at

**RecommendationEvents**
- User, query (symptoms), matched specializations, recommended specializations, created at

### Relationships
- Appointments reference Patient and Doctor (via User IDs)
- ConsultationNotes and Prescriptions reference Appointment
- Availabilities reference Doctor (via User ID)
- Notifications reference User

References are used instead of embedded documents for better scalability and data consistency.

## Environment Variables

Create a `.env` file in the server directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ilunas
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

## Development

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm start
```

Or with nodemon for auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Patients
- `POST /api/patients` - Create patient profile
- `GET /api/patients` - Get patient profile
- `PUT /api/patients` - Update patient profile
- `PUT /api/patients/picture` - Update profile picture

### Doctors
- `POST /api/doctors` - Create doctor profile
- `GET /api/doctors` - Get doctor profile
- `PUT /api/doctors` - Update doctor profile
- `GET /api/doctors/search` - Search doctors
- `GET /api/doctors/:id` - Get specific doctor profile

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/:id` - Get specific appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `PUT /api/appointments/:id/complete` - Complete appointment
- `PUT /api/appointments/:id/status` - Update appointment status
- `PUT /api/appointments/:id/meeting` - Update meeting details

### Availabilities
- `POST /api/availabilities` - Create availability
- `GET /api/availabilities` - Query availability
- `DELETE /api/availabilities/:id` - Delete availability

### Notes
- `POST /api/notes` - Create consultation note
- `GET /api/notes/:appointmentId` - Get consultation notes

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:appointmentId` - Get prescriptions

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/stream` - SSE stream for real-time notifications
- `GET /api/notifications/unread-count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark notification as read

### Recommendations
- `POST /api/recommendations` - Get AI doctor recommendations

## Security Considerations

### Current Implementation
- Password hashing with bcrypt
- JWT authentication with token expiration
- Role-based access control
- Input validation in API routes
- SQL injection prevention (MongoDB inherently prevents this)

### Future Enhancements
- Rate limiting to prevent brute force attacks
- Input sanitization to prevent XSS
- CORS configuration for production domains
- HTTPS enforcement
- Token refresh mechanism
- Audit logging for sensitive operations
- HIPAA compliance measures (encryption at rest, audit trails, access controls)

## Performance Considerations

### Current Implementation
- Stateless API for horizontal scaling
- MongoDB indexing on frequently queried fields
- Efficient database queries with Mongoose
- SSE for real-time notifications (single connection per user)

### Future Enhancements
- Redis caching for frequently accessed data
- Database connection pooling
- Query optimization with explain plans
- Load balancing with multiple server instances
- Message queue (Redis Pub/Sub) for notification delivery
- CDN for static assets

## Deployment

The server can be deployed on:
- **Render** - Easy MongoDB integration, auto-scaling
- **Railway** - Similar to Render with good MongoDB support
- **Heroku** - Requires add-on for MongoDB
- **AWS/Google Cloud** - More control, requires more setup

For production:
- Use environment variables for sensitive data
- Enable HTTPS
- Configure CORS for production domains
- Set up monitoring and logging
- Implement health check endpoint

## Design Principles

### RESTful API Design
- Resource-based URLs (e.g., `/api/appointments`)
- HTTP methods for actions (GET, POST, PUT, DELETE)
- Status codes for responses (200, 201, 400, 401, 403, 404, 500)
- JSON for request/response bodies

### Error Handling
- Specific error messages for better UX
- Consistent error response format
- Proper HTTP status codes
- Validation at both API and database levels

### Code Organization
- Separation of concerns (routes, middleware, models, utils)
- Single responsibility principle
- DRY (Don't Repeat Yourself)
- Clear naming conventions

## Future Enhancements

- **Testing**: Unit tests for utility functions, integration tests for API endpoints
- **Logging**: Structured logging with Winston or Pino
- **Monitoring**: APM with New Relic or Datadog
- **Rate Limiting**: Express-rate-limit middleware
- **File Upload**: Cloudinary integration for profile pictures
- **Email Notifications**: Nodemailer for appointment reminders
- **SMS Notifications**: Twilio integration for urgent updates
- **Analytics**: Track user behavior and system performance
- **API Documentation**: Swagger/OpenAPI specification
