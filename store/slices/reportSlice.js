import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import reportAPI from '../api/reportAPI';

// Async thunks
export const fetchMonthlyReport = createAsyncThunk(
  'report/fetchMonthlyReport',
  async ({ flatId, params }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getMonthlyReport(flatId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly report');
    }
  }
);

export const setFlatBudget = createAsyncThunk(
  'report/setFlatBudget',
  async ({ flatId, budgetData }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.setFlatBudget(flatId, budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set budget');
    }
  }
);

export const fetchBudgetForecast = createAsyncThunk(
  'report/fetchBudgetForecast',
  async ({ flatId, params }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getBudgetForecast(flatId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch forecast');
    }
  }
);

export const fetchCategorySpending = createAsyncThunk(
  'report/fetchCategorySpending',
  async ({ flatId, params }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getCategorySpending(flatId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category spending');
    }
  }
);

export const exportReport = createAsyncThunk(
  'report/exportReport',
  async ({ flatId, params }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.exportReport(flatId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export report');
    }
  }
);

const initialState = {
  // Monthly report data
  monthlyReport: null,
  
  // Budget and forecast
  budget: null,
  forecast: null,
  
  // Category spending
  categorySpending: null,
  
  // Export status
  exportedFile: null,
  
  // Loading states
  loading: false,
  budgetLoading: false,
  forecastLoading: false,
  categoryLoading: false,
  exportLoading: false,
  
  // Errors
  error: null,
  budgetError: null,
  forecastError: null,
  categoryError: null,
  exportError: null,
  
  // Last fetch timestamp
  lastFetch: null,
  
  // Selected period
  selectedPeriod: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.budgetError = null;
      state.forecastError = null;
      state.categoryError = null;
      state.exportError = null;
    },
    
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    
    clearReports: (state) => {
      state.monthlyReport = null;
      state.budget = null;
      state.forecast = null;
      state.categorySpending = null;
      state.exportedFile = null;
      state.lastFetch = null;
    },
    
    clearForecast: (state) => {
      state.forecast = null;
      state.forecastError = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch monthly report
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyReport = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Set flat budget
      .addCase(setFlatBudget.pending, (state) => {
        state.budgetLoading = true;
        state.budgetError = null;
      })
      .addCase(setFlatBudget.fulfilled, (state, action) => {
        state.budgetLoading = false;
        state.budget = action.payload;
      })
      .addCase(setFlatBudget.rejected, (state, action) => {
        state.budgetLoading = false;
        state.budgetError = action.payload;
      })

      // Fetch budget forecast (ML)
      .addCase(fetchBudgetForecast.pending, (state) => {
        state.forecastLoading = true;
        state.forecastError = null;
      })
      .addCase(fetchBudgetForecast.fulfilled, (state, action) => {
        state.forecastLoading = false;
        state.forecast = action.payload;
      })
      .addCase(fetchBudgetForecast.rejected, (state, action) => {
        state.forecastLoading = false;
        state.forecastError = action.payload;
      })

      // Fetch category spending
      .addCase(fetchCategorySpending.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchCategorySpending.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categorySpending = action.payload;
      })
      .addCase(fetchCategorySpending.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload;
      })

      // Export report
      .addCase(exportReport.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exportedFile = action.payload;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      });
  }
});

export const {
  clearErrors,
  setSelectedPeriod,
  clearReports,
  clearForecast,
} = reportSlice.actions;

export default reportSlice.reducer;
