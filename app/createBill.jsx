import { useRouter } from 'expo-router';
import {
  Camera,
  ChevronLeft,
  FileText,
  Sparkles,
  Users,
  Scan
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Card,
  CategorySelector,
  FlatmateSelector,
  Input,
  PageHeader,
  SectionTitle
} from '../components/ui';
import { createUnifiedExpense, invalidateCache } from '../store/slices/expenseUnifiedSlice';
import { fetchUserFlat } from '../store/slices/flatSlice';

const CreateBill = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.expenseUnified);
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
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 7 days from now

  useEffect(() => {
    dispatch(fetchUserFlat());
  }, []);

  const categories = [
    { id: 'utilities', name: 'Utilities', icon: '⚡', color: '#fef3c7' },
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#dcfce7' },
    { id: 'internet', name: 'Internet', icon: '📶', color: '#dbeafe' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧', color: '#fed7aa' },
    { id: 'rent', name: 'Rent', icon: '🏠', color: '#e9d5ff' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧽', color: '#fce7f3' },
    { id: 'other', name: 'Other', icon: '📋', color: '#f3f4f6' }
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
      const expenseData = {
        flatId: currentFlat?._id,
        type: 'shared', // 'shared' for bills
        title: billData.title,
        description: billData.description,
        totalAmount: parseFloat(billData.totalAmount),
        category: billData.category,
        dueDate: billData.dueDate,
        splitMethod: 'equal',
        participants: selectedFlatmates.length > 0 
          ? selectedFlatmates.map(id => ({ userId: id }))
          : [{ userId: userData._id }]
      };

      await dispatch(createUnifiedExpense(expenseData)).unwrap();
      dispatch(invalidateCache());

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
      <PageHeader
        title="Create Bill"
        subtitle="Add a new bill to split with flatmates"
        leftAction={
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* AI Scan Option Banner */}
        <View className="px-4 mt-6 mb-6">
          <Card
            variant="interactive"
            onPress={() => router.push('/scanBill')}
            className="bg-purple-50 border-2 border-purple-200"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-purple-200 rounded-full items-center justify-center">
                  <Scan size={24} color="#8b5cf6" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-purple-900 font-bold text-base">
                     Try Bill Scanner
                  </Text>
                </View>
              </View>
              <Camera size={24} color="#8b5cf6" />
            </View>
          </Card>
        </View>

        {/* Title */}
        <View className="px-4 mb-4">
          <Input
            label="Bill Title"
            value={billData.title}
            onChangeText={(text) => setBillData({ ...billData, title: text })}
            placeholder="e.g., Electricity Bill - January"
            required
          />
        </View>

        {/* Amount */}
        <View className="px-4 mb-4">
          <Input
            label="Total Amount"
            value={billData.totalAmount}
            onChangeText={(text) => setBillData({ ...billData, totalAmount: text })}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon={<Text className="text-2xl font-bold text-gray-400">₹</Text>}
            required
          />
        </View>

        {/* Category */}
        <View className="px-4 mb-6">
          <SectionTitle title="Category" />
          <CategorySelector
            categories={categories.map(cat => ({
              ...cat,
              icon: <Text className="text-2xl">{cat.icon}</Text>
            }))}
            selectedId={billData.category}
            onSelect={(catId) => setBillData({ ...billData, category: catId })}
            columns={3}
          />
        </View>

        {/* Due Date */}
        <View className="px-4 mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Due Date <Text className="text-danger-500">*</Text>
          </Text>
          
          {/* Quick Date Options */}
          <View className="flex-row gap-2 mb-3">
            {[
              { label: 'Today', days: 0 },
              { label: '3 Days', days: 3 },
              { label: '1 Week', days: 7 },
              { label: '2 Weeks', days: 14 },
              { label: '1 Month', days: 30 }
            ].map((option) => {
              const date = new Date(Date.now() + option.days * 24 * 60 * 60 * 1000);
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = billData.dueDate === dateStr;
              
              return (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => {
                    setBillData({ ...billData, dueDate: dateStr });
                    setSelectedDate(date);
                  }}
                  className={`px-3 py-2 rounded-lg border-2 ${
                    isSelected 
                      ? 'bg-primary-500 border-primary-500' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Manual Date Input */}
          <Input
            value={billData.dueDate}
            onChangeText={(text) => setBillData({ ...billData, dueDate: text })}
            placeholder="YYYY-MM-DD"
            helperText="Or enter date manually in YYYY-MM-DD format"
          />
        </View>

        {/* Description */}
        <View className="px-4 mb-6">
          <Input
            label="Description (Optional)"
            value={billData.description}
            onChangeText={(text) => setBillData({ ...billData, description: text })}
            placeholder="Add any notes about this bill..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Split With Flatmates */}
        <View className="px-4 mb-6">
          <SectionTitle title="Split With (Optional)" />
          
          {(() => {
            console.log('🏠 Current Flat:', currentFlat);
            console.log('👥 Members:', currentFlat?.members);
            console.log('👤 Current User:', userData);
            
            if (!currentFlat?.members || currentFlat.members.length === 0) {
              return (
                <Card className="items-center">
                  <Users size={32} color="#9ca3af" />
                  <Text className="text-gray-600 text-center mt-2">
                    No flatmates found in your flat
                  </Text>
                </Card>
              );
            }
            
            const flatmatesList = currentFlat.members
              .filter(member => member.status === 'active')
              .map(member => {
                const isCurrentUser = member.userId?._id === userData?._id || member.userId === userData?._id;
                const memberId = member.userId?._id || member.userId;
                const memberName = member.userId?.userName || member.userName || 'Flatmate';
                
                console.log('Processing member:', {
                  memberId,
                  memberName,
                  isCurrentUser,
                  rawMember: member
                });
                
                return {
                  id: memberId,
                  name: isCurrentUser ? `${memberName} (You)` : memberName,
                  avatar: null,
                  amount: billData.totalAmount ? parseFloat(calculateSplit()) : 0
                };
              });
            
            console.log('📋 Flatmates List:', flatmatesList);
            
            return (
              <>
                <Text className="text-sm text-gray-600 mb-3 px-2">
                  Select flatmates to split this bill
                </Text>
                <FlatmateSelector
                  flatmates={flatmatesList}
                  selectedIds={selectedFlatmates}
                  onToggle={toggleFlatmate}
                  multiSelect={true}
                  showAmounts={billData.totalAmount ? true : false}
                />
              
                {selectedFlatmates.length === 0 && (
                  <Card className="bg-warning-50 border-2 border-warning-200 mt-3">
                    <Text className="text-warning-800 text-sm text-center">
                      No flatmates selected. Bill will be assigned to you only.
                    </Text>
                  </Card>
                )}
              </>
            );
          })()}
        </View>

        {/* Split Summary */}
        {billData.totalAmount && selectedFlatmates.length > 0 && (
          <View className="px-4 mb-6">
            <Card className="bg-primary-50 border-2 border-primary-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-primary-900 font-semibold">
                  Split Summary
                </Text>
                <View className="items-end">
                  <Text className="text-primary-900 font-bold text-lg">
                    ₹{calculateSplit()}
                  </Text>
                  <Text className="text-primary-600 text-xs">
                    per person ({selectedFlatmates.length} people)
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Create Button */}
        <View className="px-4 mb-8">
          <Button
            variant="primary"
            size="lg"
            onPress={handleCreateBill}
            disabled={loading}
            loading={loading}
            leftIcon={!loading ? <FileText size={20} color="white" /> : null}
          >
            {loading ? 'Creating Bill...' : 'Create Bill'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateBill;
