# Quick Setup Guide - Push Notifications

## ✅ Installation Complete!

The push notification system has been successfully installed and configured.

## 🎉 What's Working Now

### 1. **Automatic Overdue Detection**
- App monitors all your payments and split expenses
- Calculates days remaining until due date
- Identifies overdue items automatically

### 2. **Smart Push Notifications**
- **Immediate Alert**: When overdues are detected
- **Daily Reminders**: Every morning at 9 AM for overdues
- **Upcoming Dues**: 3 days before payment is due
- **Badge Counter**: App icon shows overdue count

### 3. **Fixed Issues**
- ✅ Removed duplicate `handleReminderPress` function
- ✅ Added notification service utility
- ✅ Integrated expo-notifications package
- ✅ Added permission handling with UI feedback

## 📱 How to Use

### First Time Setup
1. Open the app and navigate to **Reminders** screen
2. Tap the **amber banner** to enable notifications
3. Grant permission when prompted
4. Notifications are now active!

### Daily Usage
- **Green banner** = Notifications enabled ✅
- **Amber banner** = Tap to enable notifications ⚠️
- **Red badge** in header = Number of overdues 🔴

### Notification Actions
- **Tap notification** → Opens relevant screen
  - Personal payments → Pay Dues
  - Split expenses → Split Expense

## 🔔 Notification Schedule

| Type | When | Frequency |
|------|------|-----------|
| Overdue Alert | Immediately when detected | Once |
| Daily Reminder | 9:00 AM | Daily (until paid) |
| Upcoming Due | 9:00 AM, 3 days before | Once |

## 🧪 Test It Out!

### Test Overdue Notifications
1. Go to **Pay Dues** screen
2. Create a payment with yesterday's date
3. Go to **Reminders** screen
4. You should see notification within 2 seconds! 🔔

### Check Scheduled Notifications
Look at console logs for:
```
✅ Overdue notification scheduled
✅ Daily reminder scheduled for 9:0
✅ Total notifications scheduled: X
```

## ⚙️ Customization

Want to change notification times? Edit `utils/notificationService.js`:

```javascript
// Change daily reminder time to 10:30 AM
async scheduleDailyOverdueReminder(count, hour = 10, minute = 30) {
  ...
}

// Change upcoming due alert to 5 days before
async scheduleUpcomingDuesNotifications(reminders, withinDays = 5) {
  ...
}
```

## 🎯 What Triggers Notifications

1. **Overdue Payments**
   - Any payment with due date in the past
   - Any split expense unpaid past due date

2. **Upcoming Dues**
   - Payments due within 3 days
   - Split expenses due within 3 days

3. **Badge Updates**
   - App icon badge shows overdue count
   - Updates in real-time when payments made

## 📲 Platform Notes

### Android
- ✅ Full notification support
- ✅ Custom notification channel
- ✅ Vibration pattern
- ✅ LED light indicator
- ✅ Badge counter

### iOS
- ✅ Full notification support
- ✅ Badge counter
- ⚠️ Requires physical device (not simulator)
- ⚠️ Cannot test in Expo Go (need dev build)

## 🐛 Troubleshooting

### "Notifications Disabled" Message
**Solution**: 
1. Go to device Settings
2. Find Smart Rent app
3. Enable notifications
4. Restart the app

### Not Receiving Notifications
**Check**:
1. App has notification permission ✅
2. Green banner visible in Reminders screen ✅
3. Payments have due dates set ✅
4. Check device "Do Not Disturb" mode ⚠️

### Badge Not Showing
**iOS**: Settings → Notifications → Smart Rent → Enable Badges
**Android**: Long-press app icon → App Info → Notifications → Allow badges

## 📚 Documentation

For detailed technical docs, see: `NOTIFICATIONS_README.md`

## 🎊 You're All Set!

Push notifications are now active and will help you never miss a payment deadline again!

**Next Steps:**
1. Create some test payments with due dates
2. Navigate to Reminders screen to see them
3. Enable notifications when prompted
4. Watch for alerts when overdues appear

---

**Need Help?** Check the console logs for detailed notification scheduling info.
