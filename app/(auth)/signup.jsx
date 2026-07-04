import { useAuth, useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";
import GlassButton from "../../components/ui/GlassButton";
import { useTheme } from "../../context/ThemeContext";
import SpotUsLoader from "../../components/ui/SpotUsLoader";

export default function SignUp() {
  const { isLoaded } = useAuth();
  const { client, setActive } = useClerk();
  const signUp = client?.signUp;
  const router = useRouter();
  const { isDark } = useTheme();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Entrance animation
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, slideUp]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    try {
      await signUp.create({ emailAddress, password, firstName, lastName });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(authenticated)/(tabs)/home");
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-bg dark:bg-[#111112]">
        <SpotUsLoader size="large" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-bg dark:bg-[#111112] flex-1 px-8">
        <View className="flex-row items-center mt-4">
          <GlassButton
            onPress={() =>
              pendingVerification
                ? setPendingVerification(false)
                : router.back()
            }
            className="w-10 h-10 bg-gray-50 dark:bg-[#1A1A1E] rounded-full items-center justify-center border border-gray-100 dark:border-[#2A2A2E]"
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "white" : "black"}
            />
          </GlassButton>
        </View>

        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          }}
        >
          <View className="mb-8 mt-10">
            {/* Step indicator — text style instead of colored bars */}
            <Text className="text-muted text-[12px] font-medium mb-3">
              Step {pendingVerification ? "2" : "1"} of 2
            </Text>

            <Text className="text-secondary dark:text-gray-100 text-[32px] font-display tracking-tight mb-2">
              {pendingVerification ? "Verify Email" : "Create\nAccount"}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-[15px] leading-6 font-body">
              {pendingVerification
                ? `Enter the code sent to ${emailAddress}`
                : "Create an account to join rooms near you."}
            </Text>
          </View>

          {!pendingVerification ? (
            <View className="gap-6">
              <CustomInput
                label="Full Name"
                placeholder="e.g. Alexandria"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                icon={
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                }
              />
              <CustomInput
                label="Email Address"
                placeholder="example@gmail.com"
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                }
              />
              <CustomInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#9CA3AF"
                  />
                }
              />

              {error ? (
                <View className="bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3 flex-row items-start">
                  <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 8, marginTop: 1 }} />
                  <Text className="text-red-500 text-[13px] flex-1 leading-5 font-medium">
                    {error}
                  </Text>
                </View>
              ) : null}

              <View className="mt-2">
                <CustomButton
                  title="Sign Up"
                  onPress={onSignUpPress}
                  loading={loading}
                />
              </View>
            </View>
          ) : (
            <View className="gap-6">
              <CustomInput
                label="Verification Code"
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                icon={
                  <Ionicons name="keypad-outline" size={18} color="#9CA3AF" />
                }
              />
              {error ? (
                <View className="bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3 flex-row items-start">
                  <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 8, marginTop: 1 }} />
                  <Text className="text-red-500 text-[13px] flex-1 leading-5 font-medium">
                    {error}
                  </Text>
                </View>
              ) : null}
              <CustomButton
                title="Verify & Join"
                onPress={onPressVerify}
                loading={loading}
              />
              <CustomButton
                title="Cancel"
                type="ghost"
                onPress={() => setPendingVerification(false)}
              />
            </View>
          )}

          <View className="flex-row items-center justify-center gap-1.5 mt-8">
            <Text className="text-gray-400 dark:text-gray-500 text-[14px] font-body">
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-primary dark:text-primary-light font-semibold text-[14px]">
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
