import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';

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
	const [isNewUser, setIsNewUser] = useState(() => {
		try {
			return localStorage.getItem('isNewUser') === 'true';
		} catch {
			return false;
		}
	});

	const role = useMemo(() => user?.role, [user]);

	const handleAuthSuccess = (nextUser, isNew = false) => {
		setUser(nextUser);
		setIsNewUser(isNew);
		if (isNew) {
			localStorage.setItem('isNewUser', 'true');
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('authToken');
		localStorage.removeItem('authUser');
		localStorage.removeItem('isNewUser');
		setUser(null);
		setIsNewUser(false);
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
		const defaultSection = isNewUser ? 'profile' : 'overview';
		return (
			<Routes>
				<Route path="/patient/:section?" element={<PatientDashboardPage onLogout={handleLogout} />} />
				<Route path="*" element={<Navigate to={`/patient/${defaultSection}`} replace />} />
			</Routes>
		);
	}

	if (role === 'doctor') {
		const defaultSection = isNewUser ? 'profile' : 'overview';
		return (
			<Routes>
				<Route path="/doctor/:section?" element={<DoctorDashboardPage onLogout={handleLogout} />} />
				<Route path="*" element={<Navigate to={`/doctor/${defaultSection}`} replace />} />
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
