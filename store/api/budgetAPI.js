import { createDefaultApiClient, handleApiError } from './apiClient';

const api = createDefaultApiClient();

const budgetAPI = {
  /**
   * Update flat monthly budget
   * @param {string} flatId - Flat ID
   * @param {number} monthlyBudget - Monthly budget amount
   * @returns {Promise} Updated budget
   */
  updateFlatBudget: async (flatId, monthlyBudget) => {
    try {
      console.log('💰 Updating flat budget:', monthlyBudget);
      const res = await api.put(`/budget/flats/${flatId}/budget`, { monthlyBudget });
      console.log('✅ Budget updated');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Update flat budget');
    }
  },

  /**
   * Get current month budget status
   * @param {string} flatId - Flat ID
   * @returns {Promise} Current budget status
   */
  getCurrentBudgetStatus: async (flatId) => {
    try {
      console.log('📊 Fetching current budget status...');
      const res = await api.get(`/budget/flats/${flatId}/budget/current`);
      console.log('✅ Budget status fetched');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get current budget status');
    }
  },

  /**
   * Get budget history
   * @param {string} flatId - Flat ID
   * @param {number} months - Number of months to fetch
   * @returns {Promise} Budget history
   */
  getBudgetHistory: async (flatId, months = 6) => {
    try {
      console.log(`📅 Fetching budget history (${months} months)...`);
      const res = await api.get(`/budget/flats/${flatId}/budget/history`, {
        params: { months }
      });
      console.log('✅ Budget history fetched');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get budget history');
    }
  },

  /**
   * Update budget snapshot
   * @param {string} flatId - Flat ID
   * @param {Object} data - Snapshot data (month, notes)
   * @returns {Promise} Updated snapshot
   */
  updateBudgetSnapshot: async (flatId, data) => {
    try {
      console.log('📝 Updating budget snapshot...');
      const res = await api.put(`/budget/flats/${flatId}/budget/snapshot`, data);
      console.log('✅ Snapshot updated');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Update budget snapshot');
    }
  },
};

export default budgetAPI;
