import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, FileText, Home, Wifi } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const reminders = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const calendarData = {
    month: "November 2023",
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    days: [
      // Week 1
      [null, null, 1, 2, 3, 4, 5],
      // Week 2
      [6, 7, 8, 9, 10, 11, 12],
      // Week 3
      [13, 14, 15, 16, 17, 18, 19],
      // Week 4
      [20, 21, 22, 23, 24, 25, 26],
      // Week 5
      [27, 28, 29, 30, null, null, null]
    ]
  };

  // Days with reminders (blue dots)
  const reminderDays = [21, 28, 29];

  // Sample upcoming reminders data
  const upcomingReminders = [
    {
      id: 1,
      title: "Monthly Rent Payment",
      dueDate: "Due November 28, 2023",
      amount: "$550.00",
      assignedTo: "For You",
      status: "Due Soon",
      icon: Home,
      iconBgColor: "bg-green-100",
      iconColor: "#16a34a"
    },
    {
      id: 2,
      title: "Electricity Bill",
      dueDate: "Due November 30, 2023",
      amount: "$75.20",
      assignedTo: "For Alex",
      status: "Due Soon",
      icon: FileText,
      iconBgColor: "bg-blue-100",
      iconColor: "#3b82f6"
    },
    {
      id: 3,
      title: "Internet Bill",
      dueDate: "Due December 05, 2023",
      amount: "$45.00",
      assignedTo: "For Sarah",
      status: "Upcoming",
      icon: Wifi,
      iconBgColor: "bg-purple-100",
      iconColor: "#8b5cf6"
    }
  ];

  const handlePreviousMonth = () => {
    console.log("Previous month");
  };

  const handleNextMonth = () => {
    console.log("Next month");
  };

  const handleDayPress = (day) => {
    if (day) {
      console.log("Day pressed:", day);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const CalendarDay = ({ day, hasReminder }) => (
    <TouchableOpacity
      onPress={() => handleDayPress(day)}
      className="w-10 h-10 items-center justify-center relative"
      disabled={!day}
    >
      {day && (
        <>
          <Text className="text-gray-900 font-medium">{day}</Text>
          {hasReminder && (
            <View className="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          )}
        </>
      )}
    </TouchableOpacity>
  );

  const ReminderCard = ({ reminder }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 mx-4">
      <View className="flex-row items-center">
        {/* Icon */}
        <View className={`w-12 h-12 ${reminder.iconBgColor} rounded-full items-center justify-center mr-4`}>
          <reminder.icon size={24} color={reminder.iconColor} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {reminder.title}
          </Text>
          <Text className="text-sm text-gray-500 mb-1">
            {reminder.dueDate} • {reminder.amount}
          </Text>
          <Text className="text-sm text-gray-600">
            {reminder.assignedTo}
          </Text>
        </View>

        {/* Status */}
        <View className="items-end">
          <View className={`px-3 py-1 rounded-full ${
            reminder.status === 'Due Soon' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <Text className={`text-xs font-medium ${
              reminder.status === 'Due Soon' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {reminder.status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleGoBack}
            className="mr-4 w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-[26px] font-bold text-gray-900 text-left mr-14">
            Notification
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View className="mx-4 mt-6 mb-6">
          <View className="bg-white rounded-2xl p-6">
            {/* Month Navigation */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity 
                onPress={handlePreviousMonth}
                className="w-10 h-10 items-center justify-center"
              >
                <ChevronLeft size={20} color="#6b7280" />
              </TouchableOpacity>
              
              <Text className="text-lg font-bold text-gray-900">
                {calendarData.month}
              </Text>
              
              <TouchableOpacity 
                onPress={handleNextMonth}
                className="w-10 h-10 items-center justify-center"
              >
                <ChevronRight size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Days of Week Header */}
            <View className="flex-row justify-between mb-4">
              {calendarData.daysOfWeek.map((day, index) => (
                <View key={index} className="w-10 items-center">
                  <Text className="text-sm font-medium text-gray-500">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="space-y-2">
              {calendarData.days.map((week, weekIndex) => (
                <View key={weekIndex} className="flex-row justify-between">
                  {week.map((day, dayIndex) => (
                    <CalendarDay 
                      key={dayIndex} 
                      day={day} 
                      hasReminder={day && reminderDays.includes(day)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Upcoming Reminders */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-900 mx-4 mb-4">
            Upcoming Reminders
          </Text>
          
          {upcomingReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default reminders;