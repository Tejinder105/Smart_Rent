import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, CheckCircle, Eye, Home, Info, Key } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Card,
  Input,
  PageHeader
} from '../components/ui';
import { fetchFlatPreview, joinFlat, resetJoinProcess, setJoinCode } from '../store/slices/flatSlice';

const JoinFlat = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { flatPreview, loading, joinLoading, error, joinError } =
    useSelector((state) => state.flat);

  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    dispatch(resetJoinProcess());
  }, []);

  const handleCodeChange = useCallback((code) => {
    const clean = code.toUpperCase().slice(0, 6);
    setInputCode(clean);
  }, []);

  const handlePreviewFlat = async () => {
    if (inputCode.length !== 6) {
      Alert.alert('Invalid Code', 'Enter a valid 6-character code');
      return;
    }
    dispatch(setJoinCode(inputCode));
    await dispatch(fetchFlatPreview(inputCode));
  };

  const handleJoinFlat = async () => {
    if (!inputCode) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }

    const result = await dispatch(joinFlat(inputCode));

    if (joinFlat.fulfilled.match(result)) {
      const flat = result.payload;
      Alert.alert(
        'Joined 🎉',
        `You joined "${flat.name}"`,
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      Alert.alert('Join Failed', result.payload || 'Invalid code');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 bg-gray-50">
        <PageHeader
          title="Join Flat"
          leftAction={
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              leftIcon={<ArrowLeft size={20} color="#374151" />}
            />
          }
        />

        {/* Main */}
        {!flatPreview ? (
          // INITIAL SCREEN
          <View className="flex-1 justify-center p-6">
            {/* Minimal Header Card */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center mb-3">
                <Key size={34} color="white" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Join a Flat</Text>
              <Text className="text-gray-600 text-sm mt-1 text-center">
                Enter the 6-digit code shared by your flatmate
              </Text>
            </View>

            {/* Code Input */}
            <Input
              label="Join Code"
              value={inputCode}
              onChangeText={handleCodeChange}
              placeholder="ABC123"
              autoCapitalize="characters"
              maxLength={6}
              keyboardType="default"
              autoCorrect={false}
              blurOnSubmit={false}
              selectTextOnFocus={false}
              className="text-center tracking-widest mb-4"
            />

            <Button
              variant="primary"
              size="lg"
              onPress={handlePreviewFlat}
              disabled={loading || inputCode.length !== 6}
              loading={loading}
              leftIcon={<Eye size={20} color="white" />}
            >
              Preview
            </Button>

            {error && (
              <Card className="bg-danger-50 border-danger-200 mt-4 p-3">
                <Text className="text-danger-800 text-center text-sm">{error}</Text>
              </Card>
            )}

            {/* Small Info Box */}
            <Card className="bg-primary-50 border-primary-200 mt-4 p-3">
              <View className="flex-row">
                <Info size={18} color="#2563eb" />
                <Text className="ml-2 text-primary-700 text-xs flex-1">
                  Ask your flatmate/admin for the join code.
                </Text>
              </View>
            </Card>
          </View>
        ) : (
          // PREVIEW SCREEN
          <View className="flex-1 p-6">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => dispatch(resetJoinProcess())}
              leftIcon={<ArrowLeft size={20} color="#374151" />}
              className="mb-4 self-start"
            />

            <Card className="p-5 bg-white">
              <View className="items-center mb-4">
                <View className="w-14 h-14 bg-success-500 rounded-full items-center justify-center mb-2">
                  <Home size={30} color="white" />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  {flatPreview?.name}
                </Text>
                <Text className="text-gray-600 text-sm">Code: {inputCode}</Text>
              </View>

              {/* Flat Details - Compact */}
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Admin</Text>
                  <Text className="font-semibold">{flatPreview?.adminName}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Members</Text>
                  <Text className="font-semibold">{flatPreview?.memberCount}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Created</Text>
                  <Text className="font-semibold">
                    {formatDate(flatPreview?.createdAt)}
                  </Text>
                </View>
              </View>
            </Card>

            <Button
              variant="success"
              size="lg"
              onPress={handleJoinFlat}
              disabled={joinLoading}
              loading={joinLoading}
              leftIcon={<CheckCircle size={20} color="white" />}
              className="mt-5"
            >
              Join Flat
            </Button>

            {joinError && (
              <Card className="bg-danger-50 border-danger-200 mt-3 p-3">
                <Text className="text-danger-800 text-center text-sm">{joinError}</Text>
              </Card>
            )}

            <Card className="bg-warning-50 border-warning-200 mt-3 p-3">
              <View className="flex-row">
                <AlertTriangle size={16} color="#f59e0b" />
                <Text className="ml-2 text-warning-800 text-xs flex-1">
                  Joining allows you to manage shared expenses with the group.
                </Text>
              </View>
            </Card>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default JoinFlat;
