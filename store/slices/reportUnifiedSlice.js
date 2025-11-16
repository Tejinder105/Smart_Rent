/**
 * Unified Report Slice (V2 - Optimized)
 * Consolidates all report state management with smart caching
 * Replaces reportSlice.js with cleaner, more efficient implementation
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import reportUnifiedAPI from '../api/reportUnifiedAPI';

// Cache duration (5 minutes for current month, 1 hour for past months)
const CACHE_DURATION_CURRENT = 5 * 60 * 1000; // 5 minutes
const CACHE_DURATION_PAST = 60 * 60 * 1000; // 1 hour

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Fetch complete financial report (replaces 3 separate thunks)
 */
export const fetchCompleteReport = createAsyncThunk(
  'reportUnified/fetchCompleteReport',
  async ({ flatId, month }, { rejectWithValue }) => {
    try {
      const response = await reportUnifiedAPI.getCompleteReport(flatId, month);
      return {
        ...response.data,
        _fetchedAt: Date.now(),
        _month: month || new Date().toISOString().slice(0, 7)
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complete report');
    }
  }
);

/**
 * Fetch dashboard summary (optimized minimal payload)
 */
export const fetchDashboardSummary = createAsyncThunk(
  'reportUnified/fetchDashboardSummary',
  async ({ flatId }, { rejectWithValue }) => {
    try {
      const response = await reportUnifiedAPI.getDashboardSummary(flatId);
      return {
        ...response.data,
        _fetchedAt: Date.now()
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard summary');
    }
  }
);

/**
 * Fetch ML budget forecast
 */
export const fetchForecast = createAsyncThunk(
  'reportUnified/fetchForecast',
  async ({ flatId, months = 3 }, { rejectWithValue }) => {
    try {
      const response = await reportUnifiedAPI.getForecast(flatId, months);
      return {
        ...response.data,
        _fetchedAt: Date.now()
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch forecast');
    }
  }
);

/**
 * Fetch category analysis
 */
export const fetchCategoryAnalysis = createAsyncThunk(
  'reportUnified/fetchCategoryAnalysis',
  async ({ flatId, dateRange }, { rejectWithValue }) => {
    try {
      const response = await reportUnifiedAPI.getCategoryAnalysis(flatId, dateRange);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category analysis');
    }
  }
);

/**
 * Export report as CSV
 */
export const exportReportCSV = createAsyncThunk(
  'reportUnified/exportReportCSV',
  async ({ flatId, month }, { rejectWithValue }) => {
    try {
      const response = await reportUnifiedAPI.exportReportCSV(flatId, month);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export report');
    }
  }
);

/**
 * Invalidate cache
 */
export const invalidateReportCache = createAsyncThunk(
  'reportUnified/invalidateCache',
  async ({ flatId, month }, { rejectWithValue }) => {
    try {
      await reportUnifiedAPI.invalidateCache(flatId, month);
      return { flatId, month };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to invalidate cache');
    }
  }
);

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
  // Complete report data
  report: null,
  reportMonth: null,
  reportFetchedAt: null,
  
  // Dashboard summary (lightweight)
  dashboard: null,
  dashboardFetchedAt: null,
  
  // Forecast data
  forecast: null,
  forecastFetchedAt: null,
  
  // Category analysis
  categoryAnalysis: null,
  
  // Export status
  exportedFile: null,
  
  // Loading states
  loading: false,
  dashboardLoading: false,
  forecastLoading: false,
  categoryLoading: false,
  exportLoading: false,
  
  // Errors
  error: null,
  dashboardError: null,
  forecastError: null,
  categoryError: null,
  exportError: null,
};

// =============================================================================
// SLICE
// =============================================================================

const reportUnifiedSlice = createSlice({
  name: 'reportUnified',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.dashboardError = null;
      state.forecastError = null;
      state.categoryError = null;
      state.exportError = null;
    },
    
    clearReport: (state) => {
      state.report = null;
      state.reportMonth = null;
      state.reportFetchedAt = null;
    },
    
    clearForecast: (state) => {
      state.forecast = null;
      state.forecastFetchedAt = null;
    },
    
    clearAll: (state) => {
      return initialState;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch complete report
      .addCase(fetchCompleteReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompleteReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
        state.reportMonth = action.payload._month;
        state.reportFetchedAt = action.payload._fetchedAt;
      })
      .addCase(fetchCompleteReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch dashboard summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
        state.dashboardFetchedAt = action.payload._fetchedAt;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      })

      // Fetch forecast
      .addCase(fetchForecast.pending, (state) => {
        state.forecastLoading = true;
        state.forecastError = null;
      })
      .addCase(fetchForecast.fulfilled, (state, action) => {
        state.forecastLoading = false;
        state.forecast = action.payload;
        state.forecastFetchedAt = action.payload._fetchedAt;
      })
      .addCase(fetchForecast.rejected, (state, action) => {
        state.forecastLoading = false;
        state.forecastError = action.payload;
      })

      // Fetch category analysis
      .addCase(fetchCategoryAnalysis.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchCategoryAnalysis.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categoryAnalysis = action.payload;
      })
      .addCase(fetchCategoryAnalysis.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload;
      })

      // Export report CSV
      .addCase(exportReportCSV.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportReportCSV.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exportedFile = action.payload;
      })
      .addCase(exportReportCSV.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      })

      // Invalidate cache
      .addCase(invalidateReportCache.fulfilled, (state, action) => {
        // Clear cached data
        if (action.payload.month) {
          if (state.reportMonth === action.payload.month) {
            state.report = null;
            state.reportFetchedAt = null;
          }
        } else {
          // Clear all
          state.report = null;
          state.reportFetchedAt = null;
          state.dashboard = null;
          state.dashboardFetchedAt = null;
          state.forecast = null;
          state.forecastFetchedAt = null;
        }
      });
  }
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  clearErrors,
  clearReport,
  clearForecast,
  clearAll,
} = reportUnifiedSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

