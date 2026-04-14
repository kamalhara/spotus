import { useAuth, useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import Oauth from "../../components/Oauth";

export default function Login() {
  const { isLoaded } = useAuth();
  const { client, setActive } = useClerk();
  const signIn = client?.signIn;
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <View className="mt-8 mb-10">
          <Text className="text-secondary text-[32px] font-bold tracking-tight mb-1">
            Welcome{"\n"}Back
          </Text>
          <Text className="text-gray-400 text-base leading-6 mt-2">
            Sign in to your account and continue your journey.
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
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            }
          />

          <TouchableOpacity className="self-end -mt-2">
            <Text className="text-primary font-medium text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {error ? (
            <Text className="text-red-500 text-sm ml-1">{error}</Text>
          ) : null}
        </View>

        <CustomButton
          title="Login"
          onPress={onSignInPress}
          loading={loading}
        />

        <View className="flex-row items-center justify-center gap-3 my-7">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-400 text-sm">Or</Text>
          <View className="flex-1 h-px bg-gray-200" />
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
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
