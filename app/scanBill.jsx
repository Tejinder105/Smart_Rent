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
    Wifi,
    WifiOff,
    XCircle
} from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Card,
    CategorySelector,
    Input,
    PageHeader
} from '../components/ui';
import { scanBill } from '../store/slices/billSlice';
import { createUnifiedExpense, invalidateCache } from '../store/slices/expenseUnifiedSlice';
import { checkBackendConnection, showNetworkErrorAlert } from '../utils/networkUtils';

const ScanBill = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { scannedBillData, loading } = useSelector((state) => state.bill);
  const { createLoading } = useSelector((state) => state.expenseUnified);
  const { currentFlat } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isBackendReachable, setIsBackendReachable] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);

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
    { id: 'utilities', name: 'Utilities', icon: <Text>⚡</Text>, color: '#fef3c7' },
    { id: 'groceries', name: 'Groceries', icon: <Text>🛒</Text>, color: '#dcfce7' },
    { id: 'internet', name: 'Internet', icon: <Text>📶</Text>, color: '#dbeafe' },
    { id: 'maintenance', name: 'Maintenance', icon: <Text>🔧</Text>, color: '#e0e7ff' },
    { id: 'rent', name: 'Rent', icon: <Text>🏠</Text>, color: '#fce7f3' },
    { id: 'other', name: 'Other', icon: <Text>📋</Text>, color: '#f3f4f6' }
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

  const handleCapture = async () => {
    if (!cameraRef) {
      Alert.alert('Error', 'Camera not ready. Please try again.');
      return;
    }

    try {
      console.log('📸 Taking picture...');
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      console.log('✅ Picture taken:', photo.uri);
      setCapturedImage({ uri: photo.uri });
      setShowCamera(false);
      handleScanImage({ uri: photo.uri });
    } catch (error) {
      console.error('❌ Failed to capture photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleScanImage = async (image) => {
    if (!image?.uri) return;

    // Check backend connection first
    console.log('🔍 Checking backend connection...');
    const isConnected = await checkBackendConnection();
    setConnectionChecked(true);
    setIsBackendReachable(isConnected);

    if (!isConnected) {
      console.error('❌ Backend not reachable');
      showNetworkErrorAlert('Scan bill');
      return;
    }

    setScanning(true);
    try {
      // Create image file object for API
      const filename = image.uri.split('/').pop() || 'bill.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const imageFile = {
        uri: image.uri,
        name: filename,
        type: type,
      };

      console.log('📤 Sending image to OCR:', { filename, type });
      const result = await dispatch(scanBill(imageFile)).unwrap();

      console.log('🔍 Full OCR Response:', JSON.stringify(result, null, 2));

      // Auto-fill form with OCR results
      // Backend returns: { statusCode, data: { imageUrl, success, rawText, parsedData: { vendor, amount, date, category } }, message, success }
      if (result?.data) {
        console.log('📦 Result.data:', result.data);
        console.log('✅ OCR Success:', result.data.success);
        console.log('📄 Raw Text Length:', result.data.rawText?.length || 0);
        console.log('📊 Parsed Data:', result.data.parsedData);
        
        const { parsedData, rawText, success: ocrSuccess } = result.data;
        
        // Check if OCR actually succeeded
        if (!ocrSuccess) {
          console.error('❌ OCR processing failed on backend');
          Alert.alert(
            'OCR Failed',
            'Text extraction from image failed. The image might be unclear or corrupted. Please try again with a clearer photo.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Check if we have any text extracted
        if (!rawText || rawText.trim().length === 0) {
          console.warn('⚠️ No text extracted from image');
          Alert.alert(
            'No Text Found',
            'Could not extract any text from the image. Please ensure:\n\n' +
            '• Bill is clearly visible\n' +
            '• Good lighting\n' +
            '• Text is not blurry\n' +
            '• Image is not too dark',
            [{ text: 'OK' }]
          );
          return;
        }
        
        console.log('📝 Extracted text preview:', rawText.substring(0, 200));
        
        if (parsedData && (parsedData.vendor || parsedData.amount)) {
          console.log('✅ Successfully parsed bill data:', parsedData);
          
          setBillData({
            title: parsedData.vendor || 'Scanned Bill',
            description: parsedData.vendor ? `Bill from ${parsedData.vendor}` : 'Scanned bill',
            totalAmount: parsedData.amount?.toString() || '',
            category: parsedData.category || 'utilities',
            dueDate: parsedData.date ? new Date(parsedData.date).toISOString().split('T')[0] : '',
            splitBetween: []
          });

          Alert.alert(
            '✨ Scan Complete!',
            `Bill details extracted successfully!\n\n` +
            `Vendor: ${parsedData.vendor || 'Not detected'}\n` +
            `Amount: ₹${parsedData.amount || 'Not detected'}\n` +
            `Category: ${parsedData.category || 'other'}\n\n` +
            `Please review and edit if needed.`,
            [{ text: 'OK' }]
          );
        } else {
          console.warn('⚠️ Text extracted but parsing failed');
          console.log('Raw text:', rawText);
          Alert.alert(
            'Partial Scan',
            'Text was extracted from the bill but specific details (vendor/amount) could not be identified.\n\n' +
            `Extracted ${rawText.length} characters of text.\n\n` +
            'Please enter details manually.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.warn('⚠️ Unexpected response format:', result);
        Alert.alert(
          'Scan Completed',
          'Bill scanned but details could not be extracted. Please enter details manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      
      // Check if it's a network error
      if (error?.message?.includes('Network Error') || error?.message?.includes('connect')) {
        showNetworkErrorAlert('Scan bill');
      } else {
        Alert.alert(
          'Scan Failed',
          error?.message || 'Failed to scan bill. You can enter details manually.',
          [{ text: 'OK' }]
        );
      }
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
      const expenseData = {
        flatId: currentFlat?._id,
        type: 'shared', // 'shared' for bills
        title: billData.title,
        description: billData.description,
        totalAmount: parseFloat(billData.totalAmount),
        category: billData.category,
        dueDate: billData.dueDate,
        splitMethod: 'equal',
        participants: billData.splitBetween.length > 0 
          ? billData.splitBetween.map(id => ({ userId: id }))
          : [{ userId: userData._id }],
        imageUrl: capturedImage?.uri // Include scanned image
      };

      await dispatch(createUnifiedExpense(expenseData)).unwrap();
      dispatch(invalidateCache());

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
          onCameraReady={() => console.log('📷 Camera ready')}
          ref={(ref) => setCameraRef(ref)}
        >
          <View className="flex-1 justify-between pt-12">
            {/* Camera Header */}
            <View className="px-4 py-4">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  setShowCamera(false);
                  setCameraRef(null);
                }}
                leftIcon={<ChevronLeft size={24} color="white" />}
                className="bg-black/50"
              />
            </View>

            {/* Camera Instructions */}
            <View className="px-4 pb-32">
              <View className="bg-black/70 rounded-2xl p-4 mb-6">
                <Text className="text-white text-center font-semibold mb-2">
                  📸 Position Bill in Frame
                </Text>
                <Text className="text-white/80 text-center text-sm">
                  Make sure all text is clearly visible, then tap the button below
                </Text>
              </View>

              {/* Capture Button */}
              <TouchableOpacity
                onPress={handleCapture}
                className="bg-white rounded-full w-20 h-20 items-center justify-center self-center shadow-lg"
              >
                <View className="bg-blue-500 rounded-full w-16 h-16 items-center justify-center">
                  <Camera size={32} color="white" />
                </View>
              </TouchableOpacity>
              <Text className="text-white text-center font-semibold mt-3">
                Tap to Capture
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <PageHeader
        title="🤖 Scan Bill"
        subtitle="AI-powered bill scanning with OCR"
        leftAction={
          <Button
            variant="ghost"
            size="sm"
            onPress={handleGoBack}
            leftIcon={<ChevronLeft size={24} color="#374151" />}
          />
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Connection Status Banner */}
        {connectionChecked && (
          <Card variant="outline" className={`mx-4 mt-4 ${isBackendReachable ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200'} flex-row items-center`}>
            {isBackendReachable ? (
              <>
                <Wifi size={18} color="#00C471" />
                <Text className="text-success-800 text-sm font-medium ml-2 flex-1">
                  ✅ Connected to backend server
                </Text>
              </>
            ) : (
              <>
                <WifiOff size={18} color="#ef4444" />
                <View className="flex-1 ml-2">
                  <Text className="text-danger-800 text-sm font-semibold">
                    ⚠️ Backend server unreachable
                  </Text>
                  <Text className="text-danger-600 text-xs mt-1">
                    OCR scanning requires backend connection
                  </Text>
                </View>
              </>
            )}
          </Card>
        )}

        {/* Scan Options */}
        {!capturedImage && (
          <View className="mx-4 mt-6 mb-4">
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 mb-4">
              <View className="flex-row items-center mb-3">
                <Sparkles size={24} color="#8b5cf6" />
                <Text className="text-purple-900 font-bold text-lg ml-2">
                  AI Bill Scanner
                </Text>
              </View>
              <Text className="text-purple-700 text-sm">
                Automatically extract bill details using advanced OCR technology. Just snap a photo or upload an image!
              </Text>
            </Card>

            <View className="flex-row gap-3">
              <Card
                variant="interactive"
                onPress={handleTakePhoto}
                className="flex-1 bg-primary-500 items-center"
              >
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-3">
                  <Camera size={32} color="#3b82f6" />
                </View>
                <Text className="text-white font-bold text-base">
                  Take Photo
                </Text>
                <Text className="text-primary-100 text-xs mt-1">
                  Capture with camera
                </Text>
              </Card>

              <Card
                variant="interactive"
                onPress={handlePickImage}
                className="flex-1 bg-success-500 items-center"
              >
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-3">
                  <ImageIcon size={32} color="#00C471" />
                </View>
                <Text className="text-white font-bold text-base">
                  Upload Image
                </Text>
                <Text className="text-success-100 text-xs mt-1">
                  Choose from gallery
                </Text>
              </Card>
            </View>
          </View>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <View className="mx-4 mt-6 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Captured Bill
            </Text>
            <Card className="bg-white relative">
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
            </Card>
          </View>
        )}

        {/* Bill Details Form */}
        {capturedImage && !scanning && (
          <View className="mx-4 mb-6">
            <Card variant="outline" className="bg-success-50 border-success-200 mb-4 flex-row items-center">
              <CheckCircle size={18} color="#00C471" />
              <Text className="flex-1 text-success-800 text-sm font-medium ml-2">
                ✨ Details extracted! Review and edit below
              </Text>
            </Card>

            <Input
              label="Bill Title"
              value={billData.title}
              onChangeText={(text) => setBillData({ ...billData, title: text })}
              placeholder="e.g., Electricity Bill"
              className="mb-4"
            />

            <Input
              label="Total Amount"
              value={billData.totalAmount}
              onChangeText={(text) => setBillData({ ...billData, totalAmount: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
              leftIcon={<Text className="text-2xl font-bold text-gray-400">₹</Text>}
              className="mb-4"
            />

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Category
              </Text>
              <CategorySelector
                categories={categories}
                selectedId={billData.category}
                onSelect={(id) => setBillData({ ...billData, category: id })}
                columns={3}
              />
            </View>

            <Input
              label="Due Date"
              value={billData.dueDate}
              onChangeText={(text) => setBillData({ ...billData, dueDate: text })}
              placeholder="YYYY-MM-DD"
              helperText="Format: YYYY-MM-DD (e.g., 2024-12-31)"
              className="mb-4"
            />

            <Input
              label="Description (Optional)"
              value={billData.description}
              onChangeText={(text) => setBillData({ ...billData, description: text })}
              placeholder="Additional notes..."
              multiline
              numberOfLines={3}
              className="mb-6"
            />

            <Button
              variant="primary"
              size="lg"
              onPress={handleCreateBill}
              disabled={createLoading}
              loading={createLoading}
              leftIcon={<Upload size={20} color="white" />}
            >
              Create Bill
            </Button>
          </View>
        )}

        {/* Manual Entry Option */}
        {!capturedImage && (
          <View className="mx-4 mb-8">
            <Button
              variant="outline"
              size="lg"
              onPress={() => router.push('/createBill')}
            >
              Or enter details manually →
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ScanBill;
