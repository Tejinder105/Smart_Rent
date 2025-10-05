import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const BASE_URL = "http://10.172.17.31:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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

// Payment API functions
const paymentAPI = {
  // Get all user payments
  getUserPayments: async (params = {}) => {
    try {
      const res = await api.get("/payments", { params });
      return res.data;
    } catch (error) {
      console.error("Get user payments error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get outstanding dues
  getOutstandingDues: async () => {
    try {
      const res = await api.get("/payments/outstanding");
      return res.data;
    } catch (error) {
      console.error("Get outstanding dues error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Create new payment
  createPayment: async (paymentData) => {
    try {
      const res = await api.post("/payments", paymentData);
      return res.data;
    } catch (error) {
      console.error("Create payment error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Process payment (mark as paid)
  processPayment: async (paymentId, processData) => {
    try {
      const res = await api.post(`/payments/${paymentId}/process`, processData);
      return res.data;
    } catch (error) {
      console.error("Process payment error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update payment
  updatePayment: async (paymentId, updateData) => {
    try {
      const res = await api.put(`/payments/${paymentId}`, updateData);
      return res.data;
    } catch (error) {
      console.error("Update payment error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (paymentId) => {
    try {
      const res = await api.delete(`/payments/${paymentId}`);
      return res.data;
    } catch (error) {
      console.error("Delete payment error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get payment statistics
  getPaymentStats: async () => {
    try {
      const res = await api.get("/payments/stats");
      return res.data;
    } catch (error) {
      console.error("Get payment stats error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default paymentAPI;