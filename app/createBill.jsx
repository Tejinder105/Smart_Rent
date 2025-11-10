import { useRouter } from 'expo-router';
import {
    Camera,
    ChevronLeft,
    FileText,
    Sparkles,
    Users
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
import { createBill } from '../store/slices/billSlice';
import { fetchUserFlat } from '../store/slices/flatSlice';

const CreateBill = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.bill);
  const { currentFlat } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);

  const [billData, setBillData] = useState({
    title: '',
    description: '',
    totalAmount: '',
    category: 'utilities',
    dueDate: '',
    splitBetween: []
  });

  const [selectedFlatmates, setSelectedFlatmates] = useState([]);

  useEffect(() => {
    dispatch(fetchUserFlat());
  }, []);

  const categories = [
    { id: 'utilities', name: 'Utilities', icon: '⚡', color: 'bg-yellow-100' },
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: 'bg-green-100' },
    { id: 'internet', name: 'Internet', icon: '📶', color: 'bg-blue-100' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧', color: 'bg-orange-100' },
    { id: 'rent', name: 'Rent', icon: '🏠', color: 'bg-purple-100' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧽', color: 'bg-pink-100' },
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

  const handleCreateBill = async () => {
    if (!billData.title.trim()) {
      Alert.alert('Error', 'Please enter a bill title');
      return;
    }

    if (!billData.totalAmount || parseFloat(billData.totalAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!billData.dueDate) {
      Alert.alert('Error', 'Please enter a due date');
      return;
    }

    try {
      const newBill = {
        title: billData.title,
        description: billData.description,
        totalAmount: parseFloat(billData.totalAmount),
        category: billData.category,
        dueDate: billData.dueDate,
        splitBetween: selectedFlatmates.length > 0 
          ? selectedFlatmates 
          : [userData._id],
        createdBy: userData._id,
        flatId: currentFlat?._id
      };

      await dispatch(createBill(newBill)).unwrap();

      Alert.alert(
        'Bill Created!',
        `Bill for ₹${billData.totalAmount} has been created and participants will be notified.`,
        [{
          text: 'OK',
          onPress: () => router.back()
        }]
      );
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create bill');
    }
  };

  const calculateSplit = () => {
    const total = parseFloat(billData.totalAmount) || 0;
    const count = selectedFlatmates.length || 1;
    return (total / count).toFixed(2);
  };

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
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Create Bill
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Add a new bill to split with flatmates
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* AI Scan Option Banner */}
        <TouchableOpacity
          onPress={() => router.push('/scanBill')}
          className="mx-4 mt-6 mb-4 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-2xl p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-purple-200 rounded-full items-center justify-center">
                <Sparkles size={24} color="#8b5cf6" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-purple-900 font-bold text-base">
                  🤖 Try AI Bill Scanner
                </Text>
                <Text className="text-purple-700 text-sm">
                  Scan bill image with OCR
                </Text>
              </View>
            </View>
            <Camera size={24} color="#8b5cf6" />
          </View>
        </TouchableOpacity>

        {/* Title */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Bill Title
          </Text>
          <View className="bg-white rounded-2xl p-4">
            <TextInput
              value={billData.title}
              onChangeText={(text) => setBillData({ ...billData, title: text })}
              placeholder="e.g., Electricity Bill - January"
              className="text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Amount */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Total Amount
          </Text>
          <View className="bg-white rounded-2xl p-6">
            <View className="flex-row items-center">
              <Text className="text-3xl font-bold text-gray-400 mr-2">₹</Text>
              <TextInput
                value={billData.totalAmount}
                onChangeText={(text) => setBillData({ ...billData, totalAmount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="text-3xl font-bold text-gray-900 flex-1"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* Category */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setBillData({ ...billData, category: cat.id })}
                  className={`${cat.color} rounded-xl p-4 mr-3 min-w-[100px] border-2 ${
                    billData.category === cat.id ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <Text className="text-3xl mb-2 text-center">{cat.icon}</Text>
                  <Text className="text-sm font-medium text-gray-700 text-center">
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Due Date */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Due Date
          </Text>
          <View className="bg-white rounded-2xl p-4">
            <TextInput
              value={billData.dueDate}
              onChangeText={(text) => setBillData({ ...billData, dueDate: text })}
              placeholder="YYYY-MM-DD"
              className="text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
            />
            <Text className="text-xs text-gray-500 mt-2">
              Format: YYYY-MM-DD (e.g., {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]})
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Description (Optional)
          </Text>
          <View className="bg-white rounded-2xl p-4">
            <TextInput
              value={billData.description}
              onChangeText={(text) => setBillData({ ...billData, description: text })}
              placeholder="Add any notes about this bill..."
              className="text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Split With Flatmates */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Split With (Optional)
          </Text>
          
          {currentFlat?.members && currentFlat.members.length > 0 ? (
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-sm text-gray-600 mb-3">
                Select flatmates to split this bill
              </Text>
              {currentFlat.members.map((member) => {
                const isCurrentUser = member._id === userData._id || member.userId === userData._id;
                const memberId = member._id || member.userId;
                const memberName = member.userName || member.name || 'Flatmate';
                const isSelected = selectedFlatmates.includes(memberId);

                return (
                  <TouchableOpacity
                    key={memberId}
                    onPress={() => toggleFlatmate(memberId)}
                    className={`flex-row items-center justify-between p-3 rounded-xl mb-2 ${
                      isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${
                        isCurrentUser ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        <Text className="text-white font-bold">
                          {memberName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-gray-900 font-medium">
                          {isCurrentUser ? 'You' : memberName}
                        </Text>
                        {isSelected && billData.totalAmount && (
                          <Text className="text-blue-600 text-xs mt-1">
                            Share: ₹{calculateSplit()}
                          </Text>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                        <Text className="text-white font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              
              {selectedFlatmates.length === 0 && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-2">
                  <Text className="text-yellow-800 text-sm text-center">
                    No flatmates selected. Bill will be assigned to you only.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="bg-gray-100 rounded-2xl p-6 items-center">
              <Users size={32} color="#9ca3af" />
              <Text className="text-gray-600 text-center mt-2">
                No flatmates found in your flat
              </Text>
            </View>
          )}
        </View>

        {/* Split Summary */}
        {billData.totalAmount && selectedFlatmates.length > 0 && (
          <View className="mx-4 mb-4">
            <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-blue-900 font-semibold">
                  Split Summary
                </Text>
                <View className="items-end">
                  <Text className="text-blue-900 font-bold text-lg">
                    ₹{calculateSplit()}
                  </Text>
                  <Text className="text-blue-600 text-xs">
                    per person ({selectedFlatmates.length} people)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Create Button */}
        <View className="mx-4 mb-8">
          <TouchableOpacity
            onPress={handleCreateBill}
            disabled={loading}
            className={`${loading ? 'bg-gray-400' : 'bg-blue-500'} rounded-2xl py-4 flex-row items-center justify-center`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <FileText size={20} color="white" />
            )}
            <Text className="text-white font-bold text-lg ml-2">
              {loading ? 'Creating Bill...' : 'Create Bill'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateBill;
