import { useState } from 'react';
import { loginUser, registerUser } from '../api/client';

const roles = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' }
];

const initialRegisterState = {
  email: '',
  password: '',
  displayName: '',
  role: 'patient'
};

const initialLoginState = {
  email: '',
  password: ''
};

const storeSession = (data, onAuthSuccess) => {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('authUser', JSON.stringify(data.user));
  if (onAuthSuccess) {
    onAuthSuccess(data.user);
  }
};

const useAuthForm = (onAuthSuccess) => {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setStatus({ type: 'idle', message: '' });
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = await loginUser(loginForm);
      storeSession(data, onAuthSuccess);
      setStatus({ type: 'success', message: 'Welcome back. You are signed in.' });
      setLoginForm(initialLoginState);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = await registerUser(registerForm);
      storeSession(data, onAuthSuccess);
      setStatus({ type: 'success', message: 'Account created. Complete your profile next.' });
      setRegisterForm(initialRegisterState);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    mode,
    loginForm,
    registerForm,
    status,
    loading,
    showLoginPassword,
    showRegisterPassword,
    handleModeChange,
    handleLoginChange,
    handleRegisterChange,
    handleLoginSubmit,
    handleRegisterSubmit,
    setShowLoginPassword,
    setShowRegisterPassword
  };
};

export default useAuthForm;
