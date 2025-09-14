import axios from 'axios';

const API_BASE_URL = 'http://https://astra-sfnd.onrender.com/';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds to handle email sending delays
});

// Production: do not log to console

export const apiService = {
  // Example placeholder call (kept to avoid unused variable warnings if needed in future)
  ping: async () => {
    const response = await api.get('/hello');
    return response.data;
  },

  // Get vulnerability stats for a repo (for treemap)
  getVulnerabilityStats: async (repoCode: string) => {
    try {
      const response = await api.get(`/api/dependencies/vulnerabilityStats/${repoCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get repositories stats for a user
  getRepoStats: async (userCode: string) => {
    try {
      const response = await api.get(`/api/repos/view-reposStats/${userCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send OTP to email
  sendOtp: async (payload: { email: string }, retryCount: number = 0): Promise<any> => {
    try {
      const response = await api.post('/otp/send-otp', payload);
      return response.data;
    } catch (error: any) {
      // Retry logic for timeout errors
      if (error.code === 'ECONNABORTED' && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return apiService.sendOtp(payload, retryCount + 1);
      }
      throw error;
    }
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

  // Get repository list for a user
  getRepoList: async (userCode: string) => {
    try {
      const response = await api.get(`/api/repos/get-repoList/${userCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove a repository
  removeRepo: async (userCode: string, repoCode: string) => {
    try {
      const response = await api.delete(`/api/repos/remove-repo/${userCode}/${repoCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Scan repository dependencies
  scanRepoDependencies: async (repoCode: string) => {
    try {
      const response = await api.post('/api/dependencies/scan/repo', { repoCode });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get vulnerability overview for a repository
  getVulnerabilityOverview: async (repoCode: string) => {
    try {
      const response = await api.get(`/api/dependencies/vulnerablity-overview/${repoCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get vulnerability details for a specific dependency
  getVulnerabilityDetails: async (repoCode: string, dependencyCode: string) => {
    try {
      const response = await api.get(`/api/dependencies/vulnerablity-details/${repoCode}/${dependencyCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fix vulnerabilities for a specific dependency
  fixVulnerabilities: async (dependencyCode: string, channelId?: string) => {
    try {
      const response = await api.post('/api/dependencies/fix', { dependencyCode, channelId }, { timeout: 0 });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiService;