import { useRouter } from "expo-router";
import { Bell, Home, Key, UserPlus, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchExpenseStats, fetchFlatExpenses } from "../../store/slices/expenseSlice";
import { fetchFlatMembers, fetchUserFlat } from "../../store/slices/flatSlice";

const flatmates = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentFlat, flatMembers, loading: flatLoading, userRole } = useSelector((state) => state.flat);
  const { expenses, stats, loading: expenseLoading } = useSelector((state) => state.expense);
  
  const [showCreateJoinOptions, setShowCreateJoinOptions] = useState(false);
  
  useEffect(() => {
    dispatch(fetchUserFlat());
  }, [dispatch]);
  
  useEffect(() => {
    if (currentFlat) {
      dispatch(fetchFlatMembers(currentFlat._id));
      dispatch(fetchFlatExpenses({ status: 'active' }));
      dispatch(fetchExpenseStats());
    } else {
      setShowCreateJoinOptions(true);
    }
  }, [currentFlat, dispatch]);

  // Debug: Log expenses when they change
  useEffect(() => {
    if (expenses && expenses.length > 0) {
      console.log('📊 Flatmates - Total expenses loaded:', expenses.length);
      expenses.forEach(exp => {
        console.log('  - Expense:', exp.title, '| Participants:', exp.participants?.length);
      });
    }
  }, [expenses]);
  
  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  const handleAddFlatmate = () => {
    if (currentFlat) {
      router.push("/addFlatmate");
    }
  };

  const handleCreateFlat = () => {
    router.push("/createFlat");
  };

  const handleJoinFlat = () => {
    router.push("/joinFlat");
  };

  // Calculate total expenses for the flat from real expense data
  const calculateTotalFlatExpenses = () => {
    if (!expenses || expenses.length === 0) return 0;
    return expenses.reduce((total, expense) => {
      return total + (expense.totalAmount || 0);
    }, 0);
  };

  // Calculate total paid amount across all expenses
  const calculateTotalPaidAmount = () => {
    if (!expenses || expenses.length === 0) return 0;
    return expenses.reduce((total, expense) => {
      const paidAmount = expense.participants?.reduce((sum, p) => {
        return sum + (p.isPaid ? p.amount : 0);
      }, 0) || 0;
      return total + paidAmount;
    }, 0);
  };

  // Calculate individual member's contribution from expenses
  const calculateMemberContribution = (memberId) => {
    console.log('\n🔍 Calculating contribution for member ID:', memberId);
    
    if (!expenses || expenses.length === 0) {
      console.log('⚠️ No expenses available');
      return 0;
    }
    
    console.log('📊 Total expenses to check:', expenses.length);
    
    let totalContribution = 0;
    let participationCount = 0;
    
    expenses.forEach((expense, index) => {
      console.log(`\n  Expense ${index + 1}: "${expense.title}"`);
      console.log('    Participants:', expense.participants?.length || 0);
      
      if (expense.participants && expense.participants.length > 0) {
        expense.participants.forEach(p => {
          const participantId = p.userId?._id || p.userId;
          console.log('      - Participant ID:', participantId, '| Name:', p.name || p.userId?.userName);
        });
      }
      
      // Check all participants in each expense
      const participant = expense.participants?.find(p => {
        const participantId = p.userId?._id || p.userId;
        const match = participantId?.toString() === memberId?.toString();
        if (match) {
          console.log('      ✅ MATCH FOUND!');
        }
        return match;
      });
      
      if (participant) {
        participationCount++;
        totalContribution += participant.amount || 0;
        console.log(`    ✓ Member participated: ₹${participant.amount}`);
      } else {
        console.log('    ✗ Member NOT a participant');
      }
    });
    
    console.log(`\n💰 FINAL Total for member: ₹${totalContribution} (${participationCount} expenses)\n`);
    return totalContribution;
  };

  const totalFlatExpenses = calculateTotalFlatExpenses();
  const totalPaidAmount = calculateTotalPaidAmount();

  const CreateJoinOptions = () => (
    <View className="flex-1 justify-center p-6">
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
          <Users size={40} color="white" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center">
          Get Started with Smart Rent
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Create a new flat or join an existing one to start managing expenses
        </Text>
      </View>

      <View className="space-y-4">
        <TouchableOpacity
          onPress={handleCreateFlat}
          className="bg-green-500 rounded-2xl py-4 flex-row items-center justify-center"
        >
          <Home size={20} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">
            Create New Flat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleJoinFlat}
          className="bg-blue-500 rounded-2xl py-4 flex-row items-center justify-center"
        >
          <Key size={20} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">
            Join Existing Flat
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <Text className="text-blue-800 font-medium text-sm text-center">
          Create a flat to become the admin, or join using a 6-digit join code shared by your flatmate
        </Text>
      </View>
    </View>
  );

  const FlatInfoHeader = () => (
    <View className="bg-white mx-4 rounded-2xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{currentFlat?.name}</Text>
          <Text className="text-sm text-gray-500">Join Code: {currentFlat?.joinCode}</Text>
          {currentFlat?.rent && (
            <Text className="text-sm font-semibold text-green-600 mt-1">Monthly Rent: ₹{currentFlat.rent}</Text>
          )}
        </View>
        <View className={`px-3 py-1 rounded-full ${
          userRole === 'admin' ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          <Text className={`text-xs font-medium ${
            userRole === 'admin' ? 'text-green-700' : 'text-blue-700'
          }`}>
            {userRole === 'admin' ? 'Admin' : 'Member'}
          </Text>
        </View>
      </View>
      
      <View className="flex-row justify-between">
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-900">{flatMembers?.length || 0}</Text>
          <Text className="text-xs text-gray-500">Members</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-900">₹{totalFlatExpenses.toFixed(0)}</Text>
          <Text className="text-xs text-gray-500">Total Expenses</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-900">₹{totalPaidAmount.toFixed(0)}</Text>
          <Text className="text-xs text-gray-500">Total Paid</Text>
        </View>
      </View>
    </View>
  );

  const FlatmateCard = ({ member }) => {
    const isActive = member.status === 'active';
    const displayRole = member.role?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Flatmate';
    const isCurrentUser = userRole && member.role === userRole && member.name === currentFlat?.admin?.userName;
    
    return (
      <View className="bg-white rounded-2xl p-4 mb-4 mx-4">
        {/* Profile Section */}
        <View className="flex-row items-center mb-4">
          <View className="relative">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
              isCurrentUser ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              <Text className={`font-semibold text-lg ${
                isCurrentUser ? 'text-white' : 'text-gray-600'
              }`}>
                {member.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            {/* Online status indicator */}
            {isActive && (
              <View className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {member.name} {isCurrentUser && '(You)'}
            </Text>
            <Text className="text-sm text-gray-500">
              {displayRole}
            </Text>
            {member.email && (
              <Text className="text-xs text-gray-400">
                {member.email}
              </Text>
            )}
          </View>
  
          {/* Status Badge */}
          <View className={`px-3 py-1 rounded-full ${
            isActive ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Text className={`text-xs font-medium ${
              isActive ? 'text-green-700' : 'text-red-700'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
  
        {/* Expense Contribution */}
        <View className="flex-row items-center justify-between px-2">
          <Text className="text-sm text-gray-500">Total Expenses</Text>
          <Text className="text-xl font-bold text-gray-900">
            ₹{calculateMemberContribution(member._id).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[26px] pl-2 font-bold text-gray-900 text-left">
              {currentFlat ? 'Flatmates' : 'Smart Rent'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleNotificationPress}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm border border-gray-100"
          >
            <Bell size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading State */}
      {flatLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Loading...</Text>
        </View>
      )}

      {/* No Flat - Show Create/Join Options */}
      {!flatLoading && !currentFlat && showCreateJoinOptions && (
        <CreateJoinOptions />
      )}

      {/* Has Flat - Show Flatmates */}
      {!flatLoading && currentFlat && (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Flat Info Header */}
          <FlatInfoHeader />

          {/* Add New Flatmate Button (Admin Only) */}
          {userRole === 'admin' && (
            <View className="px-4 mb-4">
              <TouchableOpacity
                onPress={handleAddFlatmate}
                className="bg-green-500 rounded-2xl py-4 flex-row items-center justify-center"
              >
                <UserPlus size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Add New Flatmate
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Flatmates List */}
          <View className="pb-6">
            {flatMembers && flatMembers.length > 0 ? (
              <>
                {console.log('👥 Rendering flatmates:', flatMembers.map(m => ({ id: m._id, name: m.name })))}
                {flatMembers.map((member) => (
                  <FlatmateCard key={member._id} member={member} />
                ))}
              </>
            ) : (
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-6 mx-4 items-center">
                <Text className="text-blue-800 text-lg font-semibold">No Members Found</Text>
                <Text className="text-blue-600 text-center mt-2">
                  {userRole === 'admin' ? 'Add your first flatmate to get started!' : 'Waiting for other members to join...'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default flatmates;
