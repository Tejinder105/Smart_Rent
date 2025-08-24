import React, { useState, useEffect } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser, clearError } from '../store/slices/authSlice';
import { useRouter } from "expo-router";

const auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearError());
    }
  }, [error]);

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    dispatch(clearError());
  };

  const handleAuth = async () => {
    if (isSignUp) {
      // Registration validation
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
      
      dispatch(registerUser(userData));
      
    } else {
      // Login validation
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return;
      }
      
      const credentials = { email, password };
      dispatch(loginUser(credentials));
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
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        )}

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleAuth}
          className="bg-green-500 py-4 rounded-lg mb-4"
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isSignUp ? "Sign Up" : "Login"}
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
