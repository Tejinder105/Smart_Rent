import { AppState } from 'react-native';
import { store } from '../store';
import { fetchNotifications, fetchUnreadCount } from '../store/slices/notificationSlice';

class NotificationPoller {
  constructor() {
    this.pollInterval = null;
    this.appStateSubscription = null;
    this.isPolling = false;
    this.pollingIntervalMs = 30000; // Poll every 30 seconds
  }

  /**
   * Start polling for new notifications
   */
  start() {
    if (this.isPolling) {
      console.log('⚠️ Notification polling already active');
      return;
    }

    console.log('🔄 Starting notification polling...');
    this.isPolling = true;

    // Initial fetch
    this.poll();

    // Set up interval polling
    this.pollInterval = setInterval(() => {
      this.poll();
    }, this.pollingIntervalMs);

    // Listen to app state changes
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    console.log('✅ Notification polling started');
  }

  /**
   * Stop polling
   */
  stop() {
    if (!this.isPolling) {
      return;
    }

    console.log('🛑 Stopping notification polling...');
    this.isPolling = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    console.log('✅ Notification polling stopped');
  }

  /**
   * Poll for new notifications
   */
  async poll() {
    try {
      const state = store.getState();
      const { isAuthenticated } = state.auth;

      if (!isAuthenticated) {
        return;
      }

      // Fetch new notifications (this will trigger push notifications for new items)
      await store.dispatch(fetchNotifications({}));
      await store.dispatch(fetchUnreadCount());

    } catch (error) {
      console.error('❌ Error polling notifications:', error);
    }
  }

  /**
   * Handle app state changes
   */
  handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      console.log('📱 App became active, polling notifications');
      this.poll();
    }
  };

  /**
   * Update polling interval
   */
  setPollingInterval(intervalMs) {
    this.pollingIntervalMs = intervalMs;
    
    if (this.isPolling) {
      this.stop();
      this.start();
    }
  }
}

export default new NotificationPoller();
