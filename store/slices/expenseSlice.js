import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import expenseAPI from '../api/expenseAPI';

// Async thunks
export const fetchUserExpenses = createAsyncThunk(
  'expense/fetchUserExpenses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getUserExpenses(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const fetchCreatedExpenses = createAsyncThunk(
  'expense/fetchCreatedExpenses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getCreatedExpenses(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch created expenses');
    }
  }
);

export const fetchParticipantExpenses = createAsyncThunk(
  'expense/fetchParticipantExpenses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getParticipantExpenses(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch participant expenses');
    }
  }
);

export const createSplitExpense = createAsyncThunk(
  'expense/createSplitExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.createSplitExpense(expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const markParticipantPaid = createAsyncThunk(
  'expense/markParticipantPaid',
  async ({ expenseId, participantUserId }, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.markParticipantPaid(expenseId, participantUserId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark participant as paid');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expense/updateExpense',
  async ({ expenseId, updateData }, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.updateExpense(expenseId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expense/deleteExpense',
  async (expenseId, { rejectWithValue }) => {
    try {
      await expenseAPI.deleteExpense(expenseId);
      return expenseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

export const fetchExpenseStats = createAsyncThunk(
  'expense/fetchExpenseStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getExpenseStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense stats');
    }
  }
);

export const fetchAvailableFlatmates = createAsyncThunk(
  'expense/fetchAvailableFlatmates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getAvailableFlatmates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available flatmates');
    }
  }
);

const initialState = {
  expenses: [],
  createdExpenses: [],
  participantExpenses: [],
  availableFlatmates: [],
  stats: {
    created: {
      totalExpenses: 0,
      totalAmount: 0,
      settledCount: 0,
      activeCount: 0
    },
    participant: {
      totalOwed: 0,
      paidAmount: 0,
      pendingAmount: 0,
      totalParticipations: 0
    }
  },
  loading: false,
  error: null,
  lastFetch: null
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.createdExpenses = [];
      state.participantExpenses = [];
      state.availableFlatmates = [];
      state.stats = initialState.stats;
      state.lastFetch = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user expenses
      .addCase(fetchUserExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchUserExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch created expenses
      .addCase(fetchCreatedExpenses.fulfilled, (state, action) => {
        state.createdExpenses = action.payload;
      })

      // Fetch participant expenses
      .addCase(fetchParticipantExpenses.fulfilled, (state, action) => {
        state.participantExpenses = action.payload;
      })

      // Create split expense
      .addCase(createSplitExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSplitExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
        state.createdExpenses.unshift(action.payload);
      })
      .addCase(createSplitExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark participant paid
      .addCase(markParticipantPaid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markParticipantPaid.fulfilled, (state, action) => {
        state.loading = false;
        const expenseId = action.payload._id;
        
        // Update in all relevant arrays
        const updateExpense = (expenseArray) => {
          const index = expenseArray.findIndex(e => e._id === expenseId);
          if (index !== -1) {
            expenseArray[index] = action.payload;
          }
        };
        
        updateExpense(state.expenses);
        updateExpense(state.createdExpenses);
        updateExpense(state.participantExpenses);
      })
      .addCase(markParticipantPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const expenseId = action.payload._id;
        
        const updateExpense = (expenseArray) => {
          const index = expenseArray.findIndex(e => e._id === expenseId);
          if (index !== -1) {
            expenseArray[index] = action.payload;
          }
        };
        
        updateExpense(state.expenses);
        updateExpense(state.createdExpenses);
        updateExpense(state.participantExpenses);
      })

      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        const expenseId = action.payload;
        state.expenses = state.expenses.filter(e => e._id !== expenseId);
        state.createdExpenses = state.createdExpenses.filter(e => e._id !== expenseId);
        state.participantExpenses = state.participantExpenses.filter(e => e._id !== expenseId);
      })

      // Fetch expense stats
      .addCase(fetchExpenseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Fetch available flatmates
      .addCase(fetchAvailableFlatmates.fulfilled, (state, action) => {
        state.availableFlatmates = action.payload;
      });
  }
});

export const { clearError, clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;