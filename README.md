# Telehealth Web Application

A functional telehealth web application built with the MERN stack that enables patients to register, discover doctors, book consultations, and access medical records. Doctors can manage schedules, conduct virtual consultations, and document patient care.

## Architecture Overview

This application follows a clean three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│                   (React + Vite)                        │
│  - Patient Dashboard                                    │
│  - Doctor Dashboard                                     │
│  - Real-time notifications (SSE)                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│                   Server Layer                          │
│                (Express.js + Node)                      │
│  - Authentication (JWT)                                 │
│  - Role-based access control                            │
│  - Appointment management                               │
│  - AI recommendation engine                             │
│  - Real-time notifications (SSE)                        │
└────────────────────┬────────────────────────────────────┘
                     │ MongoDB
┌────────────────────▼────────────────────────────────────┐
│                  Data Layer                             │
│                   (MongoDB)                             │
│  - Users, PatientProfiles, DoctorProfiles               │
│  - Appointments, Availabilities                         │
│  - ConsultationNotes, Prescriptions                     │
│  - Notifications, RecommendationEvents                  │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: React 19, Vite, CSS Variables
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Real-Time**: Server-Sent Events (SSE)
- **Video Conferencing**: Google Meet, Zoom, Jitsi Meet integration

## Project Structure

```
ilunas/
├── client/              # React frontend application
│   ├── src/
│   │   ├── api/        # API client and endpoint functions
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Page-level components
│   │   ├── styles/     # CSS stylesheets
│   │   └── utils/      # Utility functions
│   └── README.md       # Client documentation
├── server/             # Express.js backend application
│   ├── src/
│   │   ├── config/     # Database configuration
│   │   ├── middleware/ # Custom middleware
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # API route handlers
│   │   └── utils/      # Utility functions
│   └── README.md       # Server documentation
├── .gitignore          # Git ignore rules
├── DEMO_SCRIPT.md      # Demo presentation script
└── README.md           # This file (architecture overview)
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ilunas
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create `.env` file in `server/`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ilunas
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

Create `.env` file in `client/`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in server/.env
```

6. **Start the server**
```bash
cd server
npm start
```

7. **Start the client**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Documentation

For detailed documentation on each part of the application, refer to:

- **[Client Documentation](./client/README.md)** - React frontend architecture, components, hooks, and UI implementation
- **[Server Documentation](./server/README.md)** - Express.js backend architecture, API endpoints, database schema, and business logic

## Key Features

### Patient Module
- **Account Creation**: Secure registration with email/password authentication
- **Doctor Discovery**: Browse and filter doctors by specialization
- **AI Recommendation**: Symptom-based doctor matching with Tagalog support
- **Appointment Booking**: Schedule, reschedule, and cancel consultations
- **Consultation Sessions**: Join video calls via integrated providers
- **Medical Records**: View appointment history, notes, and prescriptions

### Doctor Module
- **Profile Management**: Complete doctor profiles with specialization and credentials
- **Schedule Management**: Define availability using responsive calendar interface
- **Appointment Management**: View and manage patient appointments
- **Consultation Sessions**: Conduct virtual consultations
- **Documentation**: Add consultation notes and prescriptions

### Real-Time Features
- **Notifications**: Server-Sent Events for instant updates
- **Appointment Updates**: Real-time booking confirmations and reminders
- **Schedule Changes**: Instant notifications for availability updates

## Architecture Decisions

### Why MERN Stack?
- **Full JavaScript**: Reduces context switching between languages
- **MongoDB**: Flexible schema for rapid MVP iteration
- **Express.js**: Lightweight, unopinionated framework for REST APIs
- **React**: Component-based architecture for reusable UI
- **Node.js**: Non-blocking I/O for real-time features

### Why Server-Sent Events (SSE)?
- Simpler than WebSockets for one-way server-to-client communication
- Works over standard HTTP
- Better browser support
- Sufficient for notification use case

### Why Three-Tier Architecture?
- Clear separation of concerns
- Independent scaling of frontend and backend
- Easier to maintain and test
- Supports microservices migration in future

## Deployment

### Frontend Deployment (Vercel)
The client is designed for Vercel deployment:
- Automatic HTTPS
- Global CDN
- Preview deployments
- Fast builds with Vite

### Backend Deployment (Render/Railway)
The server can be deployed on:
- Render (MongoDB integration)
- Railway (MongoDB support)
- Heroku (MongoDB add-on)
- AWS/Google Cloud (more control)

## Development Workflow

1. **Feature Development**: Work on features in separate branches
2. **Testing**: Test API endpoints with Postman/Insomnia
3. **Integration**: Test frontend-backend integration
4. **Code Review**: Review changes before merging
5. **Deployment**: Deploy to staging/production

## Future Enhancements

- **Testing**: Unit tests, integration tests, E2E tests
- **Monitoring**: APM with New Relic or Datadog
- **Caching**: Redis for frequently accessed data
- **Message Queue**: Redis Pub/Sub for notification delivery
- **TypeScript**: Type safety across the codebase
- **State Management**: Redux/Zustand for complex state
- **Email Notifications**: Nodemailer for appointment reminders
- **File Upload**: Cloudinary integration for profile pictures
- **HIPAA Compliance**: Encryption, audit logs, access controls

## Obsolete Files

The following files in the parent directory are obsolete and should be deleted:
- `public/` - Default React create-react-app template (use `client/public/` instead)
- `src/` - Default React create-react-app template (use `client/src/` instead)
- `package.json` - Default React create-react-app template (use `client/package.json` and `server/package.json` instead)
- `package-lock.json` - Default React create-react-app template (use `client/package-lock.json` and `server/package-lock.json` instead)

After deletion, the parent directory should only contain:
- `.git/` - Git repository
- `.gitignore` - Git ignore rules
- `client/` - React frontend
- `server/` - Express.js backend
- `DEMO_SCRIPT.md` - Demo presentation script
- `README.md` - This file

## License

This project is for demonstration purposes in the Build Round of White Cloak Technologies, Inc.'s Launchpad Program.

