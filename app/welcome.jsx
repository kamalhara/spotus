import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/ui/CustomButton";

export default function Welcome() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

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
  }, []);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(authenticated)/(tabs)/home" />;
  }

  return (
    <View className="bg-bg dark:bg-[#0F0F13] flex-1">
      <SafeAreaView className="flex-1 justify-between">
        {/* Brand */}
        <View className="mt-6 px-8">
          <View className="flex-row items-center">
            <Text className="text-secondary dark:text-gray-100 text-2xl font-extrabold tracking-tight">
              Spot Us
            </Text>
            <View className="w-2 h-2 rounded-full bg-primary ml-1.5 -mt-3" />
          </View>
        </View>

        {/* Hero */}
        <Animated.View
          className="items-center justify-center flex-1 my-4"
          style={{
            opacity: fadeInHero,
            transform: [{ scale: scaleHero }],
          }}
        >
          <View className="w-72 h-72 items-center justify-center bg-gray-50 dark:bg-[#1A1A22] rounded-[36px] border border-gray-100 dark:border-[#2A2A36]">
            <Image
              source={require("../assets/images/trans.png")}
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
          <View className="bg-surface-alt dark:bg-[#1A1A22] px-8 pt-10 pb-14 rounded-t-[36px]">
            <Text className="text-secondary dark:text-gray-100 text-[36px] font-extrabold leading-[42px] tracking-tight">
              Find People {"\n"}
              <Text className="text-primary">Nearby</Text>
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-[15px] mt-3 leading-6 mb-8">
              Join local rooms, chat, and connect with people around you in real
              time.
            </Text>

            <View className="gap-4">
              <CustomButton
                title="Get Started"
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
