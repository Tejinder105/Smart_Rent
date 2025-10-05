import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlatPreview, joinFlat, resetJoinProcess, setJoinCode } from '../store/slices/flatSlice';

const JoinFlat = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  const { 
    flatPreview, 
    loading, 
    joinLoading, 
    error, 
    joinError, 
    joinProcess 
  } = useSelector((state) => state.flat);

  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    // Reset join process when component mounts
    dispatch(resetJoinProcess());
  }, [dispatch]);

  const handleCodeChange = (code) => {
    // Convert to uppercase and limit to 6 characters
    const formattedCode = code.toUpperCase().slice(0, 6);
    setInputCode(formattedCode);
    dispatch(setJoinCode(formattedCode));
  };

  const handlePreviewFlat = async () => {
    if (!inputCode || inputCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character join code');
      return;
    }

    try {
      await dispatch(fetchFlatPreview(inputCode));
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleJoinFlat = async () => {
    if (!inputCode) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }

    try {
      const resultAction = await dispatch(joinFlat(inputCode));
      
      if (joinFlat.fulfilled.match(resultAction)) {
        const joinedFlat = resultAction.payload;
        Alert.alert(
          'Welcome to the Flat! 🎉',
          `You have successfully joined "${joinedFlat.name}"`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)/flatmates')
            }
          ]
        );
      } else {
        Alert.alert('Join Failed', resultAction.payload || 'Failed to join flat');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderInitialScreen = () => (
    <View className="flex-1 justify-center p-6">
      {/* Header */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
          <Ionicons name="key" size={40} color="white" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center">
          Join a Flat
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Enter the 6-digit join code shared by your flatmate
        </Text>
      </View>

      {/* Join Code Input */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-3">Join Code</Text>
        <TextInput
          value={inputCode}
          onChangeText={handleCodeChange}
          placeholder="ABC123"
          autoCapitalize="characters"
          maxLength={6}
          className="bg-white px-4 py-4 rounded-xl border border-gray-200 text-gray-900 text-center text-2xl font-mono tracking-widest"
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-xs text-gray-500 text-center mt-2">
          Enter the 6-character code (letters and numbers)
        </Text>
      </View>

      {/* Preview Button */}
      <TouchableOpacity
        onPress={handlePreviewFlat}
        disabled={loading || inputCode.length !== 6}
        className={`py-4 rounded-xl flex-row items-center justify-center mb-4 ${
          loading || inputCode.length !== 6 ? 'bg-gray-300' : 'bg-blue-500'
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="eye" size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Preview Flat
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-800 text-center">{error}</Text>
        </View>
      )}

      {/* Info Box */}
      <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <View className="ml-3 flex-1">
            <Text className="text-blue-800 font-medium text-sm">How to get a join code?</Text>
            <Text className="text-blue-700 text-xs mt-1">
              Ask your flatmate or flat admin to share the 6-digit join code. They can find it in their flatmate settings.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPreviewScreen = () => (
    <View className="flex-1 p-6">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => dispatch(resetJoinProcess())}
        className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mb-6"
      >
        <Ionicons name="arrow-back" size={20} color="#374151" />
      </TouchableOpacity>

      {/* Flat Preview */}
      <View className="flex-1 justify-center">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-green-500 rounded-full items-center justify-center mb-3">
              <Ionicons name="home" size={32} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              {flatPreview?.name}
            </Text>
            <Text className="text-gray-600 text-center mt-1">
              Join Code: {inputCode}
            </Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Admin</Text>
              <Text className="font-semibold text-gray-900">
                {flatPreview?.adminName}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Members</Text>
              <Text className="font-semibold text-gray-900">
                {flatPreview?.memberCount} people
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3">
              <Text className="text-gray-600">Created</Text>
              <Text className="font-semibold text-gray-900">
                {flatPreview?.createdAt ? formatDate(flatPreview.createdAt) : 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        {/* Join Button */}
        <TouchableOpacity
          onPress={handleJoinFlat}
          disabled={joinLoading}
          className={`py-4 rounded-xl flex-row items-center justify-center mt-6 ${
            joinLoading ? 'bg-gray-400' : 'bg-green-500'
          }`}
        >
          {joinLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Join This Flat
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Join Error */}
        {joinError && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <Text className="text-red-800 text-center">{joinError}</Text>
          </View>
        )}

        {/* Info */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
          <Text className="text-yellow-800 text-sm text-center">
            By joining this flat, you'll be able to manage shared expenses and payments with other flatmates.
          </Text>
        </View>
      </View>
    </View>
  );

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
            
            <Text className="text-xl font-bold text-gray-900">Join Flat</Text>
            
            <View className="w-10" />
          </View>
        </View>

        {/* Content */}
        {!flatPreview ? renderInitialScreen() : renderPreviewScreen()}
      </View>
    </KeyboardAvoidingView>
  );
};

export default JoinFlat;