import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Card,
  Input
} from '../components/ui';
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


  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };

  const handleAuth = async () => {
    dispatch(clearError()); 
    
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
        console.log("✅ Registration successful:", response);
        
        // Wait a bit for AsyncStorage to finish writing the tokens
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
        console.error("❌ Registration error:", err);
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
        console.log("✅ Login successful:", response);
        
        // Wait a bit for AsyncStorage to finish writing the tokens
        // This ensures the axios interceptor can read the token properly
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const userData = response.data?.user || response.user || response.data?.data?.user;
        console.log("User data:", userData);
        
        if (userData) {
          dispatch(login({ userData }));
          console.log("✅ Dispatch completed, navigating...");
          Alert.alert("Success", "Logged in successfully!");
        } else {
          dispatch(login({ userData: { email } }));
          console.log("✅ Dispatch completed with fallback data");
          Alert.alert("Success", "Logged in successfully!");
        }
      }
      catch(err){
        console.error("❌ Login error:", err);
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
      <ScrollView
        contentContainerStyle={{ paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className="px-6 pt-12">
          <View className="items-center mb-8">
            <Image
              source={require("../assets/images/logo.png")}
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
            <Input
              autoCapitalize="none"
              keyboardType="default"
              placeholder="Username"
              onChangeText={setUserName}
              value={userName}
              className="mb-6"
            />
          )}

          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email address"
            onChangeText={setEmail}
            value={email}
            className="mb-6"
            returnKeyType="next"
          />

          <Input
            autoCapitalize="none"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            className="mb-8"
            returnKeyType="done"
            onSubmitEditing={handleAuth}
          />

          {/* Error Message */}
          {error && (
            <Card variant="outline" className="mb-4 bg-danger-50 border-danger-200">
              <Text className="text-danger-600 text-center">{error}</Text>
            </Card>
          )}

          {/* Login Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleAuth}
            disabled={isLoading}
            loading={isLoading}
            className="mb-4"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onPress={handleSwitchMode}
            className="mb-8"
          >
            <Text className="text-primary-600 text-center text-base">
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default auth;
