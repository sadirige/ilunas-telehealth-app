# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Telehealth API (Backend)

Base URL: `http://localhost:5000`

### Authentication

POST `/api/auth/register`

Response
```json
{
	"token": "<jwt>",
	"user": {
		"id": "<userId>",
		"email": "patient1@example.com",
		"role": "patient",
		"displayName": "Patient One"
	}
}
```

POST `/api/auth/login`

Response
```json
{
	"token": "<jwt>",
	"user": {
		"id": "<userId>",
		"email": "patient1@example.com",
		"role": "patient",
		"displayName": "Patient One"
	}
}
```

GET `/api/auth/me`

Response
```json
{
	"user": {
		"id": "<userId>",
		"email": "patient1@example.com",
		"role": "patient",
		"displayName": "Patient One"
	}
}
```

### Patient Profiles

POST `/api/patients/profile`

Response
```json
{
	"profile": {
		"id": "<profileId>",
		"user": "<userId>",
		"name": "Patient One",
		"birthday": "1998-05-10T00:00:00.000Z",
		"weight": 72,
		"height": 170,
		"profilePictureUrl": "https://example.com/patient.jpg",
		"contactDetails": {
			"phone": "+1-555-0100",
			"address": "123 Main St",
			"emergencyContact": "+1-555-0199"
		},
		"medicalHistory": "Asthma"
	}
}
```

GET `/api/patients/profile/me`

Response
```json
{
	"profile": {
		"id": "<profileId>",
		"user": "<userId>",
		"name": "Patient One",
		"birthday": "1998-05-10T00:00:00.000Z",
		"weight": 72,
		"height": 170,
		"profilePictureUrl": "https://example.com/patient.jpg",
		"contactDetails": {
			"phone": "+1-555-0100",
			"address": "123 Main St",
			"emergencyContact": "+1-555-0199"
		},
		"medicalHistory": "Asthma"
	}
}
```

PATCH `/api/patients/profile/me`

Response
```json
{
	"profile": {
		"id": "<profileId>",
		"user": "<userId>",
		"name": "Patient One",
		"birthday": "1998-05-10T00:00:00.000Z",
		"weight": 70,
		"height": 170,
		"profilePictureUrl": "https://example.com/patient.jpg",
		"contactDetails": {
			"phone": "+1-555-0100",
			"address": "123 Main St",
			"emergencyContact": "+1-555-0199"
		},
		"medicalHistory": "Asthma, seasonal allergies"
	}
}
```

### Doctor Profiles

POST `/api/doctors/profile`

Response
```json
{
	"profile": {
		"id": "<profileId>",
		"user": "<userId>",
		"name": "Dr. Jane Smith",
		"bio": "Board-certified family physician.",
		"specialization": "Family Medicine",
		"profilePictureUrl": "https://example.com/doctor.jpg"
	}
}
```

GET `/api/doctors/profile/me`

Response
```json
{
	"profile": {
		"id": "<profileId>",
		"user": "<userId>",
		"name": "Dr. Jane Smith",
		"bio": "Board-certified family physician.",
		"specialization": "Family Medicine",
		"profilePictureUrl": "https://example.com/doctor.jpg"
	}
}
```

PATCH `/api/doctors/profile/me`

Response
```json
{
	"profile": {
		"id": "<profileId>",
		"user": "<userId>",
		"name": "Dr. Jane Smith",
		"bio": "Board-certified family physician with 10 years of experience.",
		"specialization": "Family Medicine",
		"profilePictureUrl": "https://example.com/doctor.jpg"
	}
}
```

### Doctor Discovery (Patient-Only)

GET `/api/doctors`

Response
```json
{
	"results": [
		{
			"id": "<profileId>",
			"userId": "<userId>",
			"name": "Dr. Jane Smith",
			"bio": "Board-certified family physician.",
			"specialization": "Family Medicine",
			"profilePictureUrl": "https://example.com/doctor.jpg"
		}
	]
}
```

GET `/api/doctors/:doctorId`

Response
```json
{
	"profile": {
		"id": "<profileId>",
		"userId": "<userId>",
		"name": "Dr. Jane Smith",
		"bio": "Board-certified family physician.",
		"specialization": "Family Medicine",
		"profilePictureUrl": "https://example.com/doctor.jpg"
	}
}
```

### Appointments

