// Configuration file for API endpoints
export const CONFIG = {
  // Update this IP address to match your backend server
  API_BASE_URL: "http://10.172.17.31:8000/api/v1",
  
  // Alternative configurations for different environments
  DEVELOPMENT: {
    API_BASE_URL: "http://localhost:8000/api/v1"
  },
  
  PRODUCTION: {
    API_BASE_URL: "https://your-production-domain.com/api/v1"
  },
  
  // Get current environment config
  getCurrentConfig() {
    // You can add logic here to detect environment
    // For now, return the main config
    return {
      API_BASE_URL: this.API_BASE_URL
    };
  }
};

// Export the current configuration
export default CONFIG.getCurrentConfig();