import { createV1ApiClient, createV2ApiClient, handleApiError } from './apiClient';

// Use v1 for backward compatibility with expense endpoints
const api = createV1ApiClient();
// Use v2 for new unified endpoints
const v2Api = createV2ApiClient();

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
  },

  // ========== NEW UNIFIED ENDPOINTS (V2) ==========
  
  createUnifiedExpense: async (expenseData) => {
    try {
      console.log('🔵 [API] Creating unified expense via V2...');
      const res = await v2Api.post("/expenses", expenseData);
      console.log('✅ [API] Expense created successfully');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Create unified expense');
    }
  },

  recordBulkPayment: async (paymentData) => {
    try {
      console.log('🔵 [API] Recording bulk payment via V2...');
      const res = await v2Api.post("/expenses/pay", paymentData);
      console.log('✅ [API] Payment recorded successfully');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Record bulk payment');
    }
  },

  getUserDues: async (flatId) => {
    try {
      console.log('🔵 [API] Fetching user dues via V2 for flatId:', flatId);
      const res = await v2Api.get("/expenses/dues", { params: { flatId } });
      console.log('✅ [API] User dues fetched:', res.data);
      console.log('📊 [API] Response data structure:', {
        success: res.data.success,
        hasData: !!res.data.data,
        billDues: res.data.data?.billDues?.length || 0,
        expenseDues: res.data.data?.expenseDues?.length || 0,
        firstExpense: res.data.data?.expenseDues?.[0] || null
      });
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get user dues');
    }
  },

  getExpenseHistory: async (params = {}) => {
    try {
      console.log('🔵 [API] Fetching expense history via V2...');
      const res = await v2Api.get("/expenses/flat/" + params.flatId, { params });
      console.log('✅ [API] History fetched successfully');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get expense history');
    }
  }
};

export default expenseAPI;