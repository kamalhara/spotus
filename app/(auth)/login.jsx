import { useAuth, useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  console.log("Clerk loaded?", isLoaded);
  const onSignInPress = async () => {
    if (!isLoaded) return console.log("Clerk is not loaded");

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
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading authentication...</Text>
      </SafeAreaView>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-bg h-screen px-7">
      <View className=" justify-center mt-10 mb-10">
        <Text className="text-primary text-2xl font-bold">Spot Us</Text>
      </View>

      <View className="mb-10">
        <Text className="text-2xl font-bold mb-2">Welcome Back!</Text>
        <Text className="text-gray-500">Sign in to your account</Text>
      </View>

      <View className="mb-10 flex flex-col gap-5">
        <View className="flex flex-col gap-1">
          <Text className="uppercase text-sm tracking-wider text-gray-600">
            Email
          </Text>
          <TextInput
            className="bg-gray-200 rounded-lg py-4 px-3"
            placeholder="example@gmail.com"
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="flex flex-col gap-1">
          <Text className="uppercase text-sm tracking-wider text-gray-600">
            Password
          </Text>
          <TextInput
            className="bg-gray-200 rounded-lg py-4 px-3"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {error ? <Text className="text-red-500">{error}</Text> : null}
      </View>

      <View>
        <Pressable
          disabled={loading}
          onPress={onSignInPress}
          className={`bg-primary px-10 py-4 rounded-2xl w-full flex-row justify-center items-center ${loading ? "opacity-70" : "active:opacity-80"}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Login
            </Text>
          )}
        </Pressable>
      </View>

      <View className="flex flex-row items-center justify-center gap-2 my-6">
        <View className="w-1/3 h-0.5 bg-gray-300"></View>
        <Text className="text-gray-500">Or continue with</Text>
        <View className="w-1/3 h-0.5 bg-gray-300"></View>
      </View>

      <Oauth />

      <View className="flex flex-row items-center justify-center gap-1 mt-6">
        <Text className="text-gray-600">Don&apos;t have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
          <Text className="text-primary font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
