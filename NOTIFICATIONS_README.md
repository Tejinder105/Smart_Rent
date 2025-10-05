# Smart Rent - Push Notifications for Overdues

## 📱 Features Implemented

### 1. **Automatic Overdue Detection**
- Monitors all personal payments and split expenses
- Calculates days remaining until due date
- Automatically identifies overdue payments (negative days)

### 2. **Push Notification System**
The app now sends push notifications for:

#### 🚨 Immediate Overdue Alert
- Triggered when overdues are detected
- Shows count and total amount
- Appears 2 seconds after detection
- High priority notification with sound and vibration

#### ⏰ Daily Overdue Reminders
- Scheduled daily at 9:00 AM
- Reminds about existing overdues
- Repeats until overdues are cleared
- Can be customized in `notificationService.js`

#### 📅 Upcoming Due Reminders
- Notifies 3 days before due date
- Shows payment title and amount
- Scheduled for 9:00 AM on the day
- Helps prevent future overdues

### 3. **Smart Notification Management**

#### Badge Counter
- App icon shows number of overdue payments
- Updates automatically when payments are made
- Clears when all dues are paid

#### Notification Channels (Android)
- Dedicated "Smart Rent Reminders" channel
- Max importance for critical overdue alerts
- Custom vibration pattern
- Green LED light indicator

#### Tap Actions
- Tapping notification opens relevant screen:
  - Personal payments → Pay Dues screen
  - Split expenses → Split Expense screen

### 4. **Permission Handling**
- Requests notification permissions on first launch
- Shows banner if permissions are denied
- Easy re-enable option with tap gesture
- Respects user's notification preferences

### 5. **Visual Indicators**

#### In-App Status
- **Green banner**: Notifications enabled for overdues
- **Amber banner**: Tap to enable notifications
- **Red badge**: Shows overdue count in header

#### Reminder Cards
- 🔴 **OVERDUE**: Red badge for past due
- 🟠 **DUE SOON**: Orange badge for within 7 days
- 🔵 **UPCOMING**: Blue badge for future dates

## 🔧 Technical Implementation

### Files Modified/Created

1. **`app/reminders.jsx`**
   - Integrated expo-notifications
   - Added notification permission handling
   - Connected to notification service
   - Fixed duplicate function declaration
   - Added notification status banners

2. **`utils/notificationService.js`** (NEW)
   - Centralized notification management
   - Reusable notification functions
   - Schedule management
   - Badge counter management
   - Easy to extend and customize

### Key Functions

```javascript
// Request notification permissions
notificationService.requestPermissions()

// Schedule all reminders (overdues + upcoming)
notificationService.scheduleAllReminders(allReminders)

// Schedule immediate overdue alert
notificationService.scheduleOverdueAlert(overdueReminders)

// Schedule daily reminder at 9 AM
notificationService.scheduleDailyOverdueReminder(count)

// Update app badge with overdue count
notificationService.setBadgeCount(overdueCount)

// Cancel all notifications
notificationService.cancelAllNotifications()
```

## 📦 Dependencies Required

Add to `package.json`:
```json
{
  "dependencies": {
    "expo-notifications": "~0.28.0"
  }
}
```

Install with:
```bash
npm install expo-notifications
# or
npx expo install expo-notifications
```

## 🎯 Notification Triggers

| Event | Notification | Schedule |
|-------|-------------|----------|
| Overdue detected | Immediate alert | 2 seconds |
| Daily reminder | Morning reminder | 9:00 AM daily |
| 3 days before due | Upcoming due alert | 9:00 AM once |
| App opened | Badge update | Real-time |

## 🔔 Notification Content Examples

### Overdue Alert
```
Title: 🚨 Overdue Payments!
Body: You have 2 overdue payments totaling ₹1,250.00
```

### Daily Reminder
```
Title: ⏰ Payment Reminder
Body: Don't forget! You have 2 overdue payments waiting
```

### Upcoming Due
```
Title: 📅 Monthly Rent
Body: Payment due tomorrow: ₹550.00
```

## ⚙️ Customization

### Change Notification Time
Edit in `utils/notificationService.js`:
```javascript
async scheduleDailyOverdueReminder(count, hour = 10, minute = 30) {
  // Now sends at 10:30 AM instead of 9:00 AM
}
```

### Change Upcoming Due Threshold
Edit in `utils/notificationService.js`:
```javascript
async scheduleUpcomingDuesNotifications(reminders, withinDays = 5) {
  // Now notifies 5 days before instead of 3
}
```

### Custom Notification Sound
Edit in `utils/notificationService.js`:
```javascript
sound: 'custom_sound.wav',  // Place in assets folder
```

## 🧪 Testing

### Test Overdue Notifications
1. Create a payment with past due date
2. Navigate to Reminders screen
3. Check for immediate notification
4. Verify badge count updates

### Test Daily Reminders
1. Keep an overdue payment
2. Wait until 9:00 AM next day
3. Should receive daily reminder
4. Repeats each day until paid

### Test Upcoming Due Notifications
1. Create payment due in 2 days
2. Wait until 9:00 AM
3. Should receive upcoming due alert

## 📱 Platform Support

- ✅ **Android**: Full support with custom channels
- ✅ **iOS**: Full support (requires physical device)
- ⚠️ **Expo Go**: Limited (use development build)

## 🐛 Troubleshooting

### Notifications Not Showing
1. Check app permissions in device settings
2. Verify `notificationsEnabled` state is true
3. Check console logs for scheduling errors
4. Ensure due dates are set on payments

### Badge Not Updating
1. iOS: Check Settings > Notifications > Smart Rent > Badges
2. Android: Check notification channel settings
3. Call `notificationService.setBadgeCount()` manually

### Daily Reminders Not Working
1. Verify time zone settings
2. Check scheduled notifications: `getScheduledNotifications()`
3. Ensure app has background refresh enabled

## 🚀 Future Enhancements

- [ ] Custom notification sound
- [ ] Snooze functionality
- [ ] Notification scheduling preferences
- [ ] Weekly summary notifications
- [ ] Push notifications for flatmate activities
- [ ] In-app notification history

## 📄 License

Part of Smart Rent application - Expense tracking and payment management for flatmates.
