import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/ui/CustomButton";

export default function Welcome() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animations
  const fadeInContent = useRef(new Animated.Value(0)).current;
  const slideUpContent = useRef(new Animated.Value(30)).current;
  const fadeInHero = useRef(new Animated.Value(0)).current;
  const scaleHero = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeInHero, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleHero, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
          bounciness: 6,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeInContent, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpContent, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeInContent, fadeInHero, scaleHero, slideUpContent]);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(authenticated)/(tabs)/home" />;
  }

  return (
    <View className="bg-bg dark:bg-[#111112] flex-1">
      <SafeAreaView className="flex-1 justify-between">
        {/* Brand */}
        <View className="mt-6 px-8">
          <Text className="text-secondary dark:text-gray-100 text-2xl font-heading tracking-tight">
            Spot Us
          </Text>
          <Text className="text-muted text-[13px] mt-1 font-body">
            Nearby rooms with a timer
          </Text>
        </View>

        {/* Hero */}
        <Animated.View
          className="items-center justify-center flex-1 my-2 px-8"
          style={{
            opacity: fadeInHero,
            transform: [{ scale: scaleHero }],
          }}
        >
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
        </Animated.View>

        {/* Bottom */}
        <Animated.View
          style={{
            opacity: fadeInContent,
            transform: [{ translateY: slideUpContent }],
          }}
        >
          <View className="bg-surface-alt dark:bg-[#1A1A1E] px-8 pt-10 pb-14 rounded-t-[28px]">
            <Text className="text-secondary dark:text-gray-100 text-[34px] font-display leading-[40px] tracking-tight">
              Local rooms,{"\n"}while they are{" "}
              <Text className="text-primary">active</Text>
            </Text>
            <Text className="text-muted text-[15px] mt-4 leading-6 mb-8 font-body">
              Browse by radius and category, then join with location or an
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
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
