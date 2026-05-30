import { useState } from 'react';
import { loginUser, registerUser } from '../api/client';

const roles = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' }
];

const initialRegisterState = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  role: 'patient'
};

const initialLoginState = {
  email: '',
  password: ''
};

const storeSession = (data, onAuthSuccess, isNewUser = false) => {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('authUser', JSON.stringify(data.user));
  if (onAuthSuccess) {
    onAuthSuccess(data.user, isNewUser);
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

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const isValid = Object.values(requirements).every(Boolean);
    return { requirements, isValid };
  };

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
      const { isValid } = validatePassword(registerForm.password);
      if (!isValid) {
        setStatus({ type: 'error', message: 'Password does not meet all requirements.' });
        setLoading(false);
        return;
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        setStatus({ type: 'error', message: 'Passwords do not match.' });
        setLoading(false);
        return;
      }

      const data = await registerUser(registerForm);
      storeSession(data, onAuthSuccess, true);
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
    setShowRegisterPassword,
    validatePassword
  };
};

export default useAuthForm;
