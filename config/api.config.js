
export const CONFIG = {
  API_BASE_URL: "http://10.172.17.31:8000/api",
  
  DEVELOPMENT: {
    API_BASE_URL: "http://localhost:8000/api"
  },
  
  PRODUCTION: {
    API_BASE_URL: "https://your-production-domain.com/api"
  },
  
  getCurrentConfig() {
    return {
      API_BASE_URL: this.API_BASE_URL
    };
  }
};
export default CONFIG.getCurrentConfig();