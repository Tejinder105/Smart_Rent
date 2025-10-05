import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

// Update this IP address to match your backend server
// Use "http://localhost:8000/api/v1" for Android emulator use "http://10.0.2.2:8000/api/v1"
// For physical device, use your computer's actual IP address
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

// Flat API functions
const flatAPI = {
  // Create a new flat
  createFlat: async (flatData) => {
    try {
      const res = await api.post("/flats", flatData);
      return res.data;
    } catch (error) {
      console.error("Create flat error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Join flat using join code
  joinFlat: async (joinCode) => {
    try {
      const res = await api.post("/flats/join", { joinCode });
      return res.data;
    } catch (error) {
      console.error("Join flat error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get user's current flat
  getUserFlat: async () => {
    try {
      console.log('🔍 Fetching user flat from:', `${BASE_URL}/flats/current`);
      const res = await api.get("/flats/current");
      console.log('✅ User flat fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Get user flat error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        baseURL: BASE_URL
      });
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - Backend server may be slow or unreachable');
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Network Error - Cannot connect to backend server. Please check if backend is running.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed - Please login again');
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint not found');
      }
      
      throw error;
    }
  },

  // Get flat preview by join code (public endpoint)
  getFlatPreview: async (joinCode) => {
    try {
      const res = await axios.get(`${BASE_URL}/flats/preview/${joinCode}`);
      return res.data;
    } catch (error) {
      console.error("Get flat preview error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update flat details (admin only)
  updateFlat: async (flatId, updateData) => {
    try {
      const res = await api.put(`/flats/${flatId}`, updateData);
      return res.data;
    } catch (error) {
      console.error("Update flat error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Invitation functionality removed - only join codes are supported

  // Leave flat
  leaveFlat: async (flatId) => {
    try {
      const res = await api.post(`/flats/${flatId}/leave`);
      return res.data;
    } catch (error) {
      console.error("Leave flat error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete flat (admin only)
  deleteFlat: async (flatId) => {
    try {
      const res = await api.delete(`/flats/${flatId}`);
      return res.data;
    } catch (error) {
      console.error("Delete flat error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get flat members
  getFlatMembers: async (flatId) => {
    try {
      const res = await api.get(`/flats/${flatId}/members`);
      return res.data;
    } catch (error) {
      console.error("Get flat members error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default flatAPI;