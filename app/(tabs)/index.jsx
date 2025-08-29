import { Text, View,Image } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View className="items-center mb-8">
          <Image
            source={require("../../assets/images/logo.jpg")}
            className="w-48 h-24 mb-2"
            resizeMode="contain"
          />
        </View>
      <Text>Welcome to Smart Rent! You are logged in.</Text>
    </View>
  );
}
