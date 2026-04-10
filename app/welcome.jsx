import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";

export default function Welcome() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(authenticated)/(tabs)/home" />;
  }

  return (
    <View className="bg-white flex-1">
      <SafeAreaView className="flex-1 justify-between">
        {/* Header section with brand name */}
        <View className="mt-6 px-8">
          <Text className="text-secondary text-3xl font-extrabold tracking-tight">
            Spot Us
          </Text>
        </View>

        {/* Hero section with logo */}
        <View className="items-center justify-center flex-1 my-4">
          <View className="w-80 h-80 items-center justify-center">
            <Image
              source={require("../assets/images/trans.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Sheet Section */}
        <View className="bg-[#FAFAFA] px-8 pt-10 pb-12 rounded-t-[40px] shadow-lg shadow-gray-400">
          <Text className="text-secondary text-4xl font-black leading-[44px]">
            Find People {"\n"}
            <Text className="text-primary">Nearby</Text>
          </Text>
          <Text className="text-gray-500 text-base mt-3 leading-6 mb-8">
            Join local rooms, chat, and connect with people around you in real time.
          </Text>

          {/* Button section */}
          <View className="gap-4">
            <CustomButton
              title="Get Started"
              onPress={() => router.push("/(auth)/signup")}
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="py-3 mt-1"
            >
              <View className="flex-row justify-center items-center gap-1">
                <Text className="text-gray-500 font-semibold text-base">
                  Already have an account?
                </Text>
                <Text className="text-primary font-bold text-base">Log In</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
