import { useRouter } from 'expo-router';
import {
    Calculator,
    CheckCircle,
    ChevronLeft,
    Sparkles
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { createSplitExpense, fetchAvailableFlatmates } from '../store/slices/expenseSlice';
// Backend Bill API integration
import { createBill } from '../store/slices/billSlice';

const splitExpense = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { availableFlatmates, loading, error } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const { currentFlat } = useSelector((state) => state.flat);
  const { loading: billLoading } = useSelector((state) => state.bill);
  const currentUser = userData;
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('groceries');
  const [selectedFlatmates, setSelectedFlatmates] = useState([]);
  const [creating, setCreating] = useState(false);
  const [useBackendBill, setUseBackendBill] = useState(true); // Toggle for backend bill creation
  const [dueDate, setDueDate] = useState(''); // For backend bills

  useEffect(() => {
    dispatch(fetchAvailableFlatmates());
  }, [dispatch]);

  // Debug: Log available flatmates when they load
  useEffect(() => {
    if (availableFlatmates && availableFlatmates.length > 0) {
      console.log('👥 Available flatmates loaded:', availableFlatmates.map(f => ({
        name: f.name,
        _id: f._id,
        isCurrentUser: f.isCurrentUser
      })));
    }
  }, [availableFlatmates]);

  // Expense categories
  const categories = [
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: 'bg-green-100' },
    { id: 'utilities', name: 'Utilities', icon: '⚡', color: 'bg-yellow-100' },
    { id: 'internet', name: 'Internet', icon: '📶', color: 'bg-blue-100' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧽', color: 'bg-purple-100' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧', color: 'bg-orange-100' },
    { id: 'furniture', name: 'Furniture', icon: '🪑', color: 'bg-pink-100' },
    { id: 'other', name: 'Other', icon: '📋', color: 'bg-gray-100' }
  ];

  const handleGoBack = () => {
    router.back();
  };

  const toggleFlatmate = (flatmateId) => {
    setSelectedFlatmates(prev => 
      prev.includes(flatmateId)
        ? prev.filter(id => id !== flatmateId)
        : [...prev, flatmateId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFlatmates.length === availableFlatmates.length) {
      // Deselect all
      setSelectedFlatmates([]);
    } else {
      // Select all
      const allIds = availableFlatmates.map(f => f._id || f.userId?._id);
      setSelectedFlatmates(allIds);
    }
  };

  const calculateSplit = () => {
    const totalAmount = parseFloat(amount) || 0;
    const participantCount = selectedFlatmates.length;
    
    if (participantCount === 0) return 0;
    
    // Always split equally
    return (totalAmount / participantCount).toFixed(2);
  };

  const handleCreateExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (selectedFlatmates.length === 0) {
      Alert.alert('Error', 'Please select at least one participant');
      return;
    }

    if (useBackendBill && !dueDate) {
      Alert.alert('Error', 'Please select a due date for the bill');
      return;
    }

    const totalAmount = parseFloat(amount);
    const splitAmount = calculateSplit();
    
    // Filter participants
    const participants = availableFlatmates.filter(f => 
      selectedFlatmates.includes(f._id?.toString?.() || f._id)
    );

    Alert.alert(
      'Confirm Expense',
      `${useBackendBill ? 'Create bill' : 'Split expense'} of ₹${totalAmount} among ${participants.length} people (₹${splitAmount} each)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          style: 'default',
          onPress: async () => {
            setCreating(true);
            try {
              if (useBackendBill) {
                // Use backend bill API
                const billData = {
                  title: description,
                  description: description,
                  totalAmount: totalAmount,
                  category: selectedCategory,
                  dueDate: dueDate,
                  splitMethod: 'equal',
                  participants: participants.map(p => ({
                    userId: p._id,
                    name: p.name || p.userName || 'Unknown'
                  })),
                  vendor: 'Manual Entry'
                };
                
                await dispatch(createBill(billData)).unwrap();
                
                Alert.alert(
                  'Bill Created!',
                  `₹${totalAmount} bill created successfully. Each person owes ₹${splitAmount}. Notifications sent to all participants.`,
                  [{
                    text: 'OK',
                    onPress: () => {
                      setAmount('');
                      setDescription('');
                      setSelectedFlatmates([]);
                      setDueDate('');
                      router.back();
                    }
                  }]
                );
              } else {
                // Legacy split expense
                const participantsData = participants.map(p => ({
                  userId: p._id,
                  name: p.name
                }));

                const expenseData = {
                  title: description,
                  description: description,
                  totalAmount: totalAmount,
                  category: selectedCategory,
                  splitMethod: 'equal', // Always equal split
                  participants: participantsData
                };
                
                await dispatch(createSplitExpense(expenseData)).unwrap();
                
                Alert.alert(
                  'Expense Created!',
                  `₹${totalAmount} expense split successfully. Each person owes ₹${splitAmount}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setAmount('');
                        setDescription('');
                        setSelectedFlatmates([]);
                        setDueDate('');
                        router.back();
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('❌ Error creating expense:', error);
              Alert.alert('Error', error || 'Failed to create expense');
            } finally {
              setCreating(false);
            }
          }
        }
      ]
    );
  };

  const CategoryCard = ({ category, isSelected, onSelect }) => (
    <TouchableOpacity
      onPress={() => onSelect(category.id)}
      className={`${category.color} rounded-xl p-4 mr-3 mb-3 min-w-[100px] border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent'
      }`}
    >
      <Text className="text-2xl text-center mb-1">{category.icon}</Text>
      <Text className="text-sm font-medium text-gray-700 text-center">{category.name}</Text>
      {isSelected && (
        <View className="absolute -top-1 -right-1">
          <CheckCircle size={20} color="#22c55e" />
        </View>
      )}
    </TouchableOpacity>
  );

  const FlatmateCard = ({ flatmate, isSelected, onToggle }) => {
    const flatmateId = flatmate._id;
    const flatmateName = flatmate.name;
    const isCurrentUser = flatmate.isCurrentUser;
    
    return (
      <TouchableOpacity
        onPress={() => onToggle(flatmateId)}
        className="bg-white rounded-xl p-3 mb-3 border border-gray-200"
      >
        <View className="flex-row items-center">
          {/* Checkbox */}
          <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
          }`}>
            {isSelected && <CheckCircle size={14} color="#fff" />}
          </View>
          
          {/* Avatar */}
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            isCurrentUser ? 'bg-blue-500' : 'bg-gray-400'
          }`}>
            <Text className="text-white font-bold text-sm">
              {flatmateName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          {/* Name */}
          <Text className="flex-1 text-base font-medium text-gray-700">
            {isCurrentUser ? `${flatmateName} (You)` : flatmateName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const splitAmount = calculateSplit();
  const totalAmount = parseFloat(amount) || 0;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-6 bg-white" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleGoBack}
            className="mr-4 w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-gray-900 text-center mr-14">
            Split Expense
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Backend Bill Toggle */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-2 flex-row">
          <TouchableOpacity 
            onPress={() => setUseBackendBill(true)}
            className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${useBackendBill ? 'bg-blue-500' : 'bg-transparent'}`}
          >
            <Sparkles size={16} color={useBackendBill ? '#fff' : '#6b7280'} />
            <Text className={`font-semibold ml-2 ${useBackendBill ? 'text-white' : 'text-gray-600'}`}>
              Create Bill
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setUseBackendBill(false)}
            className={`flex-1 py-2 rounded-xl ${!useBackendBill ? 'bg-gray-500' : 'bg-transparent'}`}
          >
            <Text className={`text-center font-semibold ${!useBackendBill ? 'text-white' : 'text-gray-600'}`}>
              Split Expense
            </Text>
          </TouchableOpacity>
        </View>

        {useBackendBill && (
          <View className="mx-4 mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <View className="flex-row items-center">
              <Sparkles size={18} color="#3b82f6" />
              <Text className="flex-1 text-blue-800 text-sm font-medium ml-2">
                Creating a bill will send notifications to all participants and track due dates
              </Text>
            </View>
          </View>
        )}

        {/* Amount Input */}
        <View className="mx-4 mt-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Amount</Text>
          <View className="bg-white rounded-2xl p-6">
            <View className="flex-row items-center">
              <Text className="text-3xl font-bold text-gray-400 mr-2">₹</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="text-3xl font-bold text-gray-900 flex-1"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Description</Text>
          <View className="bg-white rounded-2xl p-4">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What was this expense for?"
              className="text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>
        </View>

        {/* Due Date (only for backend bills) */}
        {useBackendBill && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Due Date</Text>
            <View className="bg-white rounded-2xl p-4">
              <TextInput
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                className="text-gray-900 text-base"
                placeholderTextColor="#9ca3af"
              />
              <Text className="text-xs text-gray-500 mt-2">
                Format: YYYY-MM-DD (e.g., 2024-12-31)
              </Text>
            </View>
          </View>
        )}

        {/* Category Selection */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onSelect={setSelectedCategory}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Flatmates Selection */}
        <View className="mx-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Select Flatmates</Text>
            
            {/* Select All Checkbox */}
            <TouchableOpacity
              onPress={toggleSelectAll}
              className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-gray-200"
            >
              <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-2 ${
                selectedFlatmates.length === availableFlatmates.length && availableFlatmates.length > 0
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedFlatmates.length === availableFlatmates.length && availableFlatmates.length > 0 && (
                  <CheckCircle size={12} color="#fff" />
                )}
              </View>
              <Text className="text-sm font-medium text-gray-700">Select All</Text>
            </TouchableOpacity>
          </View>
          
          {loading && (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-2 text-gray-600">Loading flatmates...</Text>
            </View>
          )}
          
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-800 text-center">{error}</Text>
            </View>
          )}
          
          {!loading && !error && (
            <View className="bg-white rounded-xl p-2">
              {availableFlatmates.map((flatmate) => {
                const flatmateId = flatmate._id || flatmate.userId?._id;
                return (
                  <FlatmateCard
                    key={flatmateId}
                    flatmate={flatmate}
                    isSelected={selectedFlatmates.includes(flatmateId)}
                    onToggle={toggleFlatmate}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Split Preview */}
        {selectedFlatmates.length > 0 && amount && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Split Preview</Text>
            <View className="bg-white rounded-2xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-600">Total Amount</Text>
                <Text className="font-bold text-xl">₹{totalAmount.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-600">Participants</Text>
                <Text className="font-semibold">{selectedFlatmates.length} people</Text>
              </View>
              
              <View className="border-t border-gray-200 pt-4">
                <View className="flex-row justify-between items-center">
                  <Text className="font-bold text-gray-900">Each person pays</Text>
                  <Text className="font-bold text-xl text-green-600">₹{splitAmount}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Create Button */}
        <View className="mx-4 mb-8">
          <TouchableOpacity
            onPress={handleCreateExpense}
            disabled={!amount || !description || selectedFlatmates.length === 0 || creating}
            className={`${
              (!amount || !description || selectedFlatmates.length === 0 || creating) 
                ? 'bg-gray-400' 
                : 'bg-green-500'
            } rounded-2xl py-4 flex-row items-center justify-center shadow-sm`}
          >
            {creating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Calculator size={20} color="white" />
            )}
            <Text className="text-white font-semibold text-lg ml-2">
              {creating ? 'Creating...' : 'Create Split Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default splitExpense;