import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import { AlertCircle, AlertTriangle, Bell, Check, ChevronLeft, Clock, DollarSign, FileText, Users } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, EmptyState, PageHeader, SectionTitle, StatCard } from '../components/ui';
import { fetchParticipantExpenses } from "../store/slices/expenseSlice";
import { fetchOutstandingDues } from "../store/slices/paymentSlice";
// New notification API integration
import { fetchUserDues } from "../store/slices/billSlice";
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead } from "../store/slices/notificationSlice";
import notificationService from "../utils/notificationService";

const reminders = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const notificationListener = useRef();
  const responseListener = useRef();

  const { outstandingDues, loading: paymentsLoading } = useSelector((state) => state.payment);
  const { participantExpenses, loading: expensesLoading } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const { currentFlat } = useSelector((state) => state.flat);
  // New: Backend notifications
  const { notifications: backendNotifications, unreadCount, loading: notifLoading } = useSelector((state) => state.notification);
  const { userDues, loading: duesLoading } = useSelector((state) => state.bill);
  
  const user = userData;

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showBackendNotifs, setShowBackendNotifs] = useState(true); // Toggle between backend/local

  useEffect(() => {
    loadData();
    setupNotifications();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
   
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
    // Load both legacy and new data
    await Promise.all([
      // Legacy data
      dispatch(fetchOutstandingDues()),
      dispatch(fetchParticipantExpenses()),
      // New backend notifications and dues
      dispatch(fetchNotifications()),
      dispatch(fetchUnreadCount()),
      currentFlat?._id && dispatch(fetchUserDues())
    ].filter(Boolean));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const processReminders = () => {
    const allReminders = [];

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

    return allReminders.sort((a, b) => a.dueDate - b.dueDate);
  };

  const allReminders = processReminders();
  
  const filteredReminders = allReminders.filter(reminder => {
    if (activeTab === 'overdue') return reminder.isOverdue;
    if (activeTab === 'upcoming') return !reminder.isOverdue;
    return true; // 'all'
  });

  const overdueCount = allReminders.filter(r => r.isOverdue).length;
  const upcomingCount = allReminders.filter(r => !r.isOverdue).length;

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
      <Card 
        variant="interactive"
        onPress={() => handleReminderPress(reminder)}
        className="mb-3 mx-4"
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
                reminder.isOverdue ? 'text-danger-600' : 
                reminder.isDueSoon ? 'text-warning-600' : 
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
              <View className="bg-danger-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-bold text-danger-700">OVERDUE</Text>
              </View>
            ) : reminder.isDueSoon ? (
              <View className="bg-warning-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-bold text-warning-700">DUE SOON</Text>
              </View>
            ) : (
              <View className="bg-primary-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-bold text-primary-700">UPCOMING</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const loading = paymentsLoading || expensesLoading;

  return (
    <View className="flex-1 bg-gray-50">
      <PageHeader
        title="Reminders"
        subtitle={
          showBackendNotifs 
            ? `${backendNotifications?.length || 0} notification${backendNotifications?.length !== 1 ? 's' : ''}${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`
            : `${allReminders.length} reminder${allReminders.length !== 1 ? 's' : ''}`
        }
        leftAction={
          <Button
            variant="ghost"
            size="sm"
            onPress={handleGoBack}
            leftIcon={<ChevronLeft size={24} color="#374151" />}
          />
        }
        rightAction={
          <View className="flex-row items-center gap-2">
            <Button
              variant={showBackendNotifs ? "primary" : "ghost"}
              size="sm"
              onPress={() => setShowBackendNotifs(!showBackendNotifs)}
              className={showBackendNotifs ? "" : "bg-gray-200"}
            >
              <Text className={`text-sm font-semibold ${showBackendNotifs ? 'text-white' : 'text-gray-700'}`}>
                {showBackendNotifs ? 'Notifications' : 'Local'}
              </Text>
            </Button>
            {overdueCount > 0 && !showBackendNotifs && (
              <View className="bg-danger-100 px-3 py-1 rounded-full">
                <Text className="text-danger-700 font-bold text-sm">{overdueCount} Overdue</Text>
              </View>
            )}
          </View>
        }
      />

      {/* Notification Status Banner */}
      {notificationsEnabled && overdueCount > 0 && (
        <Card variant="outline" className="mx-4 mt-3 bg-purple-50 border-purple-200">
          <View className="flex-row items-center">
            <Bell size={18} color="#8b5cf6" />
            <Text className="flex-1 text-purple-800 text-sm font-medium ml-2">
              Push notifications enabled for overdue payments
            </Text>
          </View>
        </Card>
      )}

      {!notificationsEnabled && (
        <Card 
          variant="interactive"
          onPress={setupNotifications}
          className="mx-4 mt-3 bg-warning-50 border-warning-200"
        >
          <View className="flex-row items-center">
            <AlertTriangle size={18} color="#f59e0b" />
            <Text className="flex-1 text-warning-800 text-sm font-medium ml-2">
              Enable notifications to get overdue alerts
            </Text>
            <Text className="text-warning-600 text-xs font-bold">TAP</Text>
          </View>
        </Card>
      )}

      {/* Summary Cards - Only for Local Reminders */}
      {!loading && !showBackendNotifs && allReminders.length > 0 && (
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row gap-3">
            <StatCard
              label="Overdue"
              value={overdueCount}
              variant="danger"
              icon={<AlertCircle size={18} color="#ef4444" />}
              className="flex-1"
            />
            <StatCard
              label="Upcoming"
              value={upcomingCount}
              variant="primary"
              icon={<Bell size={18} color="#3b82f6" />}
              className="flex-1"
            />
          </View>
        </View>
      )}

      {/* Filter Tabs - Only for Local Reminders */}
      {!loading && !showBackendNotifs && allReminders.length > 0 && (
        <View className="px-4 py-3">
          <View className="flex-row bg-white rounded-xl p-1 border border-gray-200">
            <Button
              variant={activeTab === 'all' ? 'success' : 'ghost'}
              size="md"
              onPress={() => setActiveTab('all')}
              className="flex-1"
            >
              <Text className={`text-center font-semibold ${activeTab === 'all' ? 'text-white' : 'text-gray-600'}`}>
                All ({allReminders.length})
              </Text>
            </Button>

            <Button
              variant={activeTab === 'overdue' ? 'danger' : 'ghost'}
              size="md"
              onPress={() => setActiveTab('overdue')}
              className="flex-1"
            >
              <Text className={`text-center font-semibold ${activeTab === 'overdue' ? 'text-white' : 'text-gray-600'}`}>
                Overdue ({overdueCount})
              </Text>
            </Button>

            <Button
              variant={activeTab === 'upcoming' ? 'primary' : 'ghost'}
              size="md"
              onPress={() => setActiveTab('upcoming')}
              className="flex-1"
            >
              <Text className={`text-center font-semibold ${activeTab === 'upcoming' ? 'text-white' : 'text-gray-600'}`}>
                Upcoming ({upcomingCount})
              </Text>
            </Button>
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
          <Card className="mx-4 mt-4 items-center py-12">
            <ActivityIndicator size="large" color="#00C471" />
            <Text className="mt-2 text-gray-600">Loading...</Text>
          </Card>
        ) : showBackendNotifs ? (
          // Backend Notifications View
          <View className="pb-6 pt-4">
            {notifLoading && backendNotifications.length === 0 ? (
              <Card className="mx-4 items-center py-12">
                <ActivityIndicator size="large" color="#00C471" />
                <Text className="mt-2 text-gray-600">Loading notifications...</Text>
              </Card>
            ) : backendNotifications.length === 0 ? (
              <EmptyState
                icon={<Bell size={48} color="#3b82f6" />}
                title="No Notifications"
                message="You're all caught up! Backend notifications will appear here."
                className="mx-4"
              />
            ) : (
              backendNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  variant="interactive"
                  onPress={() => {
                    if (!notification.read) {
                      dispatch(markNotificationAsRead(notification._id));
                    }
                  }}
                  className={`mx-4 mb-3 ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-primary-300 shadow-sm'
                  }`}
                >
                  <View className="flex-row items-start">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                      notification.type === 'bill_due' || notification.type === 'bill_overdue' ? 'bg-danger-100' :
                      notification.type === 'payment_reminder' ? 'bg-warning-100' :
                      notification.type === 'payment_received' ? 'bg-success-100' :
                      notification.type === 'bill_created' ? 'bg-primary-100' :
                      notification.type === 'expense_created' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      {(notification.type === 'bill_due' || notification.type === 'bill_overdue') && <AlertCircle size={20} color="#ef4444" />}
                      {notification.type === 'payment_reminder' && <Clock size={20} color="#f59e0b" />}
                      {notification.type === 'payment_received' && <Check size={20} color="#00C471" />}
                      {notification.type === 'bill_created' && <FileText size={20} color="#3b82f6" />}
                      {notification.type === 'expense_created' && <DollarSign size={20} color="#8b5cf6" />}
                      {!['bill_due', 'bill_overdue', 'payment_reminder', 'payment_received', 'bill_created', 'expense_created'].includes(notification.type) && 
                        <Bell size={20} color="#6b7280" />}
                    </View>
                    
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className={`text-sm font-bold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View className="w-2 h-2 rounded-full bg-primary-500" />
                        )}
                      </View>
                      
                      <Text className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                        {notification.message}
                      </Text>
                      
                      {notification.payload && notification.payload.amount && (
                        <View className="bg-gray-100 px-3 py-1 rounded-lg self-start mb-2">
                          <Text className="text-gray-800 font-bold">
                            ₹{notification.payload.amount}
                          </Text>
                        </View>
                      )}
                      
                      <Text className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        ) : filteredReminders.length === 0 ? (
          // Local Reminders Empty State
          <EmptyState
            icon={<Bell size={48} color="#00C471" />}
            title={
              activeTab === 'all' ? 'No Reminders' : 
              activeTab === 'overdue' ? 'No Overdue Payments' : 
              'No Upcoming Payments'
            }
            message={
              activeTab === 'all' ? 'You have no pending payments at the moment' : 
              activeTab === 'overdue' ? 'Great! All your payments are up to date' : 
              'No upcoming payments scheduled'
            }
            className="mx-4 mt-4"
          />
        ) : (
          <View className="pb-6 pt-2">
            {overdueCount > 0 && activeTab === 'all' && (
              <View className="mb-2">
                <SectionTitle
                  title={`Overdue (${overdueCount})`}
                  variant="compact"
                  icon={<AlertTriangle size={18} color="#ef4444" />}
                  className="mx-4 mb-3"
                />
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
                <SectionTitle
                  title={`Upcoming (${upcomingCount})`}
                  variant="compact"
                  icon={<Clock size={18} color="#3b82f6" />}
                  className="mx-4 mb-3 mt-2"
                />
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