import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import flatmateAPI from '../api/flatmateAPI';

// Async thunks
export const fetchAllFlatmates = createAsyncThunk(
  'flatmate/fetchAllFlatmates',
  async (params, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.getAllFlatmates(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flatmates');
    }
  }
);

export const fetchActiveFlatmates = createAsyncThunk(
  'flatmate/fetchActiveFlatmates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.getActiveFlatmates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active flatmates');
    }
  }
);

export const addFlatmate = createAsyncThunk(
  'flatmate/addFlatmate',
  async (flatmateData, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.addFlatmate(flatmateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add flatmate');
    }
  }
);

export const updateFlatmate = createAsyncThunk(
  'flatmate/updateFlatmate',
  async ({ flatmateId, updateData }, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.updateFlatmate(flatmateId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update flatmate');
    }
  }
);

export const removeFlatmate = createAsyncThunk(
  'flatmate/removeFlatmate',
  async ({ flatmateId, permanent }, { rejectWithValue }) => {
    try {
      await flatmateAPI.removeFlatmate(flatmateId, permanent);
      return { flatmateId, permanent };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove flatmate');
    }
  }
);

export const reactivateFlatmate = createAsyncThunk(
  'flatmate/reactivateFlatmate',
  async (flatmateId, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.reactivateFlatmate(flatmateId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reactivate flatmate');
    }
  }
);

export const fetchFlatmateStats = createAsyncThunk(
  'flatmate/fetchFlatmateStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.getFlatmateStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flatmate stats');
    }
  }
);

// Invitation async thunks
export const getInvitationByToken = createAsyncThunk(
  'flatmate/getInvitationByToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.getInvitationByToken(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invitation');
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  'flatmate/acceptInvitation',
  async ({ token, userDetails }, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.acceptInvitation(token, userDetails);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invitation');
    }
  }
);

export const fetchUserInvitations = createAsyncThunk(
  'flatmate/fetchUserInvitations',
  async (status, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.getUserInvitations(status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invitations');
    }
  }
);

export const cancelInvitation = createAsyncThunk(
  'flatmate/cancelInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.cancelInvitation(invitationId);
      return { invitationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel invitation');
    }
  }
);

export const resendInvitationSMS = createAsyncThunk(
  'flatmate/resendInvitationSMS',
  async (invitationId, { rejectWithValue }) => {
    try {
      const response = await flatmateAPI.resendInvitationSMS(invitationId);
      return { invitationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend invitation SMS');
    }
  }
);

const initialState = {
  flatmates: [],
  activeFlatmates: [],
  stats: {
    totalFlatmates: 0,
    activeFlatmates: 0,
    inactiveFlatmates: 0,
    totalMonthlyContribution: 0,
    averageContribution: 0
  },
  // Invitation state
  invitations: [],
  currentInvitation: null,
  invitationStats: {
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    cancelled: 0
  },
  loading: false,
  invitationLoading: false,
  error: null,
  invitationError: null,
  lastFetch: null
};

const flatmateSlice = createSlice({
  name: 'flatmate',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.invitationError = null;
    },
    clearFlatmates: (state) => {
      state.flatmates = [];
      state.activeFlatmates = [];
      state.stats = initialState.stats;
      state.lastFetch = null;
    },
    clearInvitations: (state) => {
      state.invitations = [];
      state.currentInvitation = null;
      state.invitationStats = initialState.invitationStats;
    },
    setCurrentInvitation: (state, action) => {
      state.currentInvitation = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all flatmates
      .addCase(fetchAllFlatmates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFlatmates.fulfilled, (state, action) => {
        state.loading = false;
        state.flatmates = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchAllFlatmates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch active flatmates
      .addCase(fetchActiveFlatmates.fulfilled, (state, action) => {
        state.activeFlatmates = action.payload;
      })

      // Add flatmate
      .addCase(addFlatmate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFlatmate.fulfilled, (state, action) => {
        state.loading = false;
        state.flatmates.unshift(action.payload);
        if (action.payload.status === 'active') {
          state.activeFlatmates.unshift(action.payload);
        }
      })
      .addCase(addFlatmate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update flatmate
      .addCase(updateFlatmate.fulfilled, (state, action) => {
        const flatmateId = action.payload._id;
        
        const updateFlatmate = (flatmateArray) => {
          const index = flatmateArray.findIndex(f => f._id === flatmateId);
          if (index !== -1) {
            flatmateArray[index] = action.payload;
          }
        };
        
        updateFlatmate(state.flatmates);
        updateFlatmate(state.activeFlatmates);
        
        // If status changed to inactive, remove from active list
        if (action.payload.status === 'inactive') {
          state.activeFlatmates = state.activeFlatmates.filter(f => f._id !== flatmateId);
        }
        // If status changed to active and not in active list, add it
        else if (action.payload.status === 'active' && !state.activeFlatmates.find(f => f._id === flatmateId)) {
          state.activeFlatmates.push(action.payload);
        }
      })

      // Remove flatmate
      .addCase(removeFlatmate.fulfilled, (state, action) => {
        const { flatmateId, permanent } = action.payload;
        
        if (permanent) {
          // Permanently remove from all arrays
          state.flatmates = state.flatmates.filter(f => f._id !== flatmateId);
          state.activeFlatmates = state.activeFlatmates.filter(f => f._id !== flatmateId);
        } else {
          // Mark as inactive - update status in flatmates array and remove from active
          const flatmate = state.flatmates.find(f => f._id === flatmateId);
          if (flatmate) {
            flatmate.status = 'inactive';
            flatmate.leftAt = new Date().toISOString();
          }
          state.activeFlatmates = state.activeFlatmates.filter(f => f._id !== flatmateId);
        }
      })

      // Reactivate flatmate
      .addCase(reactivateFlatmate.fulfilled, (state, action) => {
        const flatmateId = action.payload._id;
        
        // Update in flatmates array
        const flatmate = state.flatmates.find(f => f._id === flatmateId);
        if (flatmate) {
          Object.assign(flatmate, action.payload);
        }
        
        // Add to active flatmates if not already there
        if (!state.activeFlatmates.find(f => f._id === flatmateId)) {
          state.activeFlatmates.push(action.payload);
        }
      })

      // Fetch flatmate stats
      .addCase(fetchFlatmateStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Get invitation by token
      .addCase(getInvitationByToken.pending, (state) => {
        state.invitationLoading = true;
        state.invitationError = null;
      })
      .addCase(getInvitationByToken.fulfilled, (state, action) => {
        state.invitationLoading = false;
        state.currentInvitation = action.payload;
      })
      .addCase(getInvitationByToken.rejected, (state, action) => {
        state.invitationLoading = false;
        state.invitationError = action.payload;
      })

      // Accept invitation
      .addCase(acceptInvitation.pending, (state) => {
        state.invitationLoading = true;
        state.invitationError = null;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.invitationLoading = false;
        // Add the new flatmate to the list
        if (action.payload.flatmate) {
          state.flatmates.unshift(action.payload.flatmate);
          if (action.payload.flatmate.status === 'active') {
            state.activeFlatmates.unshift(action.payload.flatmate);
          }
        }
        // Update current invitation
        if (action.payload.invitation) {
          state.currentInvitation = action.payload.invitation;
        }
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.invitationLoading = false;
        state.invitationError = action.payload;
      })

      // Fetch user invitations
      .addCase(fetchUserInvitations.fulfilled, (state, action) => {
        state.invitations = action.payload;
      })

      // Cancel invitation
      .addCase(cancelInvitation.fulfilled, (state, action) => {
        const { invitationId } = action.payload;
        const invitation = state.invitations.find(inv => inv._id === invitationId);
        if (invitation) {
          invitation.status = 'cancelled';
        }
      })

      // Resend invitation SMS
      .addCase(resendInvitationSMS.fulfilled, (state, action) => {
        const { invitationId, data } = action.payload;
        const invitation = state.invitations.find(inv => inv._id === invitationId);
        if (invitation && data.invitation) {
          Object.assign(invitation, data.invitation);
        }
      });
  }
});

export const { clearError, clearFlatmates, clearInvitations, setCurrentInvitation } = flatmateSlice.actions;
export default flatmateSlice.reducer;