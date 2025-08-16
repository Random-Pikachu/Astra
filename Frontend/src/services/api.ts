import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const apiService = {
  // Get hello message from backend
  getHello: async () => {
    try {
      const response = await api.get('/hello');
      return response.data;
    } catch (error) {
      console.error('Error fetching hello:', error);
      throw error;
    }
  },

  // Get Kiro info from backend
  getKiroInfo: async () => {
    try {
      const response = await api.get('/kiro');
      return response.data;
    } catch (error) {
      console.error('Error fetching Kiro info:', error);
      throw error;
    }
  },

  // Get Pokemon info from backend
  getPokemonInfo: async () => {
    try {
      const response = await api.get('/pokemon');
      return response.data;
    } catch (error) {
      console.error('Error fetching Pokemon info:', error);
      throw error;
    }
  },
};

export default apiService;