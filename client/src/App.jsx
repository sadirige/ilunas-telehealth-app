import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import PatientProfilePage from './pages/PatientProfilePage';
import DoctorProfilePage from './pages/DoctorProfilePage';

const getStoredUser = () => {
	try {
		const raw = localStorage.getItem('authUser');
		if (!raw) {
			return null;
		}

		const parsed = JSON.parse(raw);
		const validRoles = ['patient', 'doctor'];

		if (!parsed || !validRoles.includes(parsed.role)) {
			localStorage.removeItem('authToken');
			localStorage.removeItem('authUser');
			return null;
		}

		return parsed;
	} catch (error) {
		return null;
	}
};

const App = () => {
	const [user, setUser] = useState(getStoredUser);

	const role = useMemo(() => user?.role, [user]);

	const handleAuthSuccess = (nextUser) => {
		setUser(nextUser);
	};

	const handleLogout = () => {
		localStorage.removeItem('authToken');
		localStorage.removeItem('authUser');
		setUser(null);
	};

	useEffect(() => {
		if (user && !role) {
			handleLogout();
		}
	}, [user, role]);

	if (!user) {
		return (
			<Routes>
				<Route path="*" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
			</Routes>
		);
	}

	if (role === 'patient') {
		return (
			<Routes>
				<Route path="/patient/:section?" element={<PatientProfilePage onLogout={handleLogout} />} />
				<Route path="*" element={<Navigate to="/patient/overview" replace />} />
			</Routes>
		);
	}

	if (role === 'doctor') {
		return (
			<Routes>
				<Route path="/doctor/:section?" element={<DoctorProfilePage onLogout={handleLogout} />} />
				<Route path="*" element={<Navigate to="/doctor/overview" replace />} />
			</Routes>
		);
	}

	if (!role) {
		return (
			<Routes>
				<Route path="*" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
			</Routes>
		);
	}

	return null;
};

export default App;