POST `/api/appointments`

Response
```json
{
	"appointment": {
		"id": "<appointmentId>",
		"patient": "<patientUserId>",
		"doctor": "<doctorUserId>",
		"doctorProfile": "<doctorProfileId>",
		"scheduledAt": "2026-05-30T15:00:00.000Z",
		"durationMinutes": 30,
		"reason": "Headache",
		"meetingUrl": "https://meet.example.com/room",
		"status": "scheduled"
	}
}
```

GET `/api/appointments/patient`

Response
```json
{
	"results": [
		{
			"id": "<appointmentId>",
			"patient": "<patientUserId>",
			"doctor": "<doctorUserId>",
			"doctorProfile": "<doctorProfileId>",
			"scheduledAt": "2026-05-30T15:00:00.000Z",
			"durationMinutes": 30,
			"reason": "Headache",
			"meetingUrl": "https://meet.example.com/room",
			"status": "scheduled"
		}
	]
}
```

GET `/api/appointments/doctor`

Response
```json
{
	"results": [
		{
			"id": "<appointmentId>",
			"patient": "<patientUserId>",
			"doctor": "<doctorUserId>",
			"doctorProfile": "<doctorProfileId>",
			"scheduledAt": "2026-05-30T15:00:00.000Z",
			"durationMinutes": 30,
			"reason": "Headache",
			"meetingUrl": "https://meet.example.com/room",
			"status": "scheduled"
		}
	]
}
```

PATCH `/api/appointments/:appointmentId/reschedule`

Response
```json
{
	"appointment": {
		"id": "<appointmentId>",
		"patient": "<patientUserId>",
		"doctor": "<doctorUserId>",
		"doctorProfile": "<doctorProfileId>",
		"scheduledAt": "2026-06-01T16:00:00.000Z",
		"durationMinutes": 30,
		"reason": "Headache",
		"meetingUrl": "https://meet.example.com/room",
		"status": "scheduled"
	}
}
```

PATCH `/api/appointments/:appointmentId/cancel`

Response
```json
{
	"appointment": {
		"id": "<appointmentId>",
		"patient": "<patientUserId>",
		"doctor": "<doctorUserId>",
		"doctorProfile": "<doctorProfileId>",
		"scheduledAt": "2026-05-30T15:00:00.000Z",
		"durationMinutes": 30,
		"reason": "Headache",
		"meetingUrl": "https://meet.example.com/room",
		"status": "canceled"
	}
}
```

PATCH `/api/appointments/:appointmentId/meeting`

Response
```json
{
	"appointment": {
		"id": "<appointmentId>",
		"patient": "<patientUserId>",
		"doctor": "<doctorUserId>",
		"doctorProfile": "<doctorProfileId>",
		"scheduledAt": "2026-05-30T15:00:00.000Z",
		"durationMinutes": 30,
		"reason": "Headache",
		"meetingUrl": "https://meet.jit.si/ilunas-123",
		"meetingProvider": "jitsi",
		"meetingHostUrl": "https://meet.jit.si/ilunas-123#host",
		"meetingMeta": {
			"roomName": "ilunas-123"
		},
		"status": "scheduled"
	}
}
```

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('Meeting details are present', function () {
	const data = pm.response.json();
	pm.expect(data.appointment.meetingUrl).to.exist;
});
```

GET `/api/appointments/:appointmentId/meeting`

Response
```json
{
	"meeting": {
		"meetingUrl": "https://meet.jit.si/ilunas-123",
		"meetingProvider": "jitsi",
		"meetingHostUrl": "https://meet.jit.si/ilunas-123#host",
		"meetingMeta": {
			"roomName": "ilunas-123"
		}
	}
}
```

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('Meeting payload includes url', function () {
	const data = pm.response.json();
	pm.expect(data.meeting.meetingUrl).to.exist;
});
```

### Availabilities

POST `/api/availabilities`

Response
```json
{
	"availability": {
		"id": "<availabilityId>",
		"doctor": "<doctorUserId>",
		"startAt": "2026-05-30T14:00:00.000Z",
		"endAt": "2026-05-30T18:00:00.000Z",
		"isAvailable": true
	}
}
```

GET `/api/availabilities/doctor`

