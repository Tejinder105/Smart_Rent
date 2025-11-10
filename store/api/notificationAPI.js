import { createDefaultApiClient, handleApiError } from './apiClient';

const api = createDefaultApiClient();

const notificationAPI = {
  /**
   * Get user notifications
   * @param {string} userId - Optional user ID (defaults to current user)
   * @param {Object} params - Query params (limit, isRead)
   * @returns {Promise} List of notifications
   */
  getUserNotifications: async (userId = null, params = {}) => {
    try {
      console.log('🔔 Fetching notifications...');
      const endpoint = userId ? `/notifications/users/${userId}` : '/notifications';
      const res = await api.get(endpoint, { params });
      console.log('✅ Notifications fetched:', res.data?.data?.length || 0);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get notifications');
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise} Unread count
   */
  getUnreadCount: async () => {
    try {
      console.log('🔢 Fetching unread count...');
      const res = await api.get('/notifications/unread/count');
      console.log('✅ Unread count:', res.data?.data?.count || 0);
      return res.data;
    } catch (error) {
      handleApiError(error, 'Get unread count');
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Updated notification
   */
  markAsRead: async (notificationId) => {
    try {
      console.log('✅ Marking notification as read:', notificationId);
      const res = await api.put(`/notifications/${notificationId}/read`);
      console.log('✅ Notification marked as read');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} Updated count
   */
  markAllAsRead: async () => {
    try {
      console.log('✅ Marking all notifications as read...');
      const res = await api.put('/notifications/read/all');
      console.log('✅ All notifications marked as read');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Mark all notifications as read');
    }
  },

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Deletion confirmation
   */
  deleteNotification: async (notificationId) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      const res = await api.delete(`/notifications/${notificationId}`);
      console.log('✅ Notification deleted');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Delete notification');
    }
  },

  /**
   * Delete all read notifications
   * @returns {Promise} Deletion confirmation
   */
  deleteReadNotifications: async () => {
    try {
      console.log('🗑️ Deleting all read notifications...');
      const res = await api.delete('/notifications/read/all');
      console.log('✅ Read notifications deleted');
      return res.data;
    } catch (error) {
      handleApiError(error, 'Delete read notifications');
    }
  },
};

export default notificationAPI;
