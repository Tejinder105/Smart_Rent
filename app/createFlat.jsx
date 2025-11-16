import { useRouter } from 'expo-router';
import { ArrowLeft, Home, Info } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Input, PageHeader } from '../components/ui';
import { createFlat } from '../store/slices/flatSlice';

const CreateFlat = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { createLoading, createError } = useSelector((state) => state.flat);

  const [formData, setFormData] = useState({ name: '', rent: '' });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Flat name is required';
    else if (formData.name.trim().length < 3)
      newErrors.name = 'Name must be at least 3 characters';

    if (!formData.rent.trim()) newErrors.rent = 'Rent is required';
    else if (isNaN(formData.rent) || Number(formData.rent) <= 0)
      newErrors.rent = 'Enter a valid amount';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await dispatch(createFlat(formData));

    if (createFlat.fulfilled.match(result)) {
      const flat = result.payload;
      Alert.alert(
        'Flat Created 🎉',
        `Name: ${flat.name}\nRent: ₹${flat.rent}\nJoin Code: ${flat.joinCode}`,
        [
          { text: 'Add Flatmates', onPress: () => router.replace('/addFlatmate') },
          { text: 'Go to Home', onPress: () => router.replace('/(tabs)'), style: 'cancel' }
        ]
      );
    } else {
      const msg = result.payload || 'Failed to create flat';
      Alert.alert('Error', msg);
    }
  };

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 bg-gray-50">

        {/* Header */}
        <PageHeader
          title="Create Flat"
          leftAction={
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              leftIcon={<ArrowLeft size={20} color="#374151" />}
            />
          }
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-4">

            {/* Simple Create Icon */}
            <View className="items-center mb-4">
              <View className="w-14 h-14 bg-primary-500 rounded-full items-center justify-center">
                <Home size={28} color="white" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mt-2">
                Set Up Your Flat
              </Text>
              <Text className="text-gray-600 text-sm">
                Add a name & monthly rent
              </Text>
            </View>

            {/* Name */}
            <Input
              label="Flat Name"
              value={formData.name}
              onChangeText={(v) => updateForm('name', v)}
              placeholder="e.g. Maple Residency 5A"
              error={errors.name}
              required
              className="mb-5"
            />

            {/* Rent */}
            <Input
              label="Monthly Rent"
              value={formData.rent}
              onChangeText={(v) => updateForm('rent', v)}
              placeholder="Enter amount"
              keyboardType="numeric"
              leftIcon={<Text className="text-gray-700 font-semibold">₹</Text>}
              error={errors.rent}
              required
              className="mb-5"
            />

            {/* Small Compact Info Box */}
            <Card className="bg-primary-50 border-primary-200 p-3">
              <View className="flex-row">
                <Info size={18} color="#2563eb" />
                <View className="ml-2">
                  <Text className="text-primary-800 font-medium text-sm">
                    After Creation
                  </Text>
                  <Text className="text-primary-700 text-xs mt-1">
                    • You become flat admin{'\n'}
                    • A join code will be generated{'\n'}
                    • Share code → invite flatmates
                  </Text>
                </View>
              </View>
            </Card>

            {createError && (
              <Card className="bg-danger-50 border-danger-200 mt-4 p-3">
                <Text className="text-danger-800 text-center text-sm">{createError}</Text>
              </Card>
            )}

          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="p-4 bg-white border-t border-gray-200">
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={createLoading}
            loading={createLoading}
            leftIcon={<Home size={20} color="white" />}
          >
            Create Flat
          </Button>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateFlat;
