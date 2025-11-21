import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mern-final-project-dubleu-x-9.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test backend connection
export const testBackendConnection = async () => {
  try {
    console.log('🔗 Testing backend connection...');
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token found and added to headers');
    } else {
      console.log('⚠️ No token found in localStorage');
    }
    
    // Safe logging for enrollment requests
    if (config.url && config.url.includes('/enroll')) {
      console.log('🎯 ENROLLMENT REQUEST DETAILS:');
      console.log('Method:', config.method?.toUpperCase());
      console.log('URL Path:', config.url);
      console.log('Auth Header:', config.headers.Authorization ? 'Present' : 'Missing');
    } else {
      console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors - FIXED VERSION
api.interceptors.response.use(
  (response) => {
    // Safe logging for enrollment responses
    if (response.config?.url && response.config.url.includes('/enroll')) {
      console.log('✅ ENROLLMENT RESPONSE SUCCESS:');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
    } else {
      console.log('✅ API Response:', response.status, response.config?.url);
    }
    return response;
  },
  (error) => {
    // Safe error handling - check if error.config exists
    if (error.config?.url && error.config.url.includes('/enroll')) {
      console.log('❌ ENROLLMENT RESPONSE ERROR:');
      console.log('URL:', error.config.url);
      console.log('Status:', error.response?.status);
      console.log('Error Message:', error.response?.data?.message);
    } else {
      console.error('❌ API Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    
    if (error.response?.status === 401) {
      console.log('🔐 401 Unauthorized - Removing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;