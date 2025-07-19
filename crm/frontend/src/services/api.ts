import axios from "axios";

let API_BASE_URL;

API_BASE_URL = 'http://localhost:8000/';

// if (import.meta.env.VITE_APP_ENVIRONMENT === 'production'){
//     API_BASE_URL = import.meta.env.VITE_API_URL
// } else {
//     API_BASE_URL = 'http://localhost:8000/';
// }

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CORS with credentials
    // Without timeout, if your server is down or super slow, your React app would wait forever(literally). 
    // Your users would see a loading spinner that never stops spinning
    timeout: 10000, // 10 second timeout
});

// Add auth token to requests

// It registers interceptor functions for Axios responses.
api.interceptors.request.use(
    // refers to the request configuration before the request is sent.
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    // A Promise represents an asynchronous operation
    (error) => Promise.reject(error)  // It rejects the Promise, ensuring the error reaches .catch() or try/catch.
);

// Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Handle CORS errors
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error - possible CORS issues:', error);
            throw new Error('Cannot connect to server. Please check if backend is running.')
        }
        // The _ prefix is a JavaScript convention to mark a property as "private" or "internal."
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);

                    // retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_type');
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
