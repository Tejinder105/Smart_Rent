import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import transactionAPI from '../api/transactionAPI';

// Async thunks
export const payDues = createAsyncThunk(
  'transaction/payDues',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.payDues(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pay dues');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async ({ flatId, transactionData }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.createTransaction(flatId, transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction');
    }
  }
);

export const fetchFlatTransactions = createAsyncThunk(
  'transaction/fetchFlatTransactions',
  async ({ flatId, params }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getFlatTransactions(flatId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchTransactionSummary = createAsyncThunk(
  'transaction/fetchTransactionSummary',
  async ({ flatId, params }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getTransactionSummary(flatId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

export const fetchUserTransactions = createAsyncThunk(
  'transaction/fetchUserTransactions',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getUserTransactions(userId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user transactions');
    }
  }
);

const initialState = {
  // Transactions list
  transactions: [],
  userTransactions: [],
  
  // Summary data
  summary: null,
  
  // Loading states
  loading: false,
  payLoading: false,
  summaryLoading: false,
  
  // Errors
  error: null,
  payError: null,
  summaryError: null,
  
  // Last fetch timestamp
  lastFetch: null,
  
  // Filters
  filters: {
    startDate: null,
    endDate: null,
    userId: null,
  },
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.payError = null;
      state.summaryError = null;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearTransactions: (state) => {
      state.transactions = [];
      state.userTransactions = [];
      state.summary = null;
      state.lastFetch = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Pay dues
      .addCase(payDues.pending, (state) => {
        state.payLoading = true;
        state.payError = null;
      })
      .addCase(payDues.fulfilled, (state, action) => {
        state.payLoading = false;
        // Add new transactions to the list
        if (Array.isArray(action.payload)) {
          state.transactions.unshift(...action.payload);
          state.userTransactions.unshift(...action.payload);
        } else {
          state.transactions.unshift(action.payload);
          state.userTransactions.unshift(action.payload);
        }
        state.lastFetch = Date.now();
      })
      .addCase(payDues.rejected, (state, action) => {
        state.payLoading = false;
        state.payError = action.payload;
      })

      // Create transaction
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
        state.lastFetch = Date.now();
      })

      // Fetch flat transactions
      .addCase(fetchFlatTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlatTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchFlatTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch transaction summary
      .addCase(fetchTransactionSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchTransactionSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.payload;
      })

      // Fetch user transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.userTransactions = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearErrors,
  setFilters,
  clearTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;
