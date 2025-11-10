import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { createFlat } from '../store/slices/flatSlice';

const CreateFlat = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { createLoading, createError } = useSelector((state) => state.flat);

  const [formData, setFormData] = useState({
    name: '',
    rent: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Flat name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Flat name must be at least 3 characters';
    }

    if (!formData.rent || formData.rent.trim() === '') {
      newErrors.rent = 'Monthly rent is required';
    } else if (isNaN(formData.rent) || Number(formData.rent) <= 0) {
      newErrors.rent = 'Please enter a valid rent amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('📤 Submitting flat creation:', formData);
      const resultAction = await dispatch(createFlat(formData));
      
      console.log('📥 Create flat result:', resultAction);
      
      if (createFlat.fulfilled.match(resultAction)) {
        const createdFlat = resultAction.payload;
        console.log('✅ Flat created:', createdFlat);
        
        Alert.alert(
          'Flat Created Successfully! 🎉',
          `Your flat "${createdFlat.name}" has been created.\n\nMonthly Rent: ₹${createdFlat.rent}\nJoin Code: ${createdFlat.joinCode}\n\nShare the join code with your flatmates to invite them!`,
          [
            {
              text: 'Add Flatmates',
              onPress: () => router.replace('/addFlatmate')
            },
            {
              text: 'Continue to Home',
              onPress: () => router.replace('/(tabs)'),
              style: 'cancel'
            }
          ]
        );
      } else {
        console.error('❌ Create flat failed:', resultAction);
        const errorMessage = resultAction.payload || resultAction.error?.message || 'Failed to create flat';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('❌ Exception during flat creation:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View 
          className="bg-white px-4 py-4 border-b border-gray-200"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-900">Create New Flat</Text>
            
            <View className="w-10" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* Welcome Section */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <View className="items-center mb-4">
                <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-3">
                  <Ionicons name="home" size={32} color="white" />
                </View>
                <Text className="text-blue-800 text-lg font-bold text-center">
                  Create Your Flat
                </Text>
                <Text className="text-blue-600 text-center mt-2">
                  Set up your flat to manage expenses and invite flatmates
                </Text>
              </View>
            </View>

            {/* Flat Name Field */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Flat Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                placeholder="Enter your flat name (e.g., Sunset Apartments 2B)"
                className={`bg-white px-4 py-3 rounded-xl border ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                } text-gray-900`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.name && (
                <Text className="text-red-500 text-xs ml-2 mt-1">{errors.name}</Text>
              )}
            </View>

            {/* Monthly Rent Field */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Monthly Rent *</Text>
              <View className="flex-row items-center">
                <View className="bg-gray-100 px-4 py-3 rounded-l-xl border border-r-0 border-gray-200">
                  <Text className="text-gray-700 font-semibold">₹</Text>
                </View>
                <TextInput
                  value={formData.rent}
                  onChangeText={(value) => updateFormData('rent', value)}
                  placeholder="Enter monthly rent amount"
                  keyboardType="numeric"
                  className={`flex-1 bg-white px-4 py-3 rounded-r-xl border ${
                    errors.rent ? 'border-red-300' : 'border-gray-200'
                  } text-gray-900`}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {errors.rent && (
                <Text className="text-red-500 text-xs ml-2 mt-1">{errors.rent}</Text>
              )}
            </View>

            {/* Info Box */}
            <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#16a34a" />
                <View className="ml-3 flex-1">
                  <Text className="text-green-800 font-medium text-sm">What happens next?</Text>
                  <Text className="text-green-700 text-xs mt-1">
                    • You'll become the flat admin{'\n'}
                    • A unique join code will be generated{'\n'}
                    • You can add flatmates using the join code{'\n'}
                    • Start managing expenses and payments together
                  </Text>
                </View>
              </View>
            </View>

            {/* Add Flatmates Info */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="people" size={20} color="#2563eb" />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-800 font-medium text-sm">Adding Flatmates</Text>
                  <Text className="text-blue-700 text-xs mt-1">
                    After creating the flat, you'll get a 6-digit join code. Share this code with your flatmates so they can join your flat and split expenses together!
                  </Text>
                </View>
              </View>
            </View>

            {/* Error Message */}
            {createError && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <Text className="text-red-800 text-center">{createError}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Create Button */}
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createLoading}
            className={`py-4 rounded-xl flex-row items-center justify-center ${
              createLoading ? 'bg-gray-400' : 'bg-green-500'
            }`}
          >
            {createLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="home" size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Create Flat
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateFlat;