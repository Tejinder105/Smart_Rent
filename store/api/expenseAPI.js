import { createV1ApiClient, handleApiError } from './apiClient';

// Use v1 for backward compatibility with expense endpoints
const api = createV1ApiClient();

const expenseAPI = {
  getUserExpenses: async (params = {}) => {
    try {
      const res = await api.get("/expenses", { params });
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get user expenses');
    }
  },

  getCreatedExpenses: async (params = {}) => {
    try {
      const res = await api.get("/expenses/created", { params });
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get created expenses');
    }
  },

  getParticipantExpenses: async (params = {}) => {
    try {
      const res = await api.get("/expenses/participant", { params });
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get participant expenses');
    }
  },

  getFlatExpenses: async (params = {}) => {
    try {
      const res = await api.get("/expenses/flat", { params });
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get flat expenses');
    }
  },

  createSplitExpense: async (expenseData) => {
    try {
      const res = await api.post("/expenses", expenseData);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Create split expense');
    }
  },

  markParticipantPaid: async (expenseId, participantUserId) => {
    try {
      const res = await api.post(`/expenses/${expenseId}/participants/${participantUserId}/pay`);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Mark participant paid');
    }
  },

  updateExpense: async (expenseId, updateData) => {
    try {
      const res = await api.put(`/expenses/${expenseId}`, updateData);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Update expense');
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      const res = await api.delete(`/expenses/${expenseId}`);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Delete expense');
    }
  },

  getExpenseStats: async () => {
    try {
      const res = await api.get("/expenses/stats");
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get expense stats');
    }
  },

  getAvailableFlatmates: async () => {
    try {
      const res = await api.get("/expenses/flatmates");
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get available flatmates');
    }
  }
};

export default expenseAPI;