import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function Index() {
  const { status, isLoading: authLoading } = useSelector((state) => state.auth);
  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);

  if (authLoading || flatLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00C471" />
      </View>
    );
  }

  if (!status) {
    return <Redirect href="/auth" />;
  }

  if (!currentFlat) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
