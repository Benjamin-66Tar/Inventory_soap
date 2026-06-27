import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.port === '3000' || window.location.port === '3001'
    ? 'http://127.0.0.1:8000/api'
    : '/api');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar token de autenticación en cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('soap_token');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;