const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const buildHeaders = (hasBody) => {
    const headers = {};

    if (hasBody) {
        headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('authToken');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

const apiRequest = async (path, options = {}) => {
    const hasBody = Boolean(options.body);
    const finalHeaders = {
        ...buildHeaders(hasBody),
        ...(options.headers || {})
    };

    console.log('API Request:', {
        url: `${API_BASE_URL}${path}`,
        method: options.method || 'GET',
        headers: finalHeaders,
        body: options.body ? JSON.parse(options.body) : null
    });

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: finalHeaders
    });

    const data = await response.json().catch(() => ({}));
    console.log('API Response:', { status: response.status, data });

    if (!response.ok) {
        const message = data.message || 'Request failed';
        throw new Error(message);
    }

    return data;
};

const registerUser = (payload) =>
        apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload)
        });

const loginUser = (payload) =>
    apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const getPatientProfile = () => apiRequest('/api/patients/profile/me');

const createPatientProfile = (payload) =>
    apiRequest('/api/patients/profile', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const updatePatientProfile = (payload) =>
    apiRequest('/api/patients/profile/me', {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

const getDoctorProfile = () => apiRequest('/api/doctors/profile/me');

const createDoctorProfile = (payload) =>
    apiRequest('/api/doctors/profile', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const updateDoctorProfile = (payload) =>
    apiRequest('/api/doctors/profile/me', {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

const getDoctors = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/api/doctors?${query}` : '/api/doctors';
    return apiRequest(path);
};

const getDoctorAvailability = (doctorId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = query
        ? `/api/availabilities/doctor/${doctorId}?${query}`
        : `/api/availabilities/doctor/${doctorId}`;
    return apiRequest(path);
};

const getDoctorAvailabilities = () => apiRequest('/api/availabilities/doctor');

const createDoctorAvailability = (payload) =>
    apiRequest('/api/availabilities', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const deleteDoctorAvailability = (availabilityId) =>
    apiRequest(`/api/availabilities/${availabilityId}`, {
        method: 'DELETE'
    });

const createAppointment = (payload) =>
    apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const getPatientAppointments = () => apiRequest('/api/appointments/patient');

const getDoctorAppointments = () => apiRequest('/api/appointments/doctor');

const rescheduleAppointment = (appointmentId, payload) =>
    apiRequest(`/api/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

const cancelAppointment = (appointmentId) =>
    apiRequest(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH'
    });

const getAppointmentMeeting = (appointmentId) =>
    apiRequest(`/api/appointments/${appointmentId}/meeting`);

const getPatientRecords = () => apiRequest('/api/records/patient');

const getDoctorRecords = () => apiRequest('/api/records/doctor');

const createMedicalRecord = (payload) =>
    apiRequest('/api/records', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const getPatientNotes = () => apiRequest('/api/notes/patient');

const getDoctorNotes = () => apiRequest('/api/notes/doctor');

const createConsultationNote = (payload) =>
    apiRequest('/api/notes', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const getPatientPrescriptions = () => apiRequest('/api/prescriptions/patient');

const getDoctorPrescriptions = () => apiRequest('/api/prescriptions/doctor');

const createPrescription = (payload) =>
    apiRequest('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const updateAppointmentStatus = (appointmentId, payload) =>
    apiRequest(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

const completeAppointment = (appointmentId) =>
    apiRequest(`/api/appointments/${appointmentId}/complete`, {
        method: 'PATCH'
    });

const setAppointmentMeeting = (appointmentId, payload) =>
    apiRequest(`/api/appointments/${appointmentId}/meeting`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

const getNotifications = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/api/notifications?${query}` : '/api/notifications';
    return apiRequest(path);
};

const getUnreadNotificationCount = () => apiRequest('/api/notifications/unread-count');

const markNotificationRead = (notificationId) =>
    apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
    });

const markAllNotificationsRead = () =>
    apiRequest('/api/notifications/read-all', {
        method: 'PATCH'
    });

const getRecommendations = (payload) =>
    apiRequest('/api/recommendations', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

const uploadProfileImage = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary is not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {
        const message = data.error?.message || 'Image upload failed';
        throw new Error(message);
    }

    return data.secure_url;
};
export {
    API_BASE_URL,
    apiRequest,
    registerUser,
    loginUser,
    getPatientProfile,
    createPatientProfile,
    updatePatientProfile,
    uploadProfileImage,
    getDoctorProfile,
    createDoctorProfile,
    updateDoctorProfile,
    getDoctors,
    getDoctorAvailability,
    getDoctorAvailabilities,
    createDoctorAvailability,
    deleteDoctorAvailability,
    createAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    rescheduleAppointment,
    cancelAppointment,
    getAppointmentMeeting,
    updateAppointmentStatus,
    completeAppointment,
    setAppointmentMeeting,
    getPatientRecords,
    getDoctorRecords,
    createMedicalRecord,
    getPatientNotes,
    getDoctorNotes,
    createConsultationNote,
    getPatientPrescriptions,
    getDoctorPrescriptions,
    createPrescription,
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    getRecommendations
};
