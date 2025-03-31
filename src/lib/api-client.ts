import axios from 'axios';

/**
 * Centralized axios instance for the application
 * Benefits:
 * - Consistent configuration across the app
 * - Single place to add interceptors
 * - Easier to mock for testing
 * - Global error handling
 */
const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.AUTH_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor for adding auth token, etc.
apiClient.interceptors.request.use(
  (config) => {
    // You could add auth tokens here from localStorage or cookies
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handling
    console.error('API Error:', error.response?.data || error.message);
    
    // You could add special handling for 401 (unauthorized) errors
    // if (error.response && error.response.status === 401) {
    //   // Redirect to login or refresh token
    // }
    
    return Promise.reject(error);
  }
);

export default apiClient; 