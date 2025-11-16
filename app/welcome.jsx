import { useRouter } from 'expo-router';
import { Home, UserPlus } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../components/ui';
import { fetchUserFlat } from '../store/slices/flatSlice';

const Welcome = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { currentFlat, loading } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserFlat());
  }, []);

  useEffect(() => {
    if (!loading && currentFlat) {
      router.replace('/(tabs)');
    }
  }, [currentFlat, loading]);

  const handleCreateFlat = () => router.push('/createFlat');
  const handleJoinFlat = () => router.push('/joinFlat');

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#0057FF" />
        <Text className="mt-sm text-text-secondary">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="items-center pt-3xl pb-md">
        <Image
          source={require('../assets/images/logo.png')}
          className="w-40 h-20"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-text-primary">
          Welcome!
        </Text>
        <Text className="text-text-secondary text-base">
          Hi, {userData?.userName || 'User'} 👋
        </Text>
      </View>

      {/* Buttons */}
      <View className="flex-1 px-xl mt-lg">

        {/* Create Flat */}
        <Card
          variant="interactive"
          onPress={handleCreateFlat}
          className="bg-surface-0 border-primary-500 border mb-md p-lg"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-md">
              <Home size={26} color="#0057FF" />
            </View>
            <View>
              <Text className="text-lg font-bold text-text-primary">
                Create a Flat
              </Text>
              <Text className="text-text-secondary text-sm">
                Start a new flat
              </Text>
            </View>
          </View>
        </Card>

        {/* Join Flat */}
        <Card
          variant="interactive"
          onPress={handleJoinFlat}
          className="bg-surface-0 border-success-500 border p-lg"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-success-50 rounded-full items-center justify-center mr-md">
              <UserPlus size={26} color="#00C471" />
            </View>
            <View>
              <Text className="text-lg font-bold text-text-primary">
                Join a Flat
              </Text>
              <Text className="text-text-secondary text-sm">
                Enter flat code
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Footer */}
      <View className="pb-2xl px-xl">
        <Text className="text-text-tertiary text-center text-xs">
          You can manage or leave your flat anytime in settings.
        </Text>
      </View>
    </View>
  );
};

export default Welcome;
