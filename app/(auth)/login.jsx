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
        <Text className="text-muted mt-3 font-medium">
          Loading authentication...
        </Text>
      </SafeAreaView>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-white flex-1 px-8">
        <View className="flex-row items-center mt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-surface-alt rounded-2xl items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#18181B" />
          </TouchableOpacity>
        </View>

        <View className="mt-10 mb-10">
          <View className="flex-row items-center mb-2">
            <Text className="text-secondary text-[36px] font-black tracking-tight leading-[42px]">
              Welcome{"\n"}Back
            </Text>
          </View>
          <Text className="text-muted text-[16px] leading-6 mt-2 font-medium">
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
            icon={<Ionicons name="mail-outline" size={20} color="#94A3B8" />}
          />

          <CustomInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
            }
          />

          {/* Forgot Password Link */}
          <TouchableOpacity className="self-end -mt-2">
            <Text className="text-primary font-bold text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {error ? (
            <View className="bg-danger/8 border border-danger/20 px-4 py-3.5 rounded-2xl flex-row items-center">
              <View className="w-8 h-8 bg-danger/15 rounded-xl items-center justify-center mr-3">
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
              </View>
              <Text className="text-danger text-sm font-medium flex-1">
                {error}
              </Text>
            </View>
          ) : null}
        </View>

        <View>
          <CustomButton
            title="Login"
            onPress={onSignInPress}
            loading={loading}
          />
        </View>

        <View className="flex flex-row items-center justify-center gap-3 my-7">
          <View className="flex-1 h-[1px] bg-border" />
          <Text className="text-muted text-sm font-semibold">
            Or continue with
          </Text>
          <View className="flex-1 h-[1px] bg-border" />
        </View>

        <Oauth />

        <View className="flex flex-row items-center justify-center gap-1.5 mt-4">
          <Text className="text-muted font-medium text-[15px]">
            Don&apos;t have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-primary font-black text-[15px]">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
