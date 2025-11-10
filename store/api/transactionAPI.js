import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const BASE_URL = "http://192.168.1.7:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('✅ Token attached to transaction request:', config.url);
      } else {
        console.log('⚠️ No token available for transaction request:', config.url);
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

const transactionAPI = {
  /**
   * Pay dues - create transactions for multiple bills at once
   * @param {Object} paymentData - Payment details
   * @returns {Promise} Created transactions
   */
  payDues: async (paymentData) => {
    try {
      console.log('💰 Paying dues:', paymentData);
      const res = await api.post('/transactions/pay', paymentData);
      console.log('✅ Dues paid:', res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Pay dues error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create manual transaction (admin only)
   * @param {string} flatId - Flat ID
   * @param {Object} transactionData - Transaction details
   * @returns {Promise} Created transaction
   */
  createTransaction: async (flatId, transactionData) => {
    try {
      console.log('📝 Creating transaction for flat:', flatId);
      const res = await api.post(`/transactions/flats/${flatId}`, transactionData);
      console.log('✅ Transaction created:', res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Create transaction error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get transactions for a flat
   * @param {string} flatId - Flat ID
   * @param {Object} params - Query params (startDate, endDate, userId, etc.)
   * @returns {Promise} List of transactions
   */
  getFlatTransactions: async (flatId, params = {}) => {
    try {
      console.log('🔍 Fetching transactions for flat:', flatId);
      const res = await api.get(`/transactions/flats/${flatId}`, { params });
      console.log('✅ Transactions fetched:', res.data?.data?.length || 0);
      return res.data;
    } catch (error) {
      console.error("❌ Get flat transactions error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get transaction summary for a flat
   * @param {string} flatId - Flat ID
   * @param {Object} params - Query params (startDate, endDate)
   * @returns {Promise} Transaction summary
   */
  getTransactionSummary: async (flatId, params = {}) => {
    try {
      console.log('📊 Fetching transaction summary for flat:', flatId);
      const res = await api.get(`/transactions/flats/${flatId}/summary`, { params });
      console.log('✅ Summary fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Get transaction summary error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get user's transactions
   * @param {string} userId - Optional user ID (defaults to current user)
   * @param {Object} params - Query params (startDate, endDate)
   * @returns {Promise} List of user transactions
   */
  getUserTransactions: async (userId = null, params = {}) => {
    try {
      console.log('🔍 Fetching user transactions...');
      const endpoint = userId ? `/transactions/users/${userId}` : '/transactions/user';
      const res = await api.get(endpoint, { params });
      console.log('✅ User transactions fetched:', res.data?.data?.length || 0);
      return res.data;
    } catch (error) {
      console.error("❌ Get user transactions error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default transactionAPI;
