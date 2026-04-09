import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Oauth from "../../components/Oauth";

export default function Login() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/");
      } else {
        console.error("Login incomplete: ", signInAttempt);
      }
    } catch (err) {
      console.error("Login error:", JSON.stringify(err, null, 2));
      alert(err.errors?.[0]?.message || err.message);
    }
  };

  return (
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
      </View>

      <View>
        <TouchableOpacity
          className="bg-primary px-10 py-4 rounded-2xl w-full"
          onPress={onSignInPress}
        >
          <Text className="text-white text-center font-bold text-lg">
            Login
          </Text>
        </TouchableOpacity>
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
  );
}
