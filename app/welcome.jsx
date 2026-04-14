import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { useRef, useEffect } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";

export default function Welcome() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 6,
      }),
    ]).start();
  }, []);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(authenticated)/(tabs)/home" />;
  }

  return (
    <View className="bg-white flex-1">
      <SafeAreaView className="flex-1 justify-between">
        {/* Header section with brand name */}
        <Animated.View className="mt-6 px-8" style={{ opacity: fadeAnim }}>
          <View className="flex-row items-center">
            <Text className="text-secondary text-3xl font-black tracking-tight">
              Spot Us
            </Text>
            <View className="w-2.5 h-2.5 rounded-full bg-primary ml-1.5 -mt-2" />
          </View>
        </Animated.View>

        {/* Hero section with logo */}
        <Animated.View
          className="items-center justify-center flex-1 my-4"
          style={{ transform: [{ scale: logoScale }], opacity: fadeAnim }}
        >
          <View className="w-80 h-80 items-center justify-center">
            <Image
              source={require("../assets/images/trans.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Bottom Sheet Section */}
        <Animated.View
          className="bg-bg px-8 pt-10 pb-14 rounded-t-[36px]"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-secondary text-[38px] font-black leading-[44px] tracking-tight">
            Find People {"\n"}
            <Text className="text-primary">Nearby</Text>
          </Text>
          <Text className="text-muted text-[16px] mt-4 leading-[24px] mb-9 font-medium">
            Join local rooms, chat, and connect with people around you in real
            time.
          </Text>

          {/* Button section */}
          <View className="gap-4">
            <CustomButton
              title="Get Started"
              size="lg"
              onPress={() => router.push("/(auth)/signup")}
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="py-3.5 mt-1"
            >
              <View className="flex-row justify-center items-center gap-1.5">
                <Text className="text-muted font-semibold text-[15px]">
                  Already have an account?
                </Text>
                <Text className="text-primary font-black text-[15px]">
                  Log In
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
