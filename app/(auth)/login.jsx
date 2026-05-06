import { useAuth, useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Oauth from "../../components/auth/Oauth";
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";

export default function Login() {
  const { isLoaded } = useAuth();
  const { client, setActive } = useClerk();
  const signIn = client?.signIn;
  const router = useRouter();

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
  }, []);

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
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-white flex-1 px-8">
        <View className="flex-row items-center mt-4">
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          }}
        >
          <View className="mt-8 mb-10">
            <Text className="text-secondary text-[32px] font-bold tracking-tight mb-1">
              Welcome{"\n"}Back
            </Text>
            {/* Accent line */}
            <View className="mt-3 mb-3 w-12 h-1 rounded-full bg-primary" />
            <Text className="text-gray-400 text-base leading-6">
              Sign in to continue where you left off.
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
              icon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
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
                  size={20}
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
              <Text className="text-primary font-medium text-sm">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {error ? (
              <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex-row items-start">
                <View className="w-5 h-5 bg-red-100 rounded-full items-center justify-center mr-2.5 mt-0.5">
                  <Ionicons name="alert-circle" size={12} color="#EF4444" />
                </View>
                <Text className="text-red-500 text-sm flex-1 leading-5">
                  {error}
                </Text>
              </View>
            ) : null}
          </View>

          <CustomButton
            title="Login"
            onPress={onSignInPress}
            loading={loading}
          />

          <View className="flex-row items-center justify-center gap-3 my-7">
            <View className="flex-1 h-px bg-gray-100" />
            <Text className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
              Or
            </Text>
            <View className="flex-1 h-px bg-gray-100" />
          </View>

          <Oauth />

          <View className="flex-row items-center justify-center gap-1.5 mt-4">
            <Text className="text-gray-400 text-[15px]">
              Don&apos;t have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-primary font-semibold text-[15px]">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
