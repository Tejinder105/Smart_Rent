import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "coral", headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Home" }}
      />
    </Tabs>
  );
}
