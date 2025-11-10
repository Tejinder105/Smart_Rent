import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BASE_URL = "http://192.168.1.7:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15s for report generation
});

// Request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('✅ Token attached to report request:', config.url);
      } else {
        console.log('⚠️ No token available for report request:', config.url);
      }
    } catch (error) {
      console.error('❌ Error getting access token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
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

const reportAPI = {
  /**
   * Get monthly report for a flat
   * @param {string} flatId - Flat ID
   * @param {Object} params - Query params (year, month)
   * @returns {Promise} Monthly report data
   */
  getMonthlyReport: async (flatId, params = {}) => {
    try {
      console.log('📊 Fetching monthly report for flat:', flatId);
      const res = await api.get(`/reports/flats/${flatId}/monthly`, { params });
      console.log('✅ Monthly report fetched');
      return res.data;
    } catch (error) {
      console.error("❌ Get monthly report error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Set flat budget
   * @param {string} flatId - Flat ID
   * @param {Object} budgetData - Budget details
   * @returns {Promise} Budget confirmation
   */
  setFlatBudget: async (flatId, budgetData) => {
    try {
      console.log('💰 Setting budget for flat:', flatId);
      const res = await api.post(`/reports/flats/${flatId}/budget`, budgetData);
      console.log('✅ Budget set:', res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Set budget error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get budget forecast using ML
   * @param {string} flatId - Flat ID
   * @param {Object} params - Query params (months, category)
   * @returns {Promise} Forecast data with predictions
   */
  getBudgetForecast: async (flatId, params = {}) => {
    try {
      console.log('🔮 Fetching budget forecast for flat:', flatId);
      const res = await api.get(`/reports/flats/${flatId}/budget/forecast`, { params });
      console.log('✅ Forecast fetched with ML predictions');
      return res.data;
    } catch (error) {
      console.error("❌ Get forecast error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get category spending breakdown
   * @param {string} flatId - Flat ID
   * @param {Object} params - Query params (startDate, endDate)
   * @returns {Promise} Category breakdown
   */
  getCategorySpending: async (flatId, params = {}) => {
    try {
      console.log('📂 Fetching category spending for flat:', flatId);
      const res = await api.get(`/reports/flats/${flatId}/categories`, { params });
      console.log('✅ Category spending fetched');
      return res.data;
    } catch (error) {
      console.error("❌ Get category spending error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Export report as CSV
   * @param {string} flatId - Flat ID
   * @param {Object} params - Query params (startDate, endDate, format)
   * @returns {Promise} Downloads and shares CSV file
   */
  exportReport: async (flatId, params = {}) => {
    try {
      console.log('💾 Exporting report for flat:', flatId);
      
      // Get the CSV data
      const res = await api.get(`/reports/flats/${flatId}/export`, { 
        params,
        responseType: 'text' 
      });
      
      // Create filename
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `SmartRent_Report_${timestamp}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write CSV to file
      await FileSystem.writeAsStringAsync(fileUri, res.data);
      console.log('✅ Report exported to:', fileUri);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Share Report',
          UTI: 'public.comma-separated-values-text'
        });
        console.log('✅ Report shared');
      } else {
        console.log('⚠️ Sharing not available');
      }
      
      return { success: true, fileUri, data: res.data };
    } catch (error) {
      console.error("❌ Export report error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default reportAPI;
