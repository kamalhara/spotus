import { useAuth, useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Linking,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Oauth from "../../components/auth/Oauth";
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";
import GlassButton from "../../components/ui/GlassButton";
import SpotUsLoader from "../../components/ui/SpotUsLoader";
import { useTheme } from "../../context/ThemeContext";

export default function Login() {
  const { isLoaded } = useAuth();
  const { client, setActive } = useClerk();
  const signIn = client?.signIn;
  const router = useRouter();
  const { isDark } = useTheme();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Entrance animations
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

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      if (!signIn) {
        throw new Error("SignIn resource not available on the client");
      }

      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.warn("Sign in status not complete:", signInAttempt.status);
        setError(
          `Sign in failed: ${signInAttempt.status}. Please check your credentials.`,
        );
      }
    } catch (err) {
      console.error("Sign in error caught:", err);
      let errorMessage = "An error occurred during sign in.";
      if (err.errors) {
        err.errors.forEach((e, i) => {
          console.error(`Error ${i}: ${e.longMessage || e.message}`);
          if (e.code === "strategy_for_user_invalid") {
            errorMessage =
              "This login method is not enabled in your Clerk Dashboard. Ensure 'Email & Password' is enabled.";
          } else {
            errorMessage = e.longMessage || e.message;
          }
        });
      }
      setError(errorMessage);
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
            onPress={() => router.push("/")}
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
          <View className="mt-10 mb-10">
            <Text className="text-secondary dark:text-gray-100 text-[32px] font-display tracking-tight mb-2">
              Sign in
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-[15px] leading-6 font-body">
              See your rooms and messages.
            </Text>
          </View>

          <View className="mb-10 flex flex-col gap-6">
            <CustomInput
              label="Email Address"
              placeholder="example@gmail.com"
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Ionicons name="mail-outline" size={18} color="#9CA3AF" />}
            />

            <CustomInput
              label="Password"
              placeholder="••••••••"
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

            <TouchableOpacity
              className="self-end -mt-2"
              onPress={() =>
                router.push({
                  pathname: "/forgotPassword",
                  params: emailAddress.trim()
                    ? { email: emailAddress.trim() }
                    : {},
                })
              }
            >
              <Text className="text-primary font-medium text-[13px]">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {error ? (
              <View className="bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3 flex-row items-start">
                <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 8, marginTop: 1 }} />
                <Text className="text-red-500 text-[13px] flex-1 leading-5 font-medium">
                  {error}
                </Text>
              </View>
            ) : null}
          </View>

          <CustomButton
            title="Sign in"
            onPress={onSignInPress}
            loading={loading}
          />

          <View className="flex-row items-center justify-center gap-3 my-7">
            <View className="flex-1 h-px bg-border-light dark:bg-[#2A2A2E]" />
            <Text className="text-gray-300 dark:text-gray-600 text-[10px] font-medium uppercase tracking-widest">
              Or
            </Text>
            <View className="flex-1 h-px bg-border-light dark:bg-[#2A2A2E]" />
          </View>

          <Oauth />

          <View className="flex-row items-center justify-center gap-1.5 mt-2">
            <Text className="text-gray-400 dark:text-gray-500 text-[14px] font-body">
              Don&apos;t have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-primary dark:text-primary-light font-semibold text-[14px]">
                Create account
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-300 dark:text-gray-600 text-[11px] text-center mt-5 leading-4 font-body">
            By logging in, you agree to our{" "}
            <Text
              className="text-gray-400 dark:text-gray-500 font-semibold"
              onPress={() => Linking.openURL("https://spotus.app/terms")}
            >
              Terms
            </Text>
            ,{" "}
            <Text
              className="text-gray-400 dark:text-gray-500 font-semibold"
              onPress={() => Linking.openURL("https://spotus.app/privacy")}
            >
              Privacy Policy
            </Text>
            , and{" "}
            <Text
              className="text-gray-400 dark:text-gray-500 font-semibold"
              onPress={() => Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}
            >
              EULA
            </Text>
          </Text>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
