import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const BASE_URL = "http://192.168.59.31:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      try {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        console.log('⚠️ Session expired. Please login again.');
      } catch (err) {
        console.error('Error clearing tokens:', err);
      }
    }
    return Promise.reject(error);
  }
);

// Expense API functions
const expenseAPI = {
  // Get all user expenses
  getUserExpenses: async (params = {}) => {
    try {
      const res = await api.get("/expenses", { params });
      return res.data;
    } catch (error) {
      console.error("Get user expenses error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get expenses created by user
  getCreatedExpenses: async (params = {}) => {
    try {
      const res = await api.get("/expenses/created", { params });
      return res.data;
    } catch (error) {
      console.error("Get created expenses error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get expenses where user is participant
  getParticipantExpenses: async (params = {}) => {
    try {
      const res = await api.get("/expenses/participant", { params });
      return res.data;
    } catch (error) {
      console.error("Get participant expenses error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get all flat expenses (expenses involving any flat member)
  getFlatExpenses: async (params = {}) => {
    try {
      const res = await api.get("/expenses/flat", { params });
      return res.data;
    } catch (error) {
      console.error("Get flat expenses error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Create split expense
  createSplitExpense: async (expenseData) => {
    try {
      const res = await api.post("/expenses", expenseData);
      return res.data;
    } catch (error) {
      console.error("Create split expense error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Mark participant as paid
  markParticipantPaid: async (expenseId, participantUserId) => {
    try {
      const res = await api.post(`/expenses/${expenseId}/participants/${participantUserId}/pay`);
      return res.data;
    } catch (error) {
      console.error("Mark participant paid error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update expense
  updateExpense: async (expenseId, updateData) => {
    try {
      const res = await api.put(`/expenses/${expenseId}`, updateData);
      return res.data;
    } catch (error) {
      console.error("Update expense error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete expense
  deleteExpense: async (expenseId) => {
    try {
      const res = await api.delete(`/expenses/${expenseId}`);
      return res.data;
    } catch (error) {
      console.error("Delete expense error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get expense statistics
  getExpenseStats: async () => {
    try {
      const res = await api.get("/expenses/stats");
      return res.data;
    } catch (error) {
      console.error("Get expense stats error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get available flatmates for expense splitting
  getAvailableFlatmates: async () => {
    try {
      const res = await api.get("/expenses/flatmates");
      return res.data;
    } catch (error) {
      console.error("Get available flatmates error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default expenseAPI;