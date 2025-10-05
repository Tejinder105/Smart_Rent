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

// Flatmate API functions
const flatmateAPI = {
  // Get all flatmates
  getAllFlatmates: async (params = {}) => {
    try {
      const res = await api.get("/flatmates", { params });
      return res.data;
    } catch (error) {
      console.error("Get all flatmates error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get active flatmates only
  getActiveFlatmates: async () => {
    try {
      const res = await api.get("/flatmates/active");
      return res.data;
    } catch (error) {
      console.error("Get active flatmates error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Add new flatmate
  addFlatmate: async (flatmateData) => {
    try {
      const res = await api.post("/flatmates", flatmateData);
      return res.data;
    } catch (error) {
      console.error("Add flatmate error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update flatmate
  updateFlatmate: async (flatmateId, updateData) => {
    try {
      const res = await api.put(`/flatmates/${flatmateId}`, updateData);
      return res.data;
    } catch (error) {
      console.error("Update flatmate error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Remove flatmate (mark inactive or permanent delete)
  removeFlatmate: async (flatmateId, permanent = false) => {
    try {
      const res = await api.delete(`/flatmates/${flatmateId}`, {
        data: { permanent }
      });
      return res.data;
    } catch (error) {
      console.error("Remove flatmate error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Reactivate flatmate
  reactivateFlatmate: async (flatmateId) => {
    try {
      const res = await api.post(`/flatmates/${flatmateId}/reactivate`);
      return res.data;
    } catch (error) {
      console.error("Reactivate flatmate error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get flatmate statistics
  getFlatmateStats: async () => {
    try {
      const res = await api.get("/flatmates/stats");
      return res.data;
    } catch (error) {
      console.error("Get flatmate stats error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Invitation-related APIs
  
  // Get invitation details by token (public endpoint)
  getInvitationByToken: async (token) => {
    try {
      const res = await axios.get(`${BASE_URL}/flatmates/invitation/${token}`);
      return res.data;
    } catch (error) {
      console.error("Get invitation error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Accept invitation (public endpoint)
  acceptInvitation: async (token, userDetails = {}) => {
    try {
      const res = await axios.post(`${BASE_URL}/flatmates/invitation/${token}/accept`, {
        userDetails
      });
      return res.data;
    } catch (error) {
      console.error("Accept invitation error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get user's invitations
  getUserInvitations: async (status = '') => {
    try {
      const params = status ? { status } : {};
      const res = await api.get("/flatmates/invitations", { params });
      return res.data;
    } catch (error) {
      console.error("Get user invitations error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Cancel invitation
  cancelInvitation: async (invitationId) => {
    try {
      const res = await api.post(`/flatmates/invitations/${invitationId}/cancel`);
      return res.data;
    } catch (error) {
      console.error("Cancel invitation error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Resend invitation SMS
  resendInvitationSMS: async (invitationId) => {
    try {
      const res = await api.post(`/flatmates/invitations/${invitationId}/resend-sms`);
      return res.data;
    } catch (error) {
      console.error("Resend invitation SMS error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default flatmateAPI;