import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function login() {
  return (
    <SafeAreaView className="bg-bg h-screen items-center justify-center">
      <View className="">
        <Text className="text-primary text-2xl font-bold">login</Text>
      </View>
      <TouchableOpacity
        className="bg-primary max-w-2xl"
        onPress={() => router.push("/signup")}
      >
        <Text className="text-white text-center">signUp</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
