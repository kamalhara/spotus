import { Redirect, useRouter } from "expo-router";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";

export default function Welcome() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(home)" />;
  }

  return (
    <SafeAreaView className="bg-bg flex-1 px-8 justify-between pb-10">
      {/* Header section with brand name */}
      <View className="mt-4">
        <Text className="text-secondary text-3xl font-extrabold tracking-tight">
          Spot Us
        </Text>
      </View>

      {/* Hero section with logo */}
      <View className="items-center justify-center">
        <View className="w-64 h-64 items-center justify-center">
          <Image
            source={require("../assets/images/trans.png")}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content section */}
      <View>
        <Text className="text-secondary text-4xl font-bold leading-tight">
          Find People {"\n"}
          <Text className="text-primary">Nearby</Text>
        </Text>
        <Text className="text-gray-500 text-lg mt-4 leading-6">
          Join local rooms, chat, and connect with people around you.
        </Text>
      </View>

      {/* Button section */}
      <View className="gap-4">
        <Pressable
          onPress={() => router.push("/(auth)/signup")}
          className="bg-primary py-4 rounded-2xl shadow-lg active:opacity-90"
        >
          <Text className="text-white text-center font-bold text-lg">
            Get Started
          </Text>
        </Pressable>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="py-2"
        >
          <View className="flex-row justify-center items-center gap-1">
            <Text className="text-gray-600 font-semibold">
              Already have an account?
            </Text>
            <Text className="text-primary font-bold">Log In</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
