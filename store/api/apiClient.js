import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base configuration
const API_CONFIG = {
  BASE_URL: 'http://10.233.236.31:8000/api',
  V1_BASE_URL: 'http://10.233.236.31:8000/api/v1',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

/**
 * Token management utilities
 */
export const tokenManager = {
  async getAccessToken() {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('❌ Error getting access token:', error);
      return null;
    }
  },

  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('❌ Error getting refresh token:', error);
      return null;
    }
  },

  async storeTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      console.log('✅ Tokens stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Error storing tokens:', error);
      return false;
    }
  },

  async clearTokens() {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      console.log('✅ Tokens cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing tokens:', error);
    }
  },
};

/**
 * Create axios instance with interceptors
 * @param {string} baseURL - Base URL for the API (default or v1)
 * @returns {AxiosInstance} Configured axios instance
 */
export const createApiClient = (baseURL = API_CONFIG.BASE_URL) => {
  const client = axios.create({
    baseURL,
    headers: API_CONFIG.HEADERS,
    timeout: API_CONFIG.TIMEOUT,
  });

  // Request interceptor - Add auth token to all requests
  client.interceptors.request.use(
    async (config) => {
      try {
        const accessToken = await tokenManager.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log(`✅ Token attached to request: ${config.method?.toUpperCase()} ${config.url}`);
        } else {
          console.log(`⚠️ No token available for request: ${config.method?.toUpperCase()} ${config.url}`);
        }
      } catch (error) {
        console.error('❌ Error in request interceptor:', error);
      }
      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle 401 errors and clear tokens
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const url = error.config?.url;

      if (status === 401) {
        console.log(`⚠️ 401 Unauthorized on ${url} - Clearing tokens`);
        await tokenManager.clearTokens();
      }

      // Log error details for debugging
      console.error(`❌ API Error [${status}] on ${url}:`, {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status,
      });

      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Create API client for v1 endpoints
 */
export const createV1ApiClient = () => createApiClient(API_CONFIG.V1_BASE_URL);

/**
 * Create API client for default endpoints (no version)
 */
export const createDefaultApiClient = () => createApiClient(API_CONFIG.BASE_URL);

/**
 * Error handler utility for consistent error handling
 * @param {Error} error - The error object
 * @param {string} operation - Name of the operation that failed
 * @throws {Error} Enhanced error with more context
 */
export const handleApiError = (error, operation) => {
  const errorDetails = {
    operation,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    code: error.code,
  };

  console.error(`❌ ${operation} error:`, errorDetails);

  // Handle specific error types
  if (error.code === 'ECONNABORTED') {
    throw new Error(`${operation} timeout - Backend server may be slow or unreachable`);
  } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    throw new Error(`${operation} failed - Cannot connect to backend server`);
  } else if (error.response?.status === 401) {
    throw new Error(`${operation} failed - Authentication required. Please login again.`);
  } else if (error.response?.status === 404) {
    throw new Error(`${operation} failed - Resource not found`);
  } else if (error.response?.status === 403) {
    throw new Error(`${operation} failed - Access denied`);
  } else if (error.response?.status === 400) {
    // Handle validation errors with detailed field information
    const data = error.response?.data;
    
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      // Format validation error messages with field names
      const validationMessages = data.errors
        .map(err => {
          if (err.field && err.message) {
            // Clean up Joi error messages
            const cleanMessage = err.message.replace(/"/g, '');
            return `${err.field}: ${cleanMessage}`;
          }
          return err.message || err;
        })
        .join('\n');
      throw new Error(validationMessages);
    } else if (data?.message) {
      throw new Error(data.message);
    } else {
      throw new Error(`${operation} failed - Invalid input data`);
    }
  } else if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }

  // Fallback error
  throw new Error(`${operation} failed - ${error.message}`);
};

/**
 * Test backend connectivity
 * @param {string} baseURL - The base URL to test
 * @returns {Promise<boolean>} True if backend is reachable
 */
export const testConnection = async (baseURL = API_CONFIG.BASE_URL) => {
  try {
    console.log('🔌 Testing backend connection to:', baseURL);
    await axios.get(`${baseURL}/health`, { timeout: 5000 });
    console.log('✅ Backend is reachable');
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return false;
  }
};

// Export configuration for reference
export { API_CONFIG };

// Default export: main API client
export default createDefaultApiClient();
