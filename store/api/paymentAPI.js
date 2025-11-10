import { createV1ApiClient, handleApiError } from './apiClient';

// Use v1 for backward compatibility with payment endpoints
const api = createV1ApiClient();

const paymentAPI = {
  getUserPayments: async (params = {}) => {
    try {
      const res = await api.get("/payments", { params });
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get user payments');
    }
  },

  getOutstandingDues: async () => {
    try {
      const res = await api.get("/payments/outstanding");
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get outstanding dues');
    }
  },

  createPayment: async (paymentData) => {
    try {
      const res = await api.post("/payments", paymentData);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Create payment');
    }
  },

  processPayment: async (paymentId, processData) => {
    try {
      const res = await api.post(`/payments/${paymentId}/process`, processData);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Process payment');
    }
  },

  updatePayment: async (paymentId, updateData) => {
    try {
      const res = await api.put(`/payments/${paymentId}`, updateData);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Update payment');
    }
  },

  deletePayment: async (paymentId) => {
    try {
      const res = await api.delete(`/payments/${paymentId}`);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Delete payment');
    }
  },

  getPaymentStats: async () => {
    try {
      const res = await api.get("/payments/stats");
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get payment stats');
    }
  }
};

export default paymentAPI;