import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import paymentAPI from '../api/paymentAPI';

// Async thunks
export const fetchOutstandingDues = createAsyncThunk(
  'payment/fetchOutstandingDues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getOutstandingDues();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch outstanding dues');
    }
  }
);

export const fetchUserPayments = createAsyncThunk(
  'payment/fetchUserPayments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getUserPayments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const createPayment = createAsyncThunk(
  'payment/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createPayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment');
    }
  }
);

export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async ({ paymentId, processData }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.processPayment(paymentId, processData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment');
    }
  }
);

export const updatePayment = createAsyncThunk(
  'payment/updatePayment',
  async ({ paymentId, updateData }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.updatePayment(paymentId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment');
    }
  }
);

export const deletePayment = createAsyncThunk(
  'payment/deletePayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      await paymentAPI.deletePayment(paymentId);
      return paymentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payment');
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'payment/fetchPaymentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment stats');
    }
  }
);

const initialState = {
  payments: [],
  outstandingDues: [],
  stats: {
    totalPayments: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    paidCount: 0,
    pendingCount: 0
  },
  loading: false,
  error: null,
  lastFetch: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPayments: (state) => {
      state.payments = [];
      state.outstandingDues = [];
      state.stats = initialState.stats;
      state.lastFetch = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch outstanding dues
      .addCase(fetchOutstandingDues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutstandingDues.fulfilled, (state, action) => {
        state.loading = false;
        state.outstandingDues = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchOutstandingDues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user payments
      .addCase(fetchUserPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
        if (action.payload.status === 'pending') {
          state.outstandingDues.unshift(action.payload);
        }
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        const paymentId = action.payload._id;
        
        // Update in payments array
        const paymentIndex = state.payments.findIndex(p => p._id === paymentId);
        if (paymentIndex !== -1) {
          state.payments[paymentIndex] = action.payload;
        }
        
        // Remove from outstanding dues
        state.outstandingDues = state.outstandingDues.filter(p => p._id !== paymentId);
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update payment
      .addCase(updatePayment.fulfilled, (state, action) => {
        const paymentId = action.payload._id;
        const paymentIndex = state.payments.findIndex(p => p._id === paymentId);
        if (paymentIndex !== -1) {
          state.payments[paymentIndex] = action.payload;
        }
        
        const dueIndex = state.outstandingDues.findIndex(p => p._id === paymentId);
        if (dueIndex !== -1) {
          state.outstandingDues[dueIndex] = action.payload;
        }
      })

      // Delete payment
      .addCase(deletePayment.fulfilled, (state, action) => {
        const paymentId = action.payload;
        state.payments = state.payments.filter(p => p._id !== paymentId);
        state.outstandingDues = state.outstandingDues.filter(p => p._id !== paymentId);
      })

      // Fetch payment stats
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearError, clearPayments } = paymentSlice.actions;
export default paymentSlice.reducer;