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
