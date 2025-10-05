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
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    settings: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      autoSplitExpenses: true,
      requireApprovalForNewMembers: false
    }
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Flat name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Flat name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const resultAction = await dispatch(createFlat(formData));
      
      if (createFlat.fulfilled.match(resultAction)) {
        const createdFlat = resultAction.payload;
        Alert.alert(
          'Flat Created Successfully! 🎉',
          `Your flat "${createdFlat.name}" has been created with join code: ${createdFlat.joinCode}`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)/flatmates')
            }
          ]
        );
      } else {
        Alert.alert('Error', resultAction.payload || 'Failed to create flat');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
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

            {/* Address Section */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Address (Optional)</Text>
              
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Street Address</Text>
                  <TextInput
                    value={formData.address.street}
                    onChangeText={(value) => updateFormData('address.street', value)}
                    placeholder="123 Main Street, Apartment 2B"
                    className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">City</Text>
                    <TextInput
                      value={formData.address.city}
                      onChangeText={(value) => updateFormData('address.city', value)}
                      placeholder="Mumbai"
                      className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">State</Text>
                    <TextInput
                      value={formData.address.state}
                      onChangeText={(value) => updateFormData('address.state', value)}
                      placeholder="Maharashtra"
                      className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Pin Code</Text>
                  <TextInput
                    value={formData.address.zipCode}
                    onChangeText={(value) => updateFormData('address.zipCode', value)}
                    placeholder="400001"
                    keyboardType="numeric"
                    className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            {/* Settings Section */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Flat Settings</Text>
              
              <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <View className="p-4 border-b border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">Auto Split Expenses</Text>
                      <Text className="text-sm text-gray-500">Automatically split new expenses equally</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => updateFormData('settings.autoSplitExpenses', !formData.settings.autoSplitExpenses)}
                      className={`w-12 h-6 rounded-full ${
                        formData.settings.autoSplitExpenses ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <View className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        formData.settings.autoSplitExpenses ? 'translate-x-6' : 'translate-x-0.5'
                      }`} style={{ marginTop: 2 }} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">Require Approval</Text>
                      <Text className="text-sm text-gray-500">New members need admin approval</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => updateFormData('settings.requireApprovalForNewMembers', !formData.settings.requireApprovalForNewMembers)}
                      className={`w-12 h-6 rounded-full ${
                        formData.settings.requireApprovalForNewMembers ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <View className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        formData.settings.requireApprovalForNewMembers ? 'translate-x-6' : 'translate-x-0.5'
                      }`} style={{ marginTop: 2 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
                    • You can invite flatmates using SMS or share the join code{'\n'}
                    • Start managing expenses and payments
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