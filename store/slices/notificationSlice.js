import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import notificationService from '../../utils/notificationService';
import notificationAPI from '../api/notificationAPI';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ userId, params } = {}, { rejectWithValue, getState }) => {
    try {
      const response = await notificationAPI.getUserNotifications(userId, params);
      
      // Check for new notifications and trigger push notifications
      const state = getState().notification;
      const existingIds = new Set(state.notifications.map(n => n._id));
      const newNotifications = response.data.notifications?.filter(n => !existingIds.has(n._id)) || [];
      
      // Trigger local push notifications for new items
      for (const notification of newNotifications) {
        if (!notification.read) {
          await triggerLocalPushNotification(notification);
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Helper to trigger local push notifications
const triggerLocalPushNotification = async (notification) => {
  try {
    const { type, title, message, payload } = notification;
    
    switch (type) {
      case 'bill_created':
        await notificationService.showLocalNotification({
          title: '💰 ' + title,
          body: message,
          data: {
            type,
            billId: payload?.billId,
            screen: 'reminders',
          },
        });
        break;
        
      case 'expense_created':
        await notificationService.showLocalNotification({
          title: '🧾 ' + title,
          body: message,
          data: {
            type,
            expenseId: payload?.expenseId,
            screen: 'reminders',
          },
        });
        break;
        
      case 'payment_received':
        await notificationService.showLocalNotification({
          title: '✅ ' + title,
          body: message,
          data: {
            type,
            screen: 'reminders',
          },
        });
        break;
        
      case 'bill_due':
      case 'bill_overdue':
        await notificationService.showLocalNotification({
          title: '⚠️ ' + title,
          body: message,
          data: {
            type,
            billId: payload?.billId,
            screen: 'reminders',
          },
          priority: 'max',
        });
        break;
        
      default:
        await notificationService.showLocalNotification({
          title,
          body: message,
          data: {
            type,
            screen: 'reminders',
          },
        });
    }
  } catch (error) {
    console.error('❌ Error triggering push notification:', error);
  }
};

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getUnreadCount();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      return { notificationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const deleteReadNotifications = createAsyncThunk(
  'notification/deleteReadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.deleteReadNotifications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete read notifications');
    }
  }
);

const initialState = {
  // Notifications list
  notifications: [],
  
  // Unread count
  unreadCount: 0,
  
  // Loading states
  loading: false,
  countLoading: false,
  actionLoading: false,
  
  // Errors
  error: null,
  countError: null,
  actionError: null,
  
  // Last fetch timestamp
  lastFetch: null,
  
  // Filters
  filters: {
    read: null, // null = all, true = read, false = unread
    limit: 50,
  },
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.countError = null;
      state.actionError = null;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.lastFetch = null;
    },
    
    // Optimistic update for mark as read
    markAsReadOptimistic: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload?.notifications || [];
        state.unreadCount = action.payload?.unreadCount || 0;
        state.lastFetch = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.countLoading = true;
        state.countError = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.countLoading = false;
        state.unreadCount = action.payload?.unreadCount || 0;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.countLoading = false;
        state.countError = action.payload;
      })

      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.actionLoading = false;
        const notification = state.notifications.find(n => n._id === action.payload.notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.actionLoading = false;
        state.notifications.forEach(notification => {
          if (!notification.read) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Delete notification
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.actionLoading = false;
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      // Delete read notifications
      .addCase(deleteReadNotifications.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteReadNotifications.fulfilled, (state) => {
        state.actionLoading = false;
        state.notifications = state.notifications.filter(n => !n.read);
      })
      .addCase(deleteReadNotifications.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });  
  }
});

export const {
  clearErrors,
  setFilters,
  clearNotifications,
  markAsReadOptimistic,
} = notificationSlice.actions;

export default notificationSlice.reducer;
