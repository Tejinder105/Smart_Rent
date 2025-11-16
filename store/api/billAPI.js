import * as FileSystem from 'expo-file-system/legacy';
import { createDefaultApiClient, handleApiError, tokenManager } from './apiClient';

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
    console.log('═══════════════════════════════════════');
    console.log('🚀 SCAN BILL API CALL STARTED');
    console.log('═══════════════════════════════════════');
    
    try {
      console.log('📷 Step 1: Scanning bill image...');
      console.log('📁 Image details:', JSON.stringify(imageFile, null, 2));
      
      // Get access token
      console.log('🔑 Step 2: Getting access token...');
      const token = await tokenManager.getAccessToken();
      console.log('🔑 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'NULL');
      
      if (!token) {
        throw new Error('No authentication token available. Please login again.');
      }

      // Use FileSystem.uploadAsync for proper multipart upload
      const uploadUrl = 'http://192.168.1.11:8000/api/bills/scan';
      
      console.log('📤 Step 3: Preparing upload...');
      console.log('📤 Upload URL:', uploadUrl);
      console.log('📤 File URI:', imageFile.uri);
      console.log('📤 Field name: billImage');
      
      console.log('⏳ Step 4: Starting file upload...');
      
      // Using legacy API which supports uploadAsync
      const uploadResult = await FileSystem.uploadAsync(uploadUrl, imageFile.uri, {
        fieldName: 'billImage',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📥 Step 5: Upload complete!');
      console.log('📥 Response status:', uploadResult.status);
      console.log('📥 Response headers:', JSON.stringify(uploadResult.headers, null, 2));
      console.log('📥 Response body (raw):', uploadResult.body);

      // Check for non-200 status
      if (uploadResult.status >= 400) {
        console.error('❌ Server returned error status:', uploadResult.status);
        let errorMessage = `Upload failed with status ${uploadResult.status}`;
        try {
          const errorData = JSON.parse(uploadResult.body);
          console.error('❌ Error data parsed:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('❌ Could not parse error response');
          console.error('❌ Raw response:', uploadResult.body);
        }
        throw new Error(errorMessage);
      }

      // Parse response
      console.log('✅ Step 6: Parsing successful response...');
      const response = JSON.parse(uploadResult.body);
      console.log('✅ Parsed response:', JSON.stringify(response, null, 2));
      
      console.log('═══════════════════════════════════════');
      console.log('✅ SCAN BILL API CALL COMPLETED');
      console.log('═══════════════════════════════════════');
      
      return response;
    } catch (error) {
      console.log('═══════════════════════════════════════');
      console.error('❌ SCAN BILL API CALL FAILED');
      console.log('═══════════════════════════════════════');
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // Provide more specific error messages
      if (error.message?.includes('Network request failed')) {
        const betterError = new Error('Cannot connect to server. Please check your connection and ensure backend is running.');
        console.error('❌ Throwing:', betterError.message);
        throw betterError;
      } else if (error.message?.includes('token')) {
        const betterError = new Error('Authentication failed. Please logout and login again.');
        console.error('❌ Throwing:', betterError.message);
        throw betterError;
      } else if (error.message?.includes('Upload failed')) {
        const betterError = new Error(`Server error: ${error.message}`);
        console.error('❌ Throwing:', betterError.message);
        throw betterError;
      }
      
      console.error('❌ Re-throwing original error');
      throw error;
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
