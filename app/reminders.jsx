import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import { AlertCircle, AlertTriangle, Bell, ChevronLeft, Clock, Users } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchParticipantExpenses } from "../store/slices/expenseSlice";
import { fetchOutstandingDues } from "../store/slices/paymentSlice";
import notificationService from "../utils/notificationService";

const reminders = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  const notificationListener = useRef();
  const responseListener = useRef();

  const { outstandingDues, loading: paymentsLoading } = useSelector((state) => state.payment);
  const { participantExpenses, loading: expensesLoading } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const user = userData;

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'overdue', 'upcoming'
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadData();
    setupNotifications();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    // Update badge count and schedule notifications when data changes
    if (notificationsEnabled && allReminders.length > 0) {
      const overdueCount = allReminders.filter(r => r.isOverdue).length;
      notificationService.setBadgeCount(overdueCount);
      notificationService.scheduleAllReminders(allReminders);
    }
  }, [outstandingDues, participantExpenses, notificationsEnabled]);

  const setupNotifications = async () => {
    const hasPermission = await notificationService.requestPermissions();
    setNotificationsEnabled(hasPermission);
    
    if (!hasPermission) {
      Alert.alert(
        'Notifications Disabled',
        'Enable notifications in settings to receive overdue payment reminders.',
        [{ text: 'OK' }]
      );
    }

    setupNotificationListeners();
  };

  const setupNotificationListeners = () => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        router.push(`/${data.screen}`);
      }
    });
  };

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchOutstandingDues()),
      dispatch(fetchParticipantExpenses())
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  // Get days remaining until due date
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Process reminders from payments and expenses
  const processReminders = () => {
    const allReminders = [];

    // Add outstanding personal payments
    outstandingDues?.forEach(payment => {
      if (payment.status === 'pending' && payment.dueDate) {
        const daysRemaining = getDaysRemaining(payment.dueDate);
        allReminders.push({
          id: `payment-${payment._id}`,
          type: 'payment',
          title: payment.title,
          amount: payment.amount,
          dueDate: new Date(payment.dueDate),
          daysRemaining,
          category: payment.type,
          isOverdue: daysRemaining < 0,
          isDueSoon: daysRemaining >= 0 && daysRemaining <= 7,
          data: payment
        });
      }
    });

    // Add unpaid split expenses
    participantExpenses?.forEach(expense => {
      const userParticipant = expense.participants?.find(p => p.userId === user?._id);
      if (userParticipant && !userParticipant.isPaid && expense.dueDate) {
        const daysRemaining = getDaysRemaining(expense.dueDate);
        allReminders.push({
          id: `expense-${expense._id}`,
          type: 'expense',
          title: expense.title,
          amount: userParticipant.amount,
          dueDate: new Date(expense.dueDate),
          daysRemaining,
          category: expense.category,
          isOverdue: daysRemaining < 0,
          isDueSoon: daysRemaining >= 0 && daysRemaining <= 7,
          participantCount: expense.participants?.length || 0,
          data: expense
        });
      }
    });

    // Sort by due date (earliest first)
    return allReminders.sort((a, b) => a.dueDate - b.dueDate);
  };

  const allReminders = processReminders();
  
  // Filter based on active tab
  const filteredReminders = allReminders.filter(reminder => {
    if (activeTab === 'overdue') return reminder.isOverdue;
    if (activeTab === 'upcoming') return !reminder.isOverdue;
    return true; // 'all'
  });

  const overdueCount = allReminders.filter(r => r.isOverdue).length;
  const upcomingCount = allReminders.filter(r => !r.isOverdue).length;

  // Get category icon and color
  const getCategoryStyle = (category) => {
    const styles = {
      rent: { icon: 'home', bgColor: 'bg-green-100', color: '#16a34a' },
      utilities: { icon: 'zap', bgColor: 'bg-blue-100', color: '#3b82f6' },
      groceries: { icon: 'shopping-cart', bgColor: 'bg-orange-100', color: '#f97316' },
      internet: { icon: 'wifi', bgColor: 'bg-purple-100', color: '#8b5cf6' },
      maintenance: { icon: 'wrench', bgColor: 'bg-yellow-100', color: '#eab308' },
      other: { icon: 'file-text', bgColor: 'bg-gray-100', color: '#6b7280' }
    };
    return styles[category?.toLowerCase()] || styles.other;
  };

  const formatDueDate = (daysRemaining, dueDate) => {
    if (daysRemaining < 0) {
      return `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''}`;
    } else if (daysRemaining === 0) {
      return 'Due Today';
    } else if (daysRemaining === 1) {
      return 'Due Tomorrow';
    } else if (daysRemaining <= 7) {
      return `Due in ${daysRemaining} days`;
    } else {
      return `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  const handleReminderPress = (reminder) => {
    if (reminder.type === 'payment') {
      Alert.alert(
        reminder.title,
        `Amount: ₹${reminder.amount}\nDue: ${reminder.dueDate.toLocaleDateString()}\nCategory: ${reminder.category}`,
        [
          { text: 'Dismiss', style: 'cancel' },
          { text: 'Pay Now', onPress: () => router.push('/payDues') }
        ]
      );
    } else {
      Alert.alert(
        reminder.title,
        `Your Share: ₹${reminder.amount}\nDue: ${reminder.dueDate.toLocaleDateString()}\nShared with: ${reminder.participantCount - 1} other${reminder.participantCount - 1 !== 1 ? 's' : ''}`,
        [
          { text: 'Dismiss', style: 'cancel' },
          { text: 'Mark as Paid', onPress: () => router.push('/splitExpense') }
        ]
      );
    }
  };

  const ReminderCard = ({ reminder }) => {
    const categoryStyle = getCategoryStyle(reminder.category);
    
    return (
      <TouchableOpacity 
        onPress={() => handleReminderPress(reminder)}
        className="bg-white rounded-2xl p-4 mb-3 mx-4 border border-gray-100"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Icon */}
          <View className={`w-12 h-12 ${categoryStyle.bgColor} rounded-full items-center justify-center mr-3`}>
            {reminder.isOverdue ? (
              <AlertTriangle size={24} color="#ef4444" />
            ) : (
              <Clock size={24} color={categoryStyle.color} />
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
                {reminder.title}
              </Text>
              {reminder.type === 'expense' && (
                <View className="ml-2">
                  <Users size={14} color="#6b7280" />
                </View>
              )}
            </View>
            
            <Text className="text-sm text-gray-600 mb-1">
              ₹{reminder.amount.toFixed(2)}
            </Text>
            
            <View className="flex-row items-center">
              <Text className={`text-xs font-medium ${
                reminder.isOverdue ? 'text-red-600' : 
                reminder.isDueSoon ? 'text-orange-600' : 
                'text-gray-500'
              }`}>
                {formatDueDate(reminder.daysRemaining, reminder.dueDate)}
              </Text>
              {reminder.type === 'expense' && (
                <Text className="text-xs text-gray-400 ml-2">
                  • Split with {reminder.participantCount - 1} other{reminder.participantCount - 1 !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>

          {/* Status Badge */}
          <View className="ml-2">
            {reminder.isOverdue ? (
              <View className="bg-red-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-bold text-red-700">OVERDUE</Text>
              </View>
            ) : reminder.isDueSoon ? (
              <View className="bg-orange-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-bold text-orange-700">DUE SOON</Text>
              </View>
            ) : (
              <View className="bg-blue-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-bold text-blue-700">UPCOMING</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const loading = paymentsLoading || expensesLoading;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={handleGoBack}
              className="mr-4 w-10 h-10 items-center justify-center"
            >
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-[26px] font-bold text-gray-900">
                Reminders
              </Text>
              <Text className="text-sm text-gray-500">
                {allReminders.length} total reminder{allReminders.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          {overdueCount > 0 && (
            <View className="bg-red-100 px-3 py-1 rounded-full">
              <Text className="text-red-700 font-bold text-sm">{overdueCount} Overdue</Text>
            </View>
          )}
        </View>
      </View>

      {/* Notification Status Banner */}
      {notificationsEnabled && overdueCount > 0 && (
        <View className="mx-4 mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
          <View className="flex-row items-center">
            <Bell size={18} color="#8b5cf6" />
            <Text className="flex-1 text-purple-800 text-sm font-medium ml-2">
              Push notifications enabled for overdue payments
            </Text>
          </View>
        </View>
      )}

      {!notificationsEnabled && (
        <TouchableOpacity 
          onPress={setupNotifications}
          className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <AlertTriangle size={18} color="#f59e0b" />
            <Text className="flex-1 text-amber-800 text-sm font-medium ml-2">
              Enable notifications to get overdue alerts
            </Text>
            <Text className="text-amber-600 text-xs font-bold">TAP</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Summary Cards */}
      {!loading && allReminders.length > 0 && (
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4">
              <View className="flex-row items-center mb-1">
                <AlertCircle size={18} color="#ef4444" />
                <Text className="text-red-600 text-xs font-medium ml-2">Overdue</Text>
              </View>
              <Text className="text-2xl font-bold text-red-700">{overdueCount}</Text>
            </View>

            <View className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-center mb-1">
                <Bell size={18} color="#3b82f6" />
                <Text className="text-blue-600 text-xs font-medium ml-2">Upcoming</Text>
              </View>
              <Text className="text-2xl font-bold text-blue-700">{upcomingCount}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      {!loading && allReminders.length > 0 && (
        <View className="px-4 py-3">
          <View className="flex-row bg-white rounded-xl p-1 border border-gray-200">
            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              className={`flex-1 py-2 rounded-lg ${activeTab === 'all' ? 'bg-green-500' : 'bg-transparent'}`}
            >
              <Text className={`text-center font-semibold ${activeTab === 'all' ? 'text-white' : 'text-gray-600'}`}>
                All ({allReminders.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('overdue')}
              className={`flex-1 py-2 rounded-lg ${activeTab === 'overdue' ? 'bg-red-500' : 'bg-transparent'}`}
            >
              <Text className={`text-center font-semibold ${activeTab === 'overdue' ? 'text-white' : 'text-gray-600'}`}>
                Overdue ({overdueCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('upcoming')}
              className={`flex-1 py-2 rounded-lg ${activeTab === 'upcoming' ? 'bg-blue-500' : 'bg-transparent'}`}
            >
              <Text className={`text-center font-semibold ${activeTab === 'upcoming' ? 'text-white' : 'text-gray-600'}`}>
                Upcoming ({upcomingCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#22c55e" />
            <Text className="mt-2 text-gray-600">Loading reminders...</Text>
          </View>
        ) : filteredReminders.length === 0 ? (
          <View className="bg-green-50 border border-green-200 rounded-xl p-6 mx-4 mt-4 items-center">
            <Bell size={48} color="#22c55e" />
            <Text className="text-green-800 text-lg font-semibold mt-4">
              {activeTab === 'all' ? 'No Reminders' : 
               activeTab === 'overdue' ? 'No Overdue Payments' : 
               'No Upcoming Payments'}
            </Text>
            <Text className="text-green-600 text-center mt-2">
              {activeTab === 'all' ? 'You have no pending payments at the moment' : 
               activeTab === 'overdue' ? 'Great! All your payments are up to date' : 
               'No upcoming payments scheduled'}
            </Text>
          </View>
        ) : (
          <View className="pb-6 pt-2">
            {overdueCount > 0 && activeTab === 'all' && (
              <View className="mb-2">
                <View className="flex-row items-center mx-4 mb-3">
                  <AlertTriangle size={18} color="#ef4444" />
                  <Text className="text-base font-bold text-red-700 ml-2">
                    Overdue ({overdueCount})
                  </Text>
                </View>
                {filteredReminders
                  .filter(r => r.isOverdue)
                  .map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
              </View>
            )}

            {activeTab === 'overdue' && (
              <>
                {filteredReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </>
            )}

            {upcomingCount > 0 && activeTab === 'all' && (
              <View>
                <View className="flex-row items-center mx-4 mb-3 mt-2">
                  <Clock size={18} color="#3b82f6" />
                  <Text className="text-base font-bold text-blue-700 ml-2">
                    Upcoming ({upcomingCount})
                  </Text>
                </View>
                {filteredReminders
                  .filter(r => !r.isOverdue)
                  .map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
              </View>
            )}

            {activeTab === 'upcoming' && (
              <>
                {filteredReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default reminders;