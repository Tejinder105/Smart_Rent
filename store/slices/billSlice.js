import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import billAPI from '../api/billAPI';

// Async thunks
export const createBill = createAsyncThunk(
  'bill/createBill',
  async ({ flatId, billData }, { rejectWithValue }) => {
    try {
      const response = await billAPI.createBill(flatId, billData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create bill');
    }
  }
);

export const fetchFlatBills = createAsyncThunk(
  'bill/fetchFlatBills',
  async ({ flatId, params }, { rejectWithValue }) => {
    try {
      const response = await billAPI.getFlatBills(flatId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bills');
    }
  }
);

export const fetchBill = createAsyncThunk(
  'bill/fetchBill',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await billAPI.getBill(billId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bill');
    }
  }
);

export const updateBill = createAsyncThunk(
  'bill/updateBill',
  async ({ billId, updateData }, { rejectWithValue }) => {
    try {
      const response = await billAPI.updateBill(billId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update bill');
    }
  }
);

export const deleteBill = createAsyncThunk(
  'bill/deleteBill',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await billAPI.deleteBill(billId);
      return billId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete bill');
    }
  }
);

export const scanBill = createAsyncThunk(
  'bill/scanBill',
  async (imageFile, { rejectWithValue }) => {
    try {
      const response = await billAPI.scanBill(imageFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to scan bill');
    }
  }
);

export const markBillPaid = createAsyncThunk(
  'bill/markBillPaid',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await billAPI.markBillPaid(billId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark bill as paid');
    }
  }
);

export const fetchUserDues = createAsyncThunk(
  'bill/fetchUserDues',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await billAPI.getUserDues(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dues');
    }
  }
);

const initialState = {
  // Bills list
  bills: [],
  currentBill: null,
  userDues: [],
  totalDue: 0,
  
  // Scanned bill data from OCR
  scannedBillData: null,
  
  // Loading states
  loading: false,
  createLoading: false,
  scanLoading: false,
  duesLoading: false,
  
  // Errors
  error: null,
  createError: null,
  scanError: null,
  duesError: null,
  
  // Last fetch timestamp
  lastFetch: null,
  
  // Filters
  filters: {
    status: 'all', // 'all', 'pending', 'paid', 'overdue'
    category: 'all',
  },
};

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.scanError = null;
      state.duesError = null;
    },
    
    clearScannedData: (state) => {
      state.scannedBillData = null;
      state.scanError = null;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearCurrentBill: (state) => {
      state.currentBill = null;
    },
    
    clearBills: (state) => {
      state.bills = [];
      state.userDues = [];
      state.currentBill = null;
      state.scannedBillData = null;
      state.lastFetch = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Create bill
      .addCase(createBill.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.createLoading = false;
        state.bills.unshift(action.payload);
        state.lastFetch = Date.now();
      })
      .addCase(createBill.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // Fetch flat bills
      .addCase(fetchFlatBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlatBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchFlatBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single bill
      .addCase(fetchBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBill.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
      })
      .addCase(fetchBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update bill
      .addCase(updateBill.fulfilled, (state, action) => {
        const index = state.bills.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
        if (state.currentBill?._id === action.payload._id) {
          state.currentBill = action.payload;
        }
      })

      // Delete bill
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.bills = state.bills.filter(b => b._id !== action.payload);
        if (state.currentBill?._id === action.payload) {
          state.currentBill = null;
        }
      })

      // Scan bill (OCR)
      .addCase(scanBill.pending, (state) => {
        state.scanLoading = true;
        state.scanError = null;
      })
      .addCase(scanBill.fulfilled, (state, action) => {
        state.scanLoading = false;
        state.scannedBillData = action.payload;
      })
      .addCase(scanBill.rejected, (state, action) => {
        state.scanLoading = false;
        state.scanError = action.payload;
      })

      // Mark bill paid
      .addCase(markBillPaid.fulfilled, (state, action) => {
        const index = state.bills.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
        if (state.currentBill?._id === action.payload._id) {
          state.currentBill = action.payload;
        }
        // Remove from dues if present
        state.userDues = state.userDues.filter(d => d.billId !== action.payload._id);
      })

      // Fetch user dues
      .addCase(fetchUserDues.pending, (state) => {
        state.duesLoading = true;
        state.duesError = null;
      })
      .addCase(fetchUserDues.fulfilled, (state, action) => {
        state.duesLoading = false;
        // Extract dues array from nested data structure
        state.userDues = action.payload?.dues || action.payload || [];
        state.totalDue = action.payload?.totalDue || 0;
      })
      .addCase(fetchUserDues.rejected, (state, action) => {
        state.duesLoading = false;
        state.duesError = action.payload;
      });
  }
});

export const {
  clearErrors,
  clearScannedData,
  setFilters,
  clearCurrentBill,
  clearBills,
} = billSlice.actions;

export default billSlice.reducer;