// Complete report selectors
export const selectReport = (state) => state.reportUnified.report;
export const selectReportLoading = (state) => state.reportUnified.loading;
export const selectReportError = (state) => state.reportUnified.error;

// Dashboard selectors
export const selectDashboard = (state) => state.reportUnified.dashboard;
export const selectDashboardLoading = (state) => state.reportUnified.dashboardLoading;

// Forecast selectors
export const selectForecast = (state) => state.reportUnified.forecast;
export const selectForecastLoading = (state) => state.reportUnified.forecastLoading;

// Category selectors
export const selectCategoryAnalysis = (state) => state.reportUnified.categoryAnalysis;
export const selectCategoryLoading = (state) => state.reportUnified.categoryLoading;

// Cache validation selectors
export const selectIsReportCacheValid = (state) => {
  if (!state.reportUnified.reportFetchedAt) return false;
  
  const age = Date.now() - state.reportUnified.reportFetchedAt;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCurrentMonth = state.reportUnified.reportMonth === currentMonth;
  
  const cacheDuration = isCurrentMonth ? CACHE_DURATION_CURRENT : CACHE_DURATION_PAST;
  return age < cacheDuration;
};

export const selectIsDashboardCacheValid = (state) => {
  if (!state.reportUnified.dashboardFetchedAt) return false;
  const age = Date.now() - state.reportUnified.dashboardFetchedAt;
  return age < CACHE_DURATION_CURRENT;
};

export const selectIsForecastCacheValid = (state) => {
  if (!state.reportUnified.forecastFetchedAt) return false;
  const age = Date.now() - state.reportUnified.forecastFetchedAt;
  return age < CACHE_DURATION_PAST;
};

// =============================================================================
// REDUCER
// =============================================================================

export default reportUnifiedSlice.reducer;
