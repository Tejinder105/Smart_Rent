import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import budgetAPI from '../api/budgetAPI';

// Async thunks
export const updateFlatBudget = createAsyncThunk(
  'budget/updateFlatBudget',
  async ({ flatId, monthlyBudget }, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.updateFlatBudget(flatId, monthlyBudget);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
    }
  }
);

export const fetchCurrentBudgetStatus = createAsyncThunk(
  'budget/fetchCurrentBudgetStatus',
  async (flatId, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.getCurrentBudgetStatus(flatId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget status');
    }
  }
);

export const fetchBudgetHistory = createAsyncThunk(
  'budget/fetchBudgetHistory',
  async ({ flatId, months }, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.getBudgetHistory(flatId, months);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget history');
    }
  }
);

const initialState = {
  // Current month budget status
  currentStatus: null,
  
  // Budget history
  history: [],
  flatMonthlyBudget: 0,
  
  // Loading states
  loading: false,
  historyLoading: false,
  updating: false,
  
  // Errors
  error: null,
  historyError: null,
  updateError: null,
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.historyError = null;
      state.updateError = null;
    },
    
    clearBudgetData: (state) => {
      state.currentStatus = null;
      state.history = [];
      state.flatMonthlyBudget = 0;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Update flat budget
      .addCase(updateFlatBudget.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateFlatBudget.fulfilled, (state, action) => {
        state.updating = false;
        state.flatMonthlyBudget = action.payload.monthlyBudget;
        if (state.currentStatus) {
          state.currentStatus.monthlyBudget = action.payload.monthlyBudget;
        }
      })
      .addCase(updateFlatBudget.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      })

      // Fetch current budget status
      .addCase(fetchCurrentBudgetStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentBudgetStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStatus = action.payload;
      })
      .addCase(fetchCurrentBudgetStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch budget history
      .addCase(fetchBudgetHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchBudgetHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload.history || [];
        state.flatMonthlyBudget = action.payload.flatMonthlyBudget || 0;
      })
      .addCase(fetchBudgetHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      });
  }
});

export const {
  clearErrors,
  clearBudgetData,
} = budgetSlice.actions;

export default budgetSlice.reducer;
