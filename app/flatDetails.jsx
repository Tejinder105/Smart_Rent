import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Copy, Home, Info, Key, Settings, UserPlus, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Card,
    EmptyState,
    PageHeader,
    SectionTitle,
    StatCard
} from '../components/ui';
import { fetchFlatMembers } from '../store/slices/flatSlice';

const FlatDetails = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
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
        <PageHeader
          title="Flat Details"
          leftAction={
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              leftIcon={<ArrowLeft size={20} color="#374151" />}
            />
          }
        />
        <View className="flex-1 items-center justify-center p-4">
          <EmptyState
            icon={<Home size={48} color="#9ca3af" />}
            title="No Flat Information"
            message="No flat information available"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <PageHeader
        title="Flat Details"
        leftAction={
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            leftIcon={<ArrowLeft size={20} color="#374151" />}
          />
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Flat Info Card */}
          <Card variant="elevated" className="bg-white mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {currentFlat.name}
                </Text>
                {isAdmin && (
                  <View className="bg-purple-100 px-2 py-1 rounded-md self-start mt-1">
                    <Text className="text-purple-800 text-xs font-semibold">
                      You are Admin
                    </Text>
                  </View>
                )}
              </View>
              <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center">
                <Home size={32} color="white" />
              </View>
            </View>

            <View className="border-t border-gray-200 pt-4 gap-3">
              <View className="flex-row gap-3">
                <StatCard
                  label="Monthly Rent"
                  value={`₹${currentFlat.rent?.toFixed(2)}`}
                  variant="default"
                  className="flex-1"
                />
                <StatCard
                  label="Budget"
                  value={currentFlat.monthlyBudget > 0 ? `₹${currentFlat.monthlyBudget?.toFixed(2)}` : 'Not Set'}
                  variant="default"
                  className="flex-1"
                />
              </View>
              <View className="flex-row gap-3">
                <StatCard
                  label="Total Members"
                  value={currentFlat.stats?.totalMembers || members?.length || 0}
                  variant="default"
                  className="flex-1"
                />
                <StatCard
                  label="Rent/Person"
                  value={`₹${((currentFlat.rent || 0) / (currentFlat.stats?.totalMembers || 1)).toFixed(2)}`}
                  variant="success"
                  className="flex-1"
                />
              </View>

              {/* Budget Quick Action */}
              <Card
                variant="interactive"
                onPress={() => router.push('/budget')}
                className="bg-purple-50 border-purple-200 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-2">💰</Text>
                  <Text className="text-purple-900 font-semibold">
                    {currentFlat.monthlyBudget > 0 ? 'View Budget' : 'Set Budget'}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9333ea" />
              </Card>
            </View>
          </Card>

          {/* Join Code Card */}
          <Card className="bg-gradient-to-r from-primary-500 to-purple-500 bg-primary-500 mb-4">
            <View className="flex-row items-center mb-3">
              <Key size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Join Code
              </Text>
            </View>
            
            <View className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
              <Text className="text-white text-center text-4xl font-bold tracking-widest font-mono">
                {currentFlat.joinCode}
              </Text>
            </View>

            <Button
              variant="outline"
              size="md"
              onPress={handleCopyJoinCode}
              leftIcon={<Copy size={20} color="#3B82F6" />}
              className="bg-white"
            >
              <Text className="text-primary-600 font-semibold">Copy Join Code</Text>
            </Button>

            <Text className="text-white/80 text-xs text-center mt-3">
              Share this code with your flatmates to invite them
            </Text>
          </Card>

          {/* Members Section */}
          <Card variant="elevated" className="bg-white mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <SectionTitle title={`Flatmates (${members?.length || 0})`} variant="compact" className="mb-0" />
              {isAdmin && (
                <Button
                  variant="success"
                  size="sm"
                  onPress={handleAddFlatmate}
                  leftIcon={<UserPlus size={16} color="white" />}
                >
                  Add
                </Button>
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
                        <View className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center mr-3">
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
                              <Text className="text-primary-600 text-xs ml-2">(You)</Text>
                            )}
                          </View>
                          <Text className="text-gray-500 text-sm">
                            {member.email}
                          </Text>
                          {member.monthlyContribution > 0 && (
                            <Text className="text-success-600 text-xs mt-1">
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
              <EmptyState
                icon={<Users size={48} color="#9CA3AF" />}
                title="No Members"
                message="No members found"
              />
            )}
          </Card>

          {/* Info Card */}
          <Card variant="outline" className="bg-primary-50 border-primary-200 mb-4 flex-row items-start">
            <Info size={20} color="#2563eb" />
            <View className="ml-3 flex-1">
              <Text className="text-primary-800 font-medium text-sm mb-2">
                About Flat Management
              </Text>
              <Text className="text-primary-700 text-xs leading-5">
                • Admin can add or remove members{'\n'}
                • All members can create and split expenses{'\n'}
                • Join code never expires{'\n'}
                • Share the code to invite new flatmates
              </Text>
            </View>
          </Card>

          {/* Settings Button (for future) */}
          {isAdmin && (
            <Card
              variant="interactive"
              onPress={() => router.push('/settings')}
              className="bg-white flex-row items-center justify-between mb-4"
            >
              <View className="flex-row items-center">
                <Settings size={24} color="#374151" />
                <Text className="text-gray-900 font-semibold ml-3">
                  Flat Settings
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FlatDetails;
