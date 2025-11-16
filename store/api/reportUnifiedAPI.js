/**
 * Unified Report API Client (V2 - Optimized)
 * Single source for all report-related API calls
 * Replaces multiple scattered API calls with consolidated endpoints
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_CONFIG } from './apiClient';

const BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20s for report generation
});

// Request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('❌ Error getting access token:', error);
    }
    return config;
  },
  (error) => {
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
      } catch (err) {
        console.error('Error clearing tokens:', err);
      }
    }
    return Promise.reject(error);
  }
);

const reportUnifiedAPI = {
  /**
   * Get complete financial report (replaces 3 separate calls)
   * @param {string} flatId - Flat ID
   * @param {string} month - Month in YYYY-MM format (optional)
   * @returns {Promise<Object>} Complete report with all data
   */
  getCompleteReport: async (flatId, month = null) => {
    try {
      console.log('📊 Fetching complete report for flat:', flatId, 'month:', month || 'current');
      const params = month ? { month } : {};
      const res = await api.get(`/v2/reports/flats/${flatId}/complete`, { params });
      console.log('✅ Complete report fetched:', {
        month: res.data.data.month,
        totalSpent: res.data.data.summary.totalSpent,
        cached: res.data.data._metadata?.cached || false,
        queriesExecuted: res.data.data._metadata?.queriesExecuted
      });
      return res.data;
    } catch (error) {
      console.error("❌ Get complete report error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get optimized dashboard summary (minimal payload)
   * @param {string} flatId - Flat ID
   * @returns {Promise<Object>} Essential dashboard data only
   */
  getDashboardSummary: async (flatId) => {
    try {
      console.log('📊 Fetching dashboard summary for flat:', flatId);
      const res = await api.get(`/v2/reports/flats/${flatId}/dashboard`);
      console.log('✅ Dashboard summary fetched');
      return res.data;
    } catch (error) {
      console.error("❌ Get dashboard summary error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get ML-powered budget forecast (optimized single query)
   * @param {string} flatId - Flat ID
   * @param {number} months - Number of months to forecast
   * @returns {Promise<Object>} Forecast predictions
   */
  getForecast: async (flatId, months = 3) => {
    try {
      console.log('🔮 Fetching budget forecast for flat:', flatId);
      const res = await api.get(`/v2/reports/flats/${flatId}/forecast`, { params: { months } });
      console.log('✅ Forecast fetched:', {
        usedML: res.data.data.usedML,
        monthsAnalyzed: res.data.data._metadata?.monthsAnalyzed,
        cached: res.data.data._cached || false
      });
      return res.data;
    } catch (error) {
      console.error("❌ Get forecast error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get category-wise spending analysis
   * @param {string} flatId - Flat ID
   * @param {Object} dateRange - Optional {startDate, endDate}
   * @returns {Promise<Object>} Category breakdown
   */
  getCategoryAnalysis: async (flatId, dateRange = {}) => {
    try {
      console.log('📂 Fetching category analysis for flat:', flatId);
      const res = await api.get(`/v2/reports/flats/${flatId}/categories`, { params: dateRange });
      console.log('✅ Category analysis fetched:', res.data.data.categories.length, 'categories');
      return res.data;
    } catch (error) {
      console.error("❌ Get category analysis error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Export report as CSV with native sharing
   * @param {string} flatId - Flat ID
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Object>} Export result
   */
  exportReportCSV: async (flatId, month) => {
    try {
      console.log('💾 Exporting report for flat:', flatId, 'month:', month);
      
      const res = await api.get(`/v2/reports/flats/${flatId}/export`, {
        params: { month, format: 'csv' },
        responseType: 'text'
      });
      
      // Create filename
      const fileName = `SmartRent_Report_${month || new Date().toISOString().slice(0, 7)}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write CSV to file
      await FileSystem.writeAsStringAsync(fileUri, res.data);
      console.log('✅ Report exported to:', fileUri);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Share Financial Report',
          UTI: 'public.comma-separated-values-text'
        });
        console.log('✅ Report shared');
      }
      
      return { success: true, fileUri, fileName };
    } catch (error) {
      console.error("❌ Export report error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Export report as JSON
   * @param {string} flatId - Flat ID
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Object>} Complete report data
   */
  exportReportJSON: async (flatId, month) => {
    try {
      console.log('💾 Exporting JSON report for flat:', flatId, 'month:', month);
      const res = await api.get(`/v2/reports/flats/${flatId}/export`, {
        params: { month, format: 'json' }
      });
      console.log('✅ JSON report fetched');
      return res.data;
    } catch (error) {
      console.error("❌ Export JSON report error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Invalidate report cache (call after bulk operations)
   * @param {string} flatId - Flat ID
   * @param {string} month - Optional month in YYYY-MM format
   * @returns {Promise<Object>} Success confirmation
   */
  invalidateCache: async (flatId, month = null) => {
    try {
      console.log('🗑️ Invalidating cache for flat:', flatId, 'month:', month || 'all');
      const res = await api.post(`/v2/reports/flats/${flatId}/invalidate-cache`, { month });
      console.log('✅ Cache invalidated');
      return res.data;
    } catch (error) {
      console.error("❌ Invalidate cache error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default reportUnifiedAPI;
