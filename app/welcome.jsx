import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/ui/CustomButton";

export default function Welcome() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(authenticated)/(tabs)/home" />;
  }

  return (
    <View className="bg-bg dark:bg-[#111112] flex-1">
      <SafeAreaView className="flex-1 justify-between">
        {/* Brand */}
        <View className="mt-6 px-8">
          <Text className="text-secondary dark:text-gray-100 text-2xl font-heading tracking-tight">
            SpotUs
          </Text>
        </View>

        {/* Hero */}
        <View className="items-center justify-center flex-1 my-2 px-8">
          <View className="w-44 h-44 items-center justify-center mb-5">
            <Image
              source={
                isDark
                  ? require("../assets/images/logo-dark.png")
                  : require("../assets/images/logo-light.png")
              }
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <View className="w-full bg-white dark:bg-[#1A1A1E] border border-border-light dark:border-[#2A2A2E] rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-xl bg-primary-surface items-center justify-center mr-2.5">
                  <Ionicons name="calendar" size={15} color="#FF6B47" />
                </View>
                <View>
                  <Text className="text-secondary dark:text-gray-100 font-heading text-[15px] tracking-tight">
                    Sunset walk
                  </Text>
                  <Text className="text-muted text-[11px] font-body mt-0.5">
                    Local Events
                  </Text>
                </View>
              </View>
              <Text className="text-primary text-[11px] font-heading">
                3h left
              </Text>
            </View>
            <View className="flex-row items-center justify-between pt-3 border-t border-border-light dark:border-[#2A2A2E]">
              <Text className="text-gray-400 dark:text-gray-500 text-[12px] font-medium">
                4 here / 2.1 km
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="key-outline" size={12} color="#9CA3AF" />
                <Text className="text-gray-400 dark:text-gray-500 text-[12px] font-medium ml-1">
                  Invite ready
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom */}
        <View>
          <View className="bg-surface-alt dark:bg-[#1A1A1E] px-8 pt-10 pb-14 rounded-t-[28px]">
            <Text className="text-secondary dark:text-gray-100 text-[34px] font-display leading-[40px] tracking-tight">
              Where locals{" "}
              <Text className="text-primary dark:text-primary-light">
                Connect
              </Text>
            </Text>
            <Text className="text-muted text-[15px] mt-4 leading-6 mb-8 font-body">
              Browse by distance and topic, or join a private room with an
              invite code.
            </Text>

            <View className="gap-4">
              <CustomButton
                title="Create account"
                onPress={() => router.push("/(auth)/signup")}
              />

              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                className="py-3 mt-1"
              >
                <View className="flex-row justify-center items-center gap-1.5">
                  <Text className="text-gray-400 dark:text-gray-500 text-[14px] font-body">
                    Already have an account?
                  </Text>
                  <Text className="text-primary dark:text-primary-light font-semibold text-[14px]">
                    Sign in
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
