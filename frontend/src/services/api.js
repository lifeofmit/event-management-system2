import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_URL,
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle Global Errors (e.g., Token Expiry)
apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Force logout
    }
    return Promise.reject(error);
});

// ==========================================
// ALL API ENDPOINTS
// ==========================================
const API = {
    // --- Auth ---
    login: (credentials) => apiClient.post('/auth/login', credentials),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),

    // --- Users (Super Admin) ---
    getUsers: () => apiClient.get('/users'),
    createUser: (userData) => apiClient.post('/users', userData),
    updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
    deleteUser: (id) => apiClient.delete(`/users/${id}`),
    assignCoordinator: (data) => apiClient.post('/users/assign', data),

    // --- Event Types (Super Admin) ---
    getEventTypes: () => apiClient.get('/event-types'), // Gets all for Super Admin table
    getActiveEventTypes: () => apiClient.get('/event-types/active'), // Gets active for dropdowns
    createEventType: (data) => apiClient.post('/event-types', data),
    updateEventType: (id, data) => apiClient.put(`/event-types/${id}`, data),
    deleteEventType: (id) => apiClient.delete(`/event-types/${id}`),

    // --- Events ---
    getEvents: (filters) => apiClient.get('/events', { params: filters }),
    getEventById: (id) => apiClient.get(`/events/${id}`),

    // Multipart Form Data for Event Creation (Images + Data)
    createEvent: (formData) => apiClient.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    updateEvent: (id, formData) => apiClient.put(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    deleteEvent: (id) => apiClient.delete(`/events/${id}`),

    // --- Reports & Exports ---
    uploadEventReport: (eventId, file) => {
        const formData = new FormData();
        formData.append('eventReport', file);
        return apiClient.post(`/events/${eventId}/report`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    exportEvents: (format, filters) => apiClient.get(`/exports/events?format=${format}`, {
        params: filters,
        responseType: 'blob' // Required for downloading files
    }),
};

export default API;