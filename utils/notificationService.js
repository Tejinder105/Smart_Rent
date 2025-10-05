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
  }

  /**
   * Request notification permissions and setup notification channel
   */
  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(this.notificationChannel, {
          name: 'Smart Rent Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22c55e',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
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
