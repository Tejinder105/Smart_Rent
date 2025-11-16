import axios from 'axios';
import { Alert, Platform } from 'react-native';
import { API_CONFIG } from '../store/api/apiClient';

/**
 * Check network connectivity to backend
 * @returns {Promise<boolean>} True if backend is reachable
 */
export const checkBackendConnection = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL.replace('/api', '')}/health`, {
      timeout: 5000,
    });
    
    if (response.data?.status === 'ok') {
      console.log('✅ Backend is reachable');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return false;
  }
};

/**
 * Show network error alert with troubleshooting steps
 * @param {string} operation - The operation that failed
 */
export const showNetworkErrorAlert = (operation = 'Operation') => {
  const baseUrl = API_CONFIG.BASE_URL;
  const serverIp = baseUrl.match(/\/\/([0-9.]+):/)?.[1] || 'unknown';
  
  Alert.alert(
    '🔌 Network Error',
    `Cannot connect to backend server.\n\n` +
    `Troubleshooting Steps:\n\n` +
    `1️⃣ Make sure backend server is running\n` +
    `   → Run: npm start (in Backend folder)\n\n` +
    `2️⃣ Check if phone and PC are on same WiFi\n` +
    `   → Server: ${serverIp}:8000\n\n` +
    `3️⃣ Check Windows Firewall\n` +
    `   → Allow port 8000 for Node.js\n\n` +
    `4️⃣ Verify IP address in config\n` +
    `   → Backend running on: ${serverIp}\n\n` +
    `5️⃣ Try restarting Expo: npx expo start -c`,
    [
      {
        text: 'Test Connection',
        onPress: async () => {
          const isConnected = await checkBackendConnection();
          if (isConnected) {
            Alert.alert('✅ Success', 'Backend is reachable! Try the operation again.');
          } else {
            Alert.alert(
              '❌ Still Offline',
              'Backend is not reachable. Please check the troubleshooting steps above.'
            );
          }
        },
      },
      { text: 'OK' },
    ]
  );
};

/**
 * Validate if backend URL is accessible before making API calls
 * @param {Function} apiCall - The API call function to wrap
 * @param {string} operation - Name of the operation
 * @returns {Function} Wrapped function with connection check
 */
export const withConnectionCheck = (apiCall, operation) => {
  return async (...args) => {
    // Check connection first
    const isConnected = await checkBackendConnection();
    
    if (!isConnected) {
      showNetworkErrorAlert(operation);
      throw new Error(`${operation} failed - Cannot connect to backend server`);
    }
    
    // Proceed with API call
    return apiCall(...args);
  };
};

/**
 * Get current network info for debugging
 * @returns {Object} Network configuration details
 */
export const getNetworkInfo = () => {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    serverIp: API_CONFIG.BASE_URL.match(/\/\/([0-9.]+):/)?.[1],
    serverPort: API_CONFIG.BASE_URL.match(/:(\d+)/)?.[1],
    platform: Platform.OS,
    timeout: API_CONFIG.TIMEOUT,
  };
};

/**
 * Log network configuration for debugging
 */
export const logNetworkConfig = () => {
  const info = getNetworkInfo();
  console.log('🌐 Network Configuration:');
  console.log(`   Base URL: ${info.baseUrl}`);
  console.log(`   Server IP: ${info.serverIp}`);
  console.log(`   Server Port: ${info.serverPort}`);
  console.log(`   Platform: ${info.platform}`);
  console.log(`   Timeout: ${info.timeout}ms`);
};
