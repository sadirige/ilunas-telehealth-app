import { useEffect, useMemo, useState } from 'react';
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
		return <AuthPage onAuthSuccess={handleAuthSuccess} />;
	}

	if (role === 'patient') {
		return <PatientProfilePage onLogout={handleLogout} />;
	}

	if (role === 'doctor') {
		return <DoctorProfilePage onLogout={handleLogout} />;
	}

	if (!role) {
		return <AuthPage onAuthSuccess={handleAuthSuccess} />;
	}

	return null;
};

export default App;
