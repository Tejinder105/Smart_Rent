import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
    Camera,
    CheckCircle,
    ChevronLeft,
    ImageIcon,
    Sparkles,
    Upload,
    XCircle
} from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { createBill, scanBill } from '../store/slices/billSlice';

const ScanBill = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();

  const { scannedBillData, loading } = useSelector((state) => state.bill);
  const { currentFlat } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Editable bill data from OCR
  const [billData, setBillData] = useState({
    title: '',
    description: '',
    totalAmount: '',
    category: 'utilities',
    dueDate: '',
    splitBetween: []
  });

  const categories = [
    { id: 'utilities', name: 'Utilities', icon: '⚡' },
    { id: 'groceries', name: 'Groceries', icon: '🛒' },
    { id: 'internet', name: 'Internet', icon: '📶' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
    { id: 'rent', name: 'Rent', icon: '🏠' },
    { id: 'other', name: 'Other', icon: '📋' }
  ];

  const handleGoBack = () => {
    router.back();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0]);
      handleScanImage(result.assets[0]);
    }
  };

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan bills');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleCapture = async (camera) => {
    if (!camera) return;

    try {
      const photo = await camera.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setCapturedImage({ uri: photo.uri });
      setShowCamera(false);
      handleScanImage({ uri: photo.uri });
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleScanImage = async (image) => {
    if (!image?.uri) return;

    setScanning(true);
    try {
      // Create form data for image upload
      const formData = new FormData();
      const filename = image.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: image.uri,
        name: filename,
        type: type,
      });

      const result = await dispatch(scanBill(formData)).unwrap();

      // Auto-fill form with OCR results
      if (result) {
        setBillData({
          title: result.title || result.vendor || 'Scanned Bill',
          description: result.description || `Bill from ${result.vendor || 'vendor'}`,
          totalAmount: result.amount?.toString() || '',
          category: result.category || 'utilities',
          dueDate: result.date || '',
          splitBetween: []
        });

        Alert.alert(
          '✨ Scan Complete!',
          `Bill details extracted successfully. Please review and edit if needed.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Scan Failed', error?.message || 'Failed to scan bill. Please enter details manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleCreateBill = async () => {
    if (!billData.title.trim()) {
      Alert.alert('Error', 'Please enter a bill title');
      return;
    }

    if (!billData.totalAmount || parseFloat(billData.totalAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!billData.dueDate) {
      Alert.alert('Error', 'Please enter a due date');
      return;
    }

    try {
      const newBill = {
        ...billData,
        totalAmount: parseFloat(billData.totalAmount),
        splitBetween: billData.splitBetween.length > 0 
          ? billData.splitBetween 
          : [userData._id], // Default to current user
        createdBy: userData._id,
        flatId: currentFlat?._id
      };

      await dispatch(createBill(newBill)).unwrap();

      Alert.alert(
        'Bill Created!',
        'Bill has been created and participants will be notified.',
        [{
          text: 'OK',
          onPress: () => router.back()
        }]
      );
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create bill');
    }
  };

  if (showCamera) {
    return (
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          ref={(ref) => {
            if (ref) {
              setTimeout(() => handleCapture(ref), 500);
            }
          }}
        >
          <View className="flex-1 justify-between" style={{ paddingTop: insets.top }}>
            {/* Camera Header */}
            <View className="px-4 py-4">
              <TouchableOpacity
                onPress={() => setShowCamera(false)}
                className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Camera Instructions */}
            <View className="px-4 pb-8">
              <View className="bg-black/70 rounded-2xl p-4">
                <Text className="text-white text-center font-semibold mb-2">
                  📸 Position Bill in Frame
                </Text>
                <Text className="text-white/80 text-center text-sm">
                  Make sure all text is clearly visible
                </Text>
              </View>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-6 bg-white" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            className="mr-4 w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              🤖 Scan Bill
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              AI-powered bill scanning with OCR
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Scan Options */}
        {!capturedImage && (
          <View className="mx-4 mt-6 mb-4">
            <View className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-4">
              <View className="flex-row items-center mb-3">
                <Sparkles size={24} color="#8b5cf6" />
                <Text className="text-purple-900 font-bold text-lg ml-2">
                  AI Bill Scanner
                </Text>
              </View>
              <Text className="text-purple-700 text-sm">
                Automatically extract bill details using advanced OCR technology. Just snap a photo or upload an image!
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-1 bg-blue-500 rounded-2xl p-6 items-center"
              >
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-3">
                  <Camera size={32} color="#3b82f6" />
                </View>
                <Text className="text-white font-bold text-base">
                  Take Photo
                </Text>
                <Text className="text-blue-100 text-xs mt-1">
                  Capture with camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-1 bg-green-500 rounded-2xl p-6 items-center"
              >
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-3">
                  <ImageIcon size={32} color="#22c55e" />
                </View>
                <Text className="text-white font-bold text-base">
                  Upload Image
                </Text>
                <Text className="text-green-100 text-xs mt-1">
                  Choose from gallery
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <View className="mx-4 mt-6 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Captured Bill
            </Text>
            <View className="bg-white rounded-2xl p-4 relative">
              <Image
                source={{ uri: capturedImage.uri }}
                className="w-full h-64 rounded-xl"
                resizeMode="cover"
              />
              {scanning && (
                <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
                  <ActivityIndicator size="large" color="white" />
                  <Text className="text-white font-semibold mt-2">
                    🤖 Scanning with AI...
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => {
                  setCapturedImage(null);
                  setBillData({
                    title: '',
                    description: '',
                    totalAmount: '',
                    category: 'utilities',
                    dueDate: '',
                    splitBetween: []
                  });
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
              >
                <XCircle size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bill Details Form */}
        {capturedImage && !scanning && (
          <View className="mx-4 mb-6">
            <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <View className="flex-row items-center">
                <CheckCircle size={18} color="#22c55e" />
                <Text className="flex-1 text-green-800 text-sm font-medium ml-2">
                  ✨ Details extracted! Review and edit below
                </Text>
              </View>
            </View>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Bill Title
              </Text>
              <View className="bg-white rounded-xl p-4">
                <TextInput
                  value={billData.title}
                  onChangeText={(text) => setBillData({ ...billData, title: text })}
                  placeholder="e.g., Electricity Bill"
                  className="text-gray-900 text-base"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Amount */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Total Amount
              </Text>
              <View className="bg-white rounded-xl p-4 flex-row items-center">
                <Text className="text-2xl font-bold text-gray-400 mr-2">₹</Text>
                <TextInput
                  value={billData.totalAmount}
                  onChangeText={(text) => setBillData({ ...billData, totalAmount: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="text-2xl font-bold text-gray-900 flex-1"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Category */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setBillData({ ...billData, category: cat.id })}
                      className={`bg-white rounded-xl p-3 mr-2 border-2 ${
                        billData.category === cat.id ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Text className="text-2xl mb-1">{cat.icon}</Text>
                      <Text className="text-xs font-medium text-gray-700">
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Due Date */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Due Date
              </Text>
              <View className="bg-white rounded-xl p-4">
                <TextInput
                  value={billData.dueDate}
                  onChangeText={(text) => setBillData({ ...billData, dueDate: text })}
                  placeholder="YYYY-MM-DD"
                  className="text-gray-900 text-base"
                  placeholderTextColor="#9ca3af"
                />
                <Text className="text-xs text-gray-500 mt-2">
                  Format: YYYY-MM-DD (e.g., 2024-12-31)
                </Text>
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </Text>
              <View className="bg-white rounded-xl p-4">
                <TextInput
                  value={billData.description}
                  onChangeText={(text) => setBillData({ ...billData, description: text })}
                  placeholder="Additional notes..."
                  className="text-gray-900 text-base"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Create Bill Button */}
            <TouchableOpacity
              onPress={handleCreateBill}
              disabled={loading}
              className={`${loading ? 'bg-gray-400' : 'bg-blue-500'} rounded-2xl py-4 flex-row items-center justify-center`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Upload size={20} color="white" />
              )}
              <Text className="text-white font-bold text-lg ml-2">
                {loading ? 'Creating...' : 'Create Bill'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Manual Entry Option */}
        {!capturedImage && (
          <View className="mx-4 mb-8">
            <TouchableOpacity
              onPress={() => router.push('/createBill')}
              className="bg-white border border-gray-200 rounded-2xl py-4"
            >
              <Text className="text-gray-700 font-semibold text-center">
                Or enter details manually →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ScanBill;
