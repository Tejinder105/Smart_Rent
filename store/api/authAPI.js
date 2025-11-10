import { createDefaultApiClient, handleApiError, tokenManager } from './apiClient';

const api = createDefaultApiClient();


const register = async (userData) => {
  try {
    console.log("📝 Attempting registration with data:", userData);
    
    const res = await api.post("/auth/register", userData);
    console.log("✅ Registration successful:", res.data);
    
    if (res.data?.data?.accessToken && res.data?.data?.refreshToken) {
      await tokenManager.storeTokens(res.data.data.accessToken, res.data.data.refreshToken);
    } else {
      console.log('⚠️ No tokens in registration response');
    }
    
    return res.data;
  } catch (error) {
    handleApiError(error, 'Register');
  }
};

const login = async (credentials) => {
  try {
    console.log("🔑 Attempting login...");
    const res = await api.post("/auth/login", credentials);
    console.log("✅ Login API response received");
    
    if (res.data?.data?.accessToken && res.data?.data?.refreshToken) {
      await tokenManager.storeTokens(res.data.data.accessToken, res.data.data.refreshToken);
      
      // Verify tokens were stored
      const accessToken = await tokenManager.getAccessToken();
      console.log('Token verification:', accessToken ? '✅ Token readable' : '❌ Token not found');
    } else {
      console.log('⚠️ No tokens in login response');
    }
    
    return res.data;
  } catch (error) {
    handleApiError(error, 'Login');
  }
};

const getCurrentUser = async () => {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (error) {
    handleApiError(error, 'Get current user');
  }
};

const logout = async () => {
  try {
    const accessToken = await tokenManager.getAccessToken();
    
    if (accessToken) {
      const res = await api.post("/auth/logout", {});
      await tokenManager.clearTokens();
      return res.data;
    } else {
      await tokenManager.clearTokens();
      return { message: "Logged out locally" };
    }
  } catch (error) {
    // Always clear tokens on logout, even if API call fails
    await tokenManager.clearTokens();
    handleApiError(error, 'Logout');
  }
};

export default { 
  api, 
  register, 
  login, 
  logout, 
  getCurrentUser, 
  storeTokens: tokenManager.storeTokens, 
  getTokens: async () => ({
    accessToken: await tokenManager.getAccessToken(),
    refreshToken: await tokenManager.getRefreshToken()
  }), 
  clearTokens: tokenManager.clearTokens 
};
