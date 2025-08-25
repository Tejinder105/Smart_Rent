import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const BASE_URL = "http://192.168.13.31:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const storeTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

const getTokens = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error getting tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
};

const clearTokens = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// API functions
const register = async (userData) => {
  try {
    console.log("🚀 Attempting registration with data:", userData);
    console.log("🌐 API Base URL:", BASE_URL);
    
    const res = await api.post("/users/register", userData);
    console.log("✅ Registration successful:", res.data);
    if (res.data?.data?.accessToken && res.data?.data?.refreshToken) {
      await storeTokens(res.data.data.accessToken, res.data.data.refreshToken);
    }
    
    return res.data;
  } catch (error) {
   console.log(error);
    throw error;
  }
};

const login = async (credentials) => {
  try {
    const res = await api.post("/users/login", credentials);
    
    // Store tokens
    if (res.data?.data?.accessToken && res.data?.data?.refreshToken) {
      await storeTokens(res.data.data.accessToken, res.data.data.refreshToken);
    }
    
    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

const logout = async () => {
  try {
    const res = await api.post("/users/logout");
    
    // Clear stored tokens
    await clearTokens();
    
    return res.data;
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    // Clear tokens even if logout request fails
    await clearTokens();
    throw error;
  }
};

export default { api, register, login, logout, storeTokens, getTokens, clearTokens };
