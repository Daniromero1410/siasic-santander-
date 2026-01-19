// lib/axios.js
import axios from 'axios';

// URL base del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://siasic-santander-production.up.railway.app';

// Crear instancia de Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios Error:', error.message);
    
    if (error.response) {
      console.error('Response Error:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;