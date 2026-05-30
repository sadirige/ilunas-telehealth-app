# Telehealth Client Application

This is the React frontend for the telehealth web application. Built with React, Vite, and modern JavaScript, it provides a responsive, accessible interface for patients and doctors to manage consultations, schedules, and medical records.

## Tech Stack

- **React 19** - UI library with component-based architecture
- **Vite** - Build tool for fast development and optimized production builds
- **CSS Variables** - For consistent theming and design system
- **Fetch API** - For HTTP requests to backend

## Project Structure

```
client/
├── public/              # Static assets (favicon, icons)
├── src/
│   ├── api/            # API client and endpoint functions
│   ├── assets/         # Images and other static resources
│   ├── components/     # Reusable UI components
│   │   ├── doctor/    # Doctor-specific components
│   │   ├── layout/    # Layout components (Sidebar, etc.)
│   │   ├── patient/   # Patient-specific components
│   │   ├── shared/    # Shared components between roles
│   │   └── ui/        # Generic UI components (buttons, forms, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page-level components
│   ├── styles/         # CSS stylesheets organized by feature
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
├── .env                # Environment variables
├── .gitignore          # Git ignore rules
├── eslint.config.js    # ESLint configuration
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## Folder Structure Rationale

### `src/api/`
Contains the API client (`client.js`) that handles all HTTP requests to the backend. This centralizes request logic, including JWT authentication headers, error handling, and network error detection. Having a single API client ensures consistent request/response handling across the application.

### `src/components/`
Components are organized by role and purpose:
- **`doctor/`**: Components specific to doctor workflows (availability management, appointment management)
- **`patient/`**: Components specific to patient workflows (doctor discovery, AI recommendations, appointment booking)
- **`layout/`**: Layout components that structure the application (Sidebar)
- **`shared/`**: Components used by both patient and doctor roles
- **`ui/`**: Generic, reusable UI components (FormField, SlotPicker, EmptyState, etc.)

This organization makes the codebase maintainable by grouping related functionality and making it easy to find components by their purpose.

### `src/hooks/`
Custom React hooks that encapsulate reusable stateful logic:
- `useAuth` - Authentication state and logout
- `useNotifications` - Real-time notification handling with SSE
- `useAppointments` - Appointment data fetching and management
- `useDoctors` - Doctor data fetching
- `useAvailabilities` - Availability data fetching
- `usePrescriptions` - Prescription data fetching
- `useNotes` - Consultation notes data fetching

Hooks follow the single responsibility principle and keep component logic clean and reusable.

### `src/pages/`
Page-level components that represent major application routes:
- `AuthPage` - Registration and login
- `PatientDashboardPage` - Patient main dashboard
- `DoctorDashboardPage` - Doctor main dashboard

Pages orchestrate components and manage page-level state.

### `src/styles/`
CSS stylesheets organized by feature:
- **`base/`** - Base styles (reset, typography, sidebar)
- **`components/`** - Component-specific styles (panels, forms)
- **`features/`** - Feature-specific styles (doctor-card, slot-picker)
- **`pages/`** - Page-specific styles

This organization mirrors the component structure, making it easy to locate styles for specific features.

### `src/utils/`
Utility functions that are not React-specific:
- `avatarColors.js` - Generates consistent colors for profile picture placeholders
- `dateUtils.js` - Date formatting and manipulation
- `validation.js` - Form validation helpers

## Key Features Implementation

### Authentication
Authentication is handled by the `useAuth` hook, which:
- Stores JWT token in localStorage
- Provides login/logout functions
- Manages user state (user data, role)
- Redirects unauthenticated users to login page

The `api/client.js` automatically includes the JWT token in the Authorization header for all requests.

### Real-Time Notifications
Real-time notifications are implemented using Server-Sent Events (SSE) via the `useNotifications` hook:
- Establishes SSE connection to `/api/notifications/stream`
- Handles connection failures with exponential backoff retry logic
- Maintains notification state and unread count
- Provides status messages for reconnection attempts
- Automatically cleans up connections on unmount

SSE was chosen over WebSockets for simplicity and because we only need one-way server-to-client communication.

### AI Recommendation
The AI recommendation feature allows patients to describe symptoms and get matched with appropriate doctors:
- Symptom input with Tagalog symptom buttons for accessibility
- Backend processes symptoms and returns ranked doctor recommendations
- Displays matched symptoms as reasoning for each recommendation
- Toggleable Tagalog buttons that gray out when selected

The frontend handles user input, displays results, and manages appointment booking from recommendations.

### Doctor Discovery
Doctor discovery allows patients to browse and filter doctors:
- Search by name, symptoms, or specialization
- Filter by medical specialization
- View doctor profiles, availability, and consultation fees
- Book appointments directly from search results

### Appointment Booking
Appointment booking workflow:
- View doctor availability via SlotPicker component
- Select time slot
- Confirm booking
- Receive real-time notifications for booking confirmation
- Reschedule or cancel appointments

### Availability Management
Doctors manage availability through:
- WeekCalendar component for visual schedule management
- Availability templates for recurring schedules
- Manual time slot entry
- Real-time notifications for booking updates

### Profile Picture Placeholders
Profile picture placeholders use Gmail-style colored circles:
- `getAvatarColor()` utility generates consistent colors based on username
- 16 predefined colors for variety
- First letter of name displayed in uppercase
- White text for contrast on colored backgrounds

## Environment Variables

Create a `.env` file in the client directory:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Development

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Deployment

The client is designed to be deployed on Vercel for:
- Automatic HTTPS
- Global CDN
- Preview deployments
- Fast builds with Vite

## Design Principles

### Healthcare UX
- Trustworthy design with clear error messages
- Accessible with WCAG AA color contrast
- Semantic HTML and ARIA labels
- Keyboard navigation support
- Mobile-responsive design

### State Management
- Local component state for UI-specific state
- React Context for cross-component state (authentication)
- Custom hooks for reusable stateful logic
- API client for server state management

### Code Organization
- Component-based architecture for reusability
- Clear separation of concerns (UI, logic, data)
- Meaningful naming conventions
- Consistent file structure

## Future Enhancements

- TypeScript for type safety
- State management library (Redux/Zustand) for complex state
- End-to-end testing with Playwright
- Service workers for offline support
- Push notifications for mobile users
- Internationalization (i18n) for multi-language support
