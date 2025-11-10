import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationChannel = 'smart-rent-reminders';
    this.expoPushToken = null;
  }

  /**
   * Register for push notifications and get Expo Push Token
   */
  async registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️ Notification permissions not granted');
        return null;
      }

      // Get Expo Push Token (without projectId for development)
      // For production, add projectId from app.json extra.eas.projectId
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          // projectId can be omitted in development/standalone builds
          // Add this when you have an EAS project: projectId: 'your-project-id'
        });

        this.expoPushToken = token.data;
        console.log('✅ Expo Push Token:', this.expoPushToken);
        
        return this.expoPushToken;
      } catch (tokenError) {
        // Token generation might fail in development - that's okay
        console.warn('⚠️ Could not get Expo Push Token (this is normal in development):', tokenError.message);
        console.log('✅ Push notifications will still work locally');
        return null;
      }
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Get current Expo Push Token
   */
  getExpoPushToken() {
    return this.expoPushToken;
  }

  /**
   * Request notification permissions and setup notification channel
   */
  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(this.notificationChannel, {
          name: 'Smart Rent Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22c55e',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        // Create additional channel for high priority (bills/expenses)
        await Notifications.setNotificationChannelAsync('smart-rent-alerts', {
          name: 'Bills & Expenses',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 200, 500],
          lightColor: '#22c55e',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          enableLights: true,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Show local push notification (like WhatsApp)
   */
  async showLocalNotification({ title, body, data, sound = 'default', priority = 'high' }) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound,
          priority: Platform.OS === 'android' 
            ? Notifications.AndroidNotificationPriority.MAX 
            : undefined,
          badge: 1,
        },
        trigger: {
          seconds: 1,
          channelId: data?.type === 'reminder' 
            ? this.notificationChannel 
            : 'smart-rent-alerts',
        },
      });

      console.log('✅ Local notification sent:', title);
    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  }

  /**
   * Handle new bill notification
   */
  async notifyNewBill(bill, creatorName) {
    await this.showLocalNotification({
      title: '💰 New Bill Created',
      body: `${creatorName} created "${bill.title}" - ₹${bill.totalAmount}`,
      data: {
        type: 'bill_created',
        billId: bill._id,
        screen: 'reminders',
      },
    });
  }

  /**
   * Handle new expense notification
   */
  async notifyNewExpense(expense, creatorName, yourShare) {
    await this.showLocalNotification({
      title: '🧾 New Expense Split',
      body: `${creatorName}: "${expense.title}" - Your share: ₹${yourShare}`,
      data: {
        type: 'expense_created',
        expenseId: expense._id,
        screen: 'reminders',
      },
    });
  }

  /**
   * Handle payment received notification
   */
  async notifyPaymentReceived(payerName, amount, billTitle) {
    await this.showLocalNotification({
      title: '✅ Payment Received',
      body: `${payerName} paid ₹${amount} for "${billTitle}"`,
      data: {
        type: 'payment_received',
        screen: 'reminders',
      },
    });
  }

  /**
   * Schedule immediate notification for overdues
   */
  async scheduleOverdueAlert(overdueReminders) {
    try {
      if (overdueReminders.length === 0) return;

      const totalAmount = overdueReminders.reduce((sum, r) => sum + r.amount, 0);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Overdue Payments!',
          body: `You have ${overdueReminders.length} overdue payment${overdueReminders.length !== 1 ? 's' : ''} totaling ₹${totalAmount.toFixed(2)}`,
          data: { 
            type: 'overdue',
            screen: 'reminders',
            count: overdueReminders.length,
            amount: totalAmount
          },
          sound: 'default',
          priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.HIGH : undefined,
        },
        trigger: {
          seconds: 2,
          channelId: this.notificationChannel,
        },
      });

      console.log('Overdue notification scheduled');
    } catch (error) {
      console.error('Error scheduling overdue alert:', error);
    }
  }

  /**
   * Schedule daily reminder for overdues at specified time
   */
  async scheduleDailyOverdueReminder(overdueCount, hour = 9, minute = 0) {
    try {
      if (overdueCount === 0) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Payment Reminder',
          body: `Don't forget! You have ${overdueCount} overdue payment${overdueCount !== 1 ? 's' : ''} waiting`,
          data: { 
            type: 'daily-reminder',
            screen: 'reminders'
          },
          sound: 'default',
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
          channelId: this.notificationChannel,
        },
      });

      console.log(`Daily reminder scheduled for ${hour}:${minute}`);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  }

  /**
   * Schedule notification for dues approaching deadline
   */
  async scheduleUpcomingDueReminder(reminder) {
    try {
      const daysText = reminder.daysRemaining === 0 ? 'today' : 
                       reminder.daysRemaining === 1 ? 'tomorrow' : 
                       `in ${reminder.daysRemaining} days`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📅 ${reminder.title}`,
          body: `Payment due ${daysText}: ₹${reminder.amount.toFixed(2)}`,
          data: { 
            type: 'upcoming-due',
            reminderType: reminder.type,
            reminderId: reminder.id,
            screen: reminder.type === 'payment' ? 'payDues' : 'splitExpense'
          },
          sound: 'default',
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: false,
          channelId: this.notificationChannel,
        },
      });

      console.log(`Upcoming due notification scheduled for ${reminder.title}`);
    } catch (error) {
      console.error('Error scheduling upcoming due reminder:', error);
    }
  }

  /**
   * Schedule notifications for all dues within specified days
   */
  async scheduleUpcomingDuesNotifications(upcomingReminders, withinDays = 3) {
    try {
      const duesWithinRange = upcomingReminders.filter(
        r => !r.isOverdue && r.daysRemaining <= withinDays
      );

      for (const reminder of duesWithinRange) {
        await this.scheduleUpcomingDueReminder(reminder);
      }

      console.log(`Scheduled ${duesWithinRange.length} upcoming due notifications`);
    } catch (error) {
      console.error('Error scheduling upcoming dues notifications:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Schedule complete notification suite for reminders
   */
  async scheduleAllReminders(allReminders) {
    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      const overdueReminders = allReminders.filter(r => r.isOverdue);
      const upcomingReminders = allReminders.filter(r => !r.isOverdue);

      // Schedule overdue notifications
      if (overdueReminders.length > 0) {
        await this.scheduleOverdueAlert(overdueReminders);
        await this.scheduleDailyOverdueReminder(overdueReminders.length);
      }

      // Schedule upcoming due notifications (within 3 days)
      await this.scheduleUpcomingDuesNotifications(upcomingReminders, 3);

      const scheduled = await this.getScheduledNotifications();
      console.log(`Total notifications scheduled: ${scheduled.length}`);
      
      return true;
    } catch (error) {
      console.error('Error scheduling all reminders:', error);
      return false;
    }
  }

  /**
   * Clear notification badge
   */
  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
}

export default new NotificationService();
