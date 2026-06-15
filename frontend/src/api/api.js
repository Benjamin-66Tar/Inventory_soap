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

export default api;