import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import authAPI from '../store/api/authAPI';
import { clearError, login, setError, setLoading } from '../store/slices/authSlice';

const auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { status, isLoading, error } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (status) {
      router.replace("/(tabs)");
    }
  }, [status]);

  // Remove the error useEffect since we're handling errors in the try-catch blocks

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };

  const handleAuth = async () => {
    dispatch(clearError()); // Clear any previous errors
    
    if (isSignUp) {
      if (!userName || !email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return;
      }
      
      const userData = { 
        userName, 
        email, 
        password,
      };
      
      dispatch(setLoading(true));
      try{
        const response = await authAPI.register(userData);
        console.log("Registration successful:", response);
        
        // Dispatch login action after successful registration
        const user = response.data?.user || response.data?.data?.user;
        if (user) {
          dispatch(login({ userData: user }));
          Alert.alert("Success", "Account created successfully!");
        } else {
          dispatch(login({ userData: { userName, email } }));
          Alert.alert("Success", "Account created successfully!");
        }
      }
      catch(err){
        console.error("Registration error:", err);
        const errorMessage = err.response?.data?.message || err.message || "Registration failed";
        dispatch(setError(errorMessage));
        Alert.alert("Error", errorMessage);
      } finally {
        dispatch(setLoading(false));
      }
    } else {
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return;
      }
      
      const credentials = { email, password };
      
      dispatch(setLoading(true));
      try{
        const response = await authAPI.login(credentials);
        console.log("Login successful:", response);
        console.log("Response structure:", JSON.stringify(response, null, 2));
        
        // Check multiple possible response structures
        const userData = response.data?.user || response.user || response.data?.data?.user;
        console.log("User data:", userData);
        
        if (userData) {
          dispatch(login({ userData }));
          console.log("Dispatch completed");
          Alert.alert("Success", "Logged in successfully!");
        } else {
          // Even if no user data, try to dispatch and redirect
          dispatch(login({ userData: { email } }));
          console.log("Dispatch completed with fallback data");
          Alert.alert("Success", "Logged in successfully!");
        }
      }
      catch(err){
        console.error("Login error:", err);
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        dispatch(setError(errorMessage));
        Alert.alert("Error", errorMessage);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <Image
            source={require("../assets/images/logo.jpg")}
            className="w-48 h-24 mb-2"
            resizeMode="contain"
          />
        </View>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-center mb-3 text-gray-900">
            {isSignUp ? "Create an account" : "Welcome Back!"}
          </Text>
        </View>

        {isSignUp && (
          <View className="mb-6">
            <TextInput
              autoCapitalize="none"
              keyboardType="default"
              placeholder="Username"
              onChangeText={setUserName}
              value={userName}
              className="border rounded-lg border-gray-300 px-4 py-3 text-base text-gray-900"
            />
          </View>
        )}

        <View className="mb-6">
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email address"
            onChangeText={setEmail}
            value={email}
            className="border rounded-lg border-gray-300 px-4 py-3 text-base text-gray-900"
          />
        </View>

        <View className="mb-8">
          <TextInput
            autoCapitalize="none"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            className="border rounded-lg border-gray-300 px-4 py-3 text-base text-gray-900"
          />
        </View>

        {/* Error Message */}
        {error && (
          <View className="mb-4 p-3 bg-red-100 rounded-lg">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleAuth}
          disabled={isLoading}
          className={`py-4 rounded-lg mb-4 ${isLoading ? 'bg-gray-400' : 'bg-green-500'}`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isLoading ? 'Loading...' : (isSignUp ? "Sign Up" : "Login")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSwitchMode} className="mb-8">
          <Text className="text-green-900 text-center text-base">
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default auth;
