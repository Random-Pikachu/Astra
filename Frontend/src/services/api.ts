import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Production: do not log to console

export const apiService = {
  // Example placeholder call (kept to avoid unused variable warnings if needed in future)
  ping: async () => {
    const response = await api.get('/hello');
    return response.data;
  },

  // Send OTP to email
  sendOtp: async (payload: { email: string }) => {
    const response = await api.post('/otp/send-otp', payload);
    return response.data;
  },

  // Verify OTP for email
  verifyOtp: async (payload: { email: string; otp: string }) => {
    const response = await api.post('/otp/verify', payload);
    return response.data;
  },
  // Register a new user
  register: async (payload: { email: string; password: string; username: string }) => {
    try {
      const response = await api.post('/auth/register', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login existing user
  login: async (payload: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiService;