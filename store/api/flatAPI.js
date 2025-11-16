import axios from 'axios';
import { API_CONFIG, createDefaultApiClient, handleApiError, testConnection, tokenManager } from './apiClient';

const api = createDefaultApiClient();
const BASE_URL = API_CONFIG.BASE_URL;

const flatAPI = {
  // Test backend connection
  testConnection: () => testConnection(BASE_URL),

  createFlat: async (flatData) => {
    try {
      console.log('🏠 Creating flat with data:', flatData);
      const res = await api.post("/flats", flatData);
      console.log('✅ Flat created successfully:', res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Create flat');
    }
  },

  joinFlat: async (joinCode) => {
    try {
      console.log('🔑 Joining flat with code:', joinCode);
      const res = await api.post("/flats/join", { joinCode });
      console.log('✅ Joined flat successfully:', res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Join flat');
    }
  },

  getUserFlat: async () => {
    try {
      console.log('🔍 Fetching user flat...');
      
      // Verify token exists before making request
      const accessToken = await tokenManager.getAccessToken();
      if (!accessToken) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const res = await api.get("/flats/current");
      console.log('✅ User flat fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      // User has no flat yet - this is not an error
      if (error.response?.status === 404) {
        console.log('ℹ️ User has no flat yet');
        return { data: null };
      }
      handleApiError(error, 'Get user flat');
    }
  },

  getFlatPreview: async (joinCode) => {
    try {
      const res = await axios.get(`${BASE_URL}/flats/preview/${joinCode}`);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get flat preview');
    }
  },

  updateFlat: async (flatId, updateData) => {
    try {
      console.log('📝 Updating flat:', flatId, 'with data:', updateData);
      const res = await api.put(`/flats/${flatId}`, updateData);
      console.log('✅ Flat updated successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Update flat error:', error);
      handleApiError(error, 'Update flat');
    }
  },

  leaveFlat: async (flatId) => {
    try {
      const res = await api.post(`/flats/${flatId}/leave`);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Leave flat');
    }
  },

  deleteFlat: async (flatId) => {
    try {
      const res = await api.delete(`/flats/${flatId}`);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Delete flat');
    }
  },

  getFlatMembers: async (flatId) => {
    try {
      const res = await api.get(`/flats/${flatId}/members`);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get flat members');
    }
  },
};

export default flatAPI;