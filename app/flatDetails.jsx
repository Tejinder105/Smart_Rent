import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlatMembers } from '../store/slices/flatSlice';

const FlatDetails = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  const { currentFlat, members, membersLoading } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentFlat?._id) {
      loadMembers();
    }
  }, [currentFlat?._id]);

  const loadMembers = async () => {
    if (currentFlat?._id) {
      await dispatch(fetchFlatMembers(currentFlat._id));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const handleCopyJoinCode = () => {
    if (currentFlat?.joinCode) {
      Clipboard.setString(currentFlat.joinCode);
      Alert.alert(
        'Join Code Copied! 📋',
        `Join code "${currentFlat.joinCode}" has been copied to clipboard. Share it with your flatmates!`
      );
    }
  };

  const handleAddFlatmate = () => {
    router.push('/addFlatmate');
  };

  const isAdmin = currentFlat?.admin?._id === userData?._id || 
                  currentFlat?.admin === userData?._id;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'co_tenant':
        return 'bg-blue-100 text-blue-800';
      case 'subtenant':
        return 'bg-green-100 text-green-800';
      case 'guest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'co_tenant':
        return 'Co-tenant';
      case 'subtenant':
        return 'Sub-tenant';
      case 'guest':
        return 'Guest';
      default:
        return role;
    }
  };

  if (!currentFlat) {
    return (
      <View className="flex-1 bg-gray-50">
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
            <Text className="text-xl font-bold text-gray-900">Flat Details</Text>
            <View className="w-10" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-600 text-center">No flat information available</Text>
        </View>
      </View>
    );
  }

  return (
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
          
          <Text className="text-xl font-bold text-gray-900">Flat Details</Text>
          
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Flat Info Card */}
          <View className="bg-white rounded-2xl p-6 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {currentFlat.name}
                </Text>
                {isAdmin && (
                  <View className="flex-row items-center mt-1">
                    <View className="bg-purple-100 px-2 py-1 rounded-md">
                      <Text className="text-purple-800 text-xs font-semibold">
                        You are Admin
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center">
                <Ionicons name="home" size={32} color="white" />
              </View>
            </View>

            <View className="border-t border-gray-200 pt-4">
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-600">Monthly Rent:</Text>
                <Text className="font-bold text-gray-900 text-lg">
                  ₹{currentFlat.rent?.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-600">Total Members:</Text>
                <Text className="font-bold text-gray-900">
                  {currentFlat.stats?.totalMembers || members?.length || 0}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Rent per Person:</Text>
                <Text className="font-bold text-green-600 text-lg">
                  ₹{((currentFlat.rent || 0) / (currentFlat.stats?.totalMembers || 1)).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Join Code Card */}
          <View className="bg-gradient-to-r from-blue-500 to-purple-500 bg-blue-500 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="key" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Join Code
              </Text>
            </View>
            
            <View className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
              <Text className="text-white text-center text-4xl font-bold tracking-widest font-mono">
                {currentFlat.joinCode}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCopyJoinCode}
              className="bg-white rounded-xl py-3 px-4 flex-row items-center justify-center"
            >
              <Ionicons name="copy-outline" size={20} color="#3B82F6" />
              <Text className="text-blue-600 font-semibold ml-2">
                Copy Join Code
              </Text>
            </TouchableOpacity>

            <Text className="text-white/80 text-xs text-center mt-3">
              Share this code with your flatmates to invite them
            </Text>
          </View>

          {/* Members Section */}
          <View className="bg-white rounded-2xl p-6 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Flatmates ({members?.length || 0})
              </Text>
              {isAdmin && (
                <TouchableOpacity
                  onPress={handleAddFlatmate}
                  className="flex-row items-center bg-green-500 px-4 py-2 rounded-lg"
                >
                  <Ionicons name="person-add" size={16} color="white" />
                  <Text className="text-white font-semibold ml-1 text-sm">
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {membersLoading && !refreshing ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-2">Loading members...</Text>
              </View>
            ) : members && members.length > 0 ? (
              <View>
                {members.map((member, index) => {
                  const isCurrentUser = member._id === userData?._id;
                  
                  return (
                    <View
                      key={member._id || index}
                      className={`flex-row items-center justify-between py-4 ${
                        index !== members.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <View className="flex-row items-center flex-1">
                        {/* Avatar */}
                        <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-3">
                          <Text className="text-white font-bold text-lg">
                            {member.name?.charAt(0).toUpperCase() || 'U'}
                          </Text>
                        </View>
                        
                        {/* Member Info */}
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text className="font-semibold text-gray-900 text-base">
                              {member.name}
                            </Text>
                            {isCurrentUser && (
                              <Text className="text-blue-600 text-xs ml-2">(You)</Text>
                            )}
                          </View>
                          <Text className="text-gray-500 text-sm">
                            {member.email}
                          </Text>
                          {member.monthlyContribution > 0 && (
                            <Text className="text-green-600 text-xs mt-1">
                              Contribution: ₹{member.monthlyContribution.toFixed(2)}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Role Badge */}
                      <View className={`px-3 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                        <Text className={`text-xs font-semibold ${getRoleBadgeColor(member.role).split(' ')[1]}`}>
                          {getRoleDisplayName(member.role)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">No members found</Text>
              </View>
            )}
          </View>

          {/* Info Card */}
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <View className="ml-3 flex-1">
                <Text className="text-blue-800 font-medium text-sm mb-2">
                  About Flat Management
                </Text>
                <Text className="text-blue-700 text-xs leading-5">
                  • Admin can add or remove members{'\n'}
                  • All members can create and split expenses{'\n'}
                  • Join code never expires{'\n'}
                  • Share the code to invite new flatmates
                </Text>
              </View>
            </View>
          </View>

          {/* Settings Button (for future) */}
          {isAdmin && (
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="settings-outline" size={24} color="#374151" />
                <Text className="text-gray-900 font-semibold ml-3">
                  Flat Settings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FlatDetails;
