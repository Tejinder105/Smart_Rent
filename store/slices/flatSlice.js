import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import flatAPI from '../api/flatAPI';

// Async thunks
export const createFlat = createAsyncThunk(
  'flat/createFlat',
  async (flatData, { rejectWithValue }) => {
    try {
      const response = await flatAPI.createFlat(flatData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create flat');
    }
  }
);

export const joinFlat = createAsyncThunk(
  'flat/joinFlat',
  async (joinCode, { rejectWithValue }) => {
    try {
      const response = await flatAPI.joinFlat(joinCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join flat');
    }
  }
);

export const fetchUserFlat = createAsyncThunk(
  'flat/fetchUserFlat',
  async (_, { rejectWithValue }) => {
    try {
      const response = await flatAPI.getUserFlat();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flat');
    }
  }
);

export const fetchFlatPreview = createAsyncThunk(
  'flat/fetchFlatPreview',
  async (joinCode, { rejectWithValue }) => {
    try {
      const response = await flatAPI.getFlatPreview(joinCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flat preview');
    }
  }
);

export const updateFlat = createAsyncThunk(
  'flat/updateFlat',
  async ({ flatId, updateData }, { rejectWithValue }) => {
    try {
      const response = await flatAPI.updateFlat(flatId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update flat');
    }
  }
);

// Invitation functionality removed - only join codes are supported

export const leaveFlat = createAsyncThunk(
  'flat/leaveFlat',
  async (flatId, { rejectWithValue }) => {
    try {
      const response = await flatAPI.leaveFlat(flatId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave flat');
    }
  }
);

export const deleteFlat = createAsyncThunk(
  'flat/deleteFlat',
  async (flatId, { rejectWithValue }) => {
    try {
      const response = await flatAPI.deleteFlat(flatId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete flat');
    }
  }
);

export const fetchFlatMembers = createAsyncThunk(
  'flat/fetchFlatMembers',
  async (flatId, { rejectWithValue }) => {
    try {
      const response = await flatAPI.getFlatMembers(flatId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flat members');
    }
  }
);


const initialState = {
  // Current user's flat
  currentFlat: null,
  userRole: null,
  userContribution: 0,
  
  // Flat preview (for join code)
  flatPreview: null,
  
  // Flat members
  flatMembers: [],
  
  // Loading states
  loading: false,
  createLoading: false,
  joinLoading: false,
  
  // Errors
  error: null,
  createError: null,
  joinError: null,
  
  // Last fetch timestamp
  lastFetch: null,
  
  // Join process state
  joinProcess: {
    step: 'initial', // 'initial', 'preview', 'joining', 'success', 'error'
    joinCode: '',
    preview: null
  }
};

const flatSlice = createSlice({
  name: 'flat',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.joinError = null;
    },
    
    clearFlat: (state) => {
      state.currentFlat = null;
      state.userRole = null;
      state.userContribution = 0;
      state.flatMembers = [];
      state.lastFetch = null;
    },
    
    clearFlatPreview: (state) => {
      state.flatPreview = null;
    },
    
    setJoinCode: (state, action) => {
      state.joinProcess.joinCode = action.payload;
    },
    
    resetJoinProcess: (state) => {
      state.joinProcess = {
        step: 'initial',
        joinCode: '',
        preview: null
      };
    },
    
    setJoinStep: (state, action) => {
      state.joinProcess.step = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Create flat
      .addCase(createFlat.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createFlat.fulfilled, (state, action) => {
        state.createLoading = false;
        state.currentFlat = action.payload;
        state.userRole = 'admin';
        state.userContribution = 0;
        state.lastFetch = Date.now();
      })
      .addCase(createFlat.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // Join flat
      .addCase(joinFlat.pending, (state) => {
        state.joinLoading = true;
        state.joinError = null;
        state.joinProcess.step = 'joining';
      })
      .addCase(joinFlat.fulfilled, (state, action) => {
        state.joinLoading = false;
        state.currentFlat = action.payload;
        state.userRole = action.payload.userRole || 'co_tenant';
        state.userContribution = action.payload.userContribution || 0;
        state.lastFetch = Date.now();
        state.joinProcess.step = 'success';
      })
      .addCase(joinFlat.rejected, (state, action) => {
        state.joinLoading = false;
        state.joinError = action.payload;
        state.joinProcess.step = 'error';
      })

      // Fetch user flat
      .addCase(fetchUserFlat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFlat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFlat = action.payload;
        state.userRole = action.payload?.userRole || null;
        state.userContribution = action.payload?.userContribution || 0;
        state.lastFetch = Date.now();
      })
      .addCase(fetchUserFlat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch flat preview
      .addCase(fetchFlatPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.joinProcess.step = 'preview';
      })
      .addCase(fetchFlatPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.flatPreview = action.payload;
        state.joinProcess.preview = action.payload;
      })
      .addCase(fetchFlatPreview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.joinProcess.step = 'error';
      })

      // Update flat
      .addCase(updateFlat.fulfilled, (state, action) => {
        state.currentFlat = action.payload;
        state.lastFetch = Date.now();
      })

      // Leave flat
      .addCase(leaveFlat.fulfilled, (state) => {
        state.currentFlat = null;
        state.userRole = null;
        state.userContribution = 0;
        state.flatMembers = [];
        state.lastFetch = null;
      })

      // Delete flat
      .addCase(deleteFlat.fulfilled, (state) => {
        state.currentFlat = null;
        state.userRole = null;
        state.userContribution = 0;
        state.flatMembers = [];
        state.lastFetch = null;
      })

      // Fetch flat members
      .addCase(fetchFlatMembers.fulfilled, (state, action) => {
        state.flatMembers = action.payload;
      })


  }
});

export const {
  clearErrors,
  clearFlat,
  clearFlatPreview,
  setJoinCode,
  resetJoinProcess,
  setJoinStep
} = flatSlice.actions;

export default flatSlice.reducer;