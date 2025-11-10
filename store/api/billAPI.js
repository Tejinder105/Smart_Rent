import { createDefaultApiClient, handleApiError } from './apiClient';

const api = createDefaultApiClient();

const billAPI = {
  /**
   * Create a new bill with split logic
   * @param {string} flatId - Flat ID
   * @param {Object} billData - Bill details
   * @returns {Promise} Created bill
   */
  createBill: async (flatId, billData) => {
    try {
      console.log('📝 Creating bill for flat:', flatId);
      const res = await api.post(`/bills/flats/${flatId}/bills`, billData);
      console.log('✅ Bill created:', res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Create bill');
    }
  },

  /**
   * Get all bills for a flat
   * @param {string} flatId - Flat ID
   * @param {Object} params - Query params (status, category, etc.)
   * @returns {Promise} List of bills
   */
  getFlatBills: async (flatId, params = {}) => {
    try {
      console.log('🔍 Fetching bills for flat:', flatId);
      const res = await api.get(`/bills/flats/${flatId}/bills`, { params });
      console.log('✅ Bills fetched:', res.data?.data?.length || 0);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get flat bills');
    }
  },

  /**
   * Get single bill details
   * @param {string} billId - Bill ID
   * @returns {Promise} Bill details
   */
  getBill: async (billId) => {
    try {
      console.log('🔍 Fetching bill:', billId);
      const res = await api.get(`/bills/${billId}`);
      console.log('✅ Bill fetched:', res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get bill');
    }
  },

  /**
   * Update bill details
   * @param {string} billId - Bill ID
   * @param {Object} updateData - Updated bill data
   * @returns {Promise} Updated bill
   */
  updateBill: async (billId, updateData) => {
    try {
      console.log('✏️ Updating bill:', billId);
      const res = await api.put(`/bills/${billId}`, updateData);
      console.log('✅ Bill updated:', res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Update bill');
    }
  },

  /**
   * Delete bill
   * @param {string} billId - Bill ID
   * @returns {Promise} Deletion confirmation
   */
  deleteBill: async (billId) => {
    try {
      console.log('🗑️ Deleting bill:', billId);
      const res = await api.delete(`/bills/${billId}`);
      console.log('✅ Bill deleted:', res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Delete bill');
    }
  },

  /**
   * Scan bill image using OCR
   * @param {Object} imageFile - Image file from camera/gallery
   * @returns {Promise} Extracted bill data
   */
  scanBill: async (imageFile) => {
    try {
      console.log('📷 Scanning bill image...');
      
      const formData = new FormData();
      formData.append('billImage', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'bill.jpg',
      });

      const res = await api.post('/bills/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60s for OCR processing
      });
      
      console.log('✅ Bill scanned successfully:', res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Scan bill');
    }
  },

  /**
   * Mark bill as paid
   * @param {string} billId - Bill ID
   * @returns {Promise} Updated bill
   */
  markBillPaid: async (billId) => {
    try {
      console.log('💰 Marking bill as paid:', billId);
      const res = await api.post(`/bills/${billId}/mark-paid`);
      console.log('✅ Bill marked as paid:', res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Mark bill paid');
    }
  },

  /**
   * Get user's dues (bills they need to pay)
   * @param {string} userId - Optional user ID (defaults to current user)
   * @returns {Promise} List of dues
   */
  getUserDues: async (userId = null) => {
    try {
      console.log('💳 Fetching user dues...');
      const endpoint = userId ? `/bills/users/${userId}/dues` : '/bills/dues';
      const res = await api.get(endpoint);
      console.log('✅ Dues fetched:', res.data?.data?.length || 0);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get user dues');
    }
  },
};

export default billAPI;
