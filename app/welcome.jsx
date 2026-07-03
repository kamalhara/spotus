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
    // Staggered entrance animations
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
    <View className="bg-bg dark:bg-[#111113] flex-1">
      <SafeAreaView className="flex-1 justify-between">
        {/* Brand */}
        <View className="mt-6 px-8">
          <View className="flex-row items-center">
            <Text className="text-secondary dark:text-gray-100 text-2xl font-display tracking-tight">
              Spot Us
            </Text>
            <View className="w-2 h-2 rounded-full bg-primary ml-1.5 -mt-3" />
          </View>
          <Text className="text-muted text-[13px] mt-1 tracking-wide">
            Find Your Crowd Nearby
          </Text>
        </View>

        {/* Hero */}
        <Animated.View
          className="items-center justify-center flex-1 my-4"
          style={{
            opacity: fadeInHero,
            transform: [{ scale: scaleHero }],
          }}
        >
          <View className="w-72 h-72 items-center justify-center  rounded-[36px]">
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
        </Animated.View>

        {/* Bottom */}
        <Animated.View
          style={{
            opacity: fadeInContent,
            transform: [{ translateY: slideUpContent }],
          }}
        >
          <View className="bg-surface-alt dark:bg-[#1C1C20] px-8 pt-10 pb-14 rounded-t-[36px]">
            <Text className="text-secondary dark:text-gray-100 text-[36px] font-display leading-[42px] tracking-tight">
              See what&apos;s{"\n"}happening{" "}
              <Text className="text-primary">around you</Text>
            </Text>
            <Text className="text-muted text-[15px] mt-3 leading-6 mb-8">
              Real conversations about real things, with real people nearby.
            </Text>

            <View className="gap-4">
              <CustomButton
                title="Jump in"
                onPress={() => router.push("/(auth)/signup")}
              />

              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                className="py-3 mt-1"
              >
                <View className="flex-row justify-center items-center gap-1.5">
                  <Text className="text-gray-400 dark:text-gray-500 text-[15px]">
                    Already have an account?
                  </Text>
                  <Text className="text-primary dark:text-primary-light font-bold text-[15px]">
                    Log In
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
