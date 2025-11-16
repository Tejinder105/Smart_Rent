import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  DivideCircle,
  IndianRupee,
  Receipt,
  ShoppingCart,
  Sofa,
  Sparkles,
  Tags,
  Users,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

import { fetchAvailableFlatmates } from '../store/slices/expenseSlice';
import { createUnifiedExpense, invalidateCache } from '../store/slices/expenseUnifiedSlice';

const splitExpense = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { availableFlatmates, loading, error } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const { currentFlat } = useSelector((state) => state.flat);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('groceries');
  const [selectedFlatmates, setSelectedFlatmates] = useState([]);

  useEffect(() => {
    dispatch(fetchAvailableFlatmates());
  }, []);

  // Better category icons
  const categories = [
    { id: 'groceries', name: 'Groceries', icon: <ShoppingCart size={22} />, color: '#dcfce7' },
    { id: 'utilities', name: 'Utilities', icon: <Zap size={22} />, color: '#fef3c7' },
    { id: 'internet', name: 'Internet', icon: <Wifi size={22} />, color: '#dbeafe' },
    { id: 'cleaning', name: 'Cleaning', icon: <Sparkles size={22} />, color: '#e9d5ff' },
    { id: 'maintenance', name: 'Maintenance', icon: <Wrench size={22} />, color: '#fed7aa' },
    { id: 'furniture', name: 'Furniture', icon: <Sofa size={22} />, color: '#fce7f3' },
    { id: 'other', name: 'Other', icon: <Tags size={22} />, color: '#f3f4f6' }
  ];

  const toggleFlatmate = (flatmateId) => {
    setSelectedFlatmates(prev =>
      prev.includes(flatmateId)
        ? prev.filter(id => id !== flatmateId)
        : [...prev, flatmateId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFlatmates.length === availableFlatmates.length) {
      setSelectedFlatmates([]);
    } else {
      const allIds = availableFlatmates.map(f => f._id || f.userId?._id);
      setSelectedFlatmates(allIds);
    }
  };

  const calculateSplit = () => {
    const totalAmount = parseFloat(amount) || 0;
    const n = selectedFlatmates.length;
    if (!n) return 0;
    return (totalAmount / n).toFixed(2);
  };

  const handleCreateExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) return Alert.alert('Error', 'Enter a valid amount');
    if (!description.trim()) return Alert.alert('Error', 'Enter a description');
    if (selectedFlatmates.length === 0) return Alert.alert('Error', 'Select participants');

    const totalAmount = parseFloat(amount);
    const splitAmount = calculateSplit();

    const participants = availableFlatmates.filter(f =>
      selectedFlatmates.includes(f._id?.toString?.() || f._id)
    );

    Alert.alert(
      'Confirm Expense',
      `Split ₹${totalAmount} among ${participants.length} people (₹${splitAmount} each)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              const expenseData = {
                type: 'split',
                title: description,
                description,
                totalAmount: totalAmount,
                category: selectedCategory,
                flatId: currentFlat?._id,
                participants: participants.map(p => ({
                  userId: p._id,
                  name: p.name,
                  amount: parseFloat(splitAmount),
                  splitMethod: 'equal'
                }))
              };

              await dispatch(createUnifiedExpense(expenseData)).unwrap();
              dispatch(invalidateCache());

              Alert.alert(
                'Expense Created!',
                `Each person owes ₹${splitAmount}`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setAmount('');
                      setDescription('');
                      setSelectedFlatmates([]);
                      router.back();
                    }
                  }
                ]
              );
            } catch (e) {
              Alert.alert('Error', e || 'Failed to create expense');
            }
          }
        }
      ]
    );
  };

  const splitAmount = calculateSplit();
  const totalAmount = parseFloat(amount) || 0;

  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <PageHeader
        title="Split Expense"
        leftAction={
          <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Amount */}
        <View className="px-4 mt-6 mb-4">
          <Input
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon={<IndianRupee size={22} color="#9ca3af" />}
            required
          />
        </View>

        {/* Description */}
        <View className="px-4 mb-6">
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What was this expense for?"
            multiline
            numberOfLines={3}
            required
          />
        </View>

        {/* Categories */}
        <View className="px-4 mb-6">
          <SectionTitle title="Category" />
          <CategorySelector
            categories={categories}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
            columns={3}
          />
        </View>

        {/* Flatmate selection */}
        <View className="px-4 mb-6">
          
          <View className="flex-row items-center justify-between mb-3">
            <SectionTitle title="Select Flatmates" variant="compact" className="mb-0" />

            <TouchableOpacity
              onPress={toggleSelectAll}
              className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-gray-200"
            >
              <View
                className={`w-5 h-5 rounded border-2 items-center justify-center mr-2 ${
                  selectedFlatmates.length === availableFlatmates.length && availableFlatmates.length > 0
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedFlatmates.length === availableFlatmates.length &&
                  availableFlatmates.length > 0 && <Check size={14} color="#fff" />}
              </View>
              <Text className="text-sm font-medium text-gray-700">Select All</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <Card className="items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-2 text-gray-600">Loading flatmates...</Text>
            </Card>
          )}

          {error && (
            <Card className="bg-danger-50 border-danger-200 p-4">
              <Text className="text-danger-800 text-center">{error}</Text>
            </Card>
          )}

          {!loading && !error && availableFlatmates && (
            <FlatmateSelector
              flatmates={availableFlatmates.map(f => ({
                id: f._id || f.userId?._id,
                name: f.isCurrentUser ? `${f.name} (You)` : f.name,
                avatar: null,
                icon: <Users size={20} color="#4b5563" />,
                amount: splitAmount ? parseFloat(splitAmount) : 0
              }))}
              selectedIds={selectedFlatmates}
              onToggle={toggleFlatmate}
              multiSelect
              showAmounts={!!amount}
            />
          )}
        </View>

        {/* Split Preview */}
        {selectedFlatmates.length > 0 && amount && (
          <View className="px-4 mb-6">
            <SectionTitle title="Split Preview" />
            <Card variant="elevated" className="p-4">

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-600">Total Amount</Text>
                <Text className="font-bold text-xl">₹{totalAmount.toFixed(2)}</Text>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-600">Participants</Text>
                <Text className="font-semibold">{selectedFlatmates.length}</Text>
              </View>

              <View className="border-t border-gray-200 pt-4 flex-row justify-between items-center">
                <Text className="font-bold text-gray-900">Each person pays</Text>
                <View className="flex-row items-center">
                  <DivideCircle size={20} color="#16a34a" />
                  <Text className="ml-2 font-bold text-xl text-success-600">
                    ₹{splitAmount}
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
            onPress={handleCreateExpense}
            disabled={!amount || !description || selectedFlatmates.length === 0 || loading}
            loading={loading}
            leftIcon={!loading ? <Receipt size={20} color="white" /> : null}
          >
            {loading ? 'Creating...' : 'Create Split Expense'}
          </Button>
        </View>

      </ScrollView>
    </View>
  );
};

export default splitExpense;