Response
```json
{
	"results": [
		{
			"id": "<availabilityId>",
			"doctor": "<doctorUserId>",
			"startAt": "2026-05-30T14:00:00.000Z",
			"endAt": "2026-05-30T18:00:00.000Z",
			"isAvailable": true
		}
	]
}
```

GET `/api/availabilities/doctor/:doctorId?from=2026-05-30T00:00:00.000Z&to=2026-05-31T00:00:00.000Z`

Notes

- The date range query returns availability windows that overlap the range.
- The match uses `endAt >= from` and `startAt <= to` when both are provided.
- If only `from` is provided, windows ending after `from` are returned.
- If only `to` is provided, windows starting before `to` are returned.

Response
```json
{
	"results": [
		{
			"id": "<availabilityId>",
			"doctor": "<doctorUserId>",
			"startAt": "2026-05-30T14:00:00.000Z",
			"endAt": "2026-05-30T18:00:00.000Z",
			"isAvailable": true
		}
	]
}
```

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('Availability results contain time windows', function () {
	const data = pm.response.json();
	pm.expect(data.results).to.be.an('array');
	if (data.results.length > 0) {
		pm.expect(data.results[0]).to.have.property('startAt');
		pm.expect(data.results[0]).to.have.property('endAt');
	}
});
```

DELETE `/api/availabilities/:availabilityId`

Response
```json
{
	"availability": {
		"id": "<availabilityId>",
		"doctor": "<doctorUserId>",
		"startAt": "2026-05-30T14:00:00.000Z",
		"endAt": "2026-05-30T18:00:00.000Z",
		"isAvailable": true
	}
}
```

### Notifications

GET `/api/notifications?status=unread&limit=20`

Response
```json
{
	"results": [
		{
			"id": "<notificationId>",
			"type": "appointment_booked",
			"title": "Appointment booked",
			"message": "Your appointment is scheduled.",
			"data": {
				"appointmentId": "<appointmentId>"
			},
			"readAt": null,
			"createdAt": "2026-05-28T12:00:00.000Z"
		}
	]
}
```

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('Notifications return a list', function () {
	const data = pm.response.json();
	pm.expect(data.results).to.be.an('array');
});
```

GET `/api/notifications/stream`

Notes

- This is a Server-Sent Events (SSE) stream that stays open.
- Use the `Authorization: Bearer <token>` header.
- Postman can open the stream, but it will not terminate until you stop it.

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('SSE stream is open', function () {
	pm.expect(pm.response.headers.get('Content-Type')).to.include('text/event-stream');
});
```

GET `/api/notifications/unread-count`

Response
```json
{
	"unreadCount": 2
}
```

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('Unread count is a number', function () {
	const data = pm.response.json();
	pm.expect(data.unreadCount).to.be.a('number');
});
```

PATCH `/api/notifications/:notificationId/read`

Response
```json
{
	"notification": {
		"id": "<notificationId>",
		"type": "appointment_booked",
		"title": "Appointment booked",
		"message": "Your appointment is scheduled.",
		"data": {
			"appointmentId": "<appointmentId>"
		},
		"readAt": "2026-05-28T12:05:00.000Z",
		"createdAt": "2026-05-28T12:00:00.000Z"
	}
}
```

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('Notification is marked read', function () {
	const data = pm.response.json();
	pm.expect(data.notification.readAt).to.exist;
});
```

PATCH `/api/notifications/read-all`

Response
```json
{
	"updated": 3
}
```

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('Updated count is a number', function () {
	const data = pm.response.json();
	pm.expect(data.updated).to.be.a('number');
});
```

### AI Recommendations (Keyword-Based MVP)

POST `/api/recommendations`

Request
```json
{
	"symptoms": "headache and dizziness",
	"limit": 5
}
```

Response
```json
{
	"query": "headache and dizziness",
	"matchedSpecializations": ["neurology"],
	"recommendations": [
		{
			"id": "<profileId>",
			"userId": "<userId>",
			"name": "Dr. Jane Smith",
			"bio": "Board-certified family physician.",
			"specialization": "Neurology",
			"profilePictureUrl": "https://example.com/doctor.jpg",
			"score": 2.25
		}
	]
}
```

Postman test snippet
```javascript
pm.test('Status is 200', function () {
	pm.response.to.have.status(200);
});

pm.test('Recommendations include a list', function () {
	const data = pm.response.json();
	pm.expect(data.recommendations).to.be.an('array');
});
```

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
