import { useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Oauth from "../../components/Oauth";

export default function SignUp() {
  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  const router = useRouter();

  const { isLoaded, signUp, setActive } = useSignUp();

  const handleSubmit = async () => {
    if (!isLoaded) return;

    try {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Clerk calls this `create` instead of `password`
      await signUp.create({
        emailAddress,
        password,
      });

      // Prepare the email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (error) {
      console.error("Sign up error:", JSON.stringify(error, null, 2));
      alert(error.errors?.[0]?.message || error.message);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        // Log the user in and set the active session
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
      } else {
        console.error("Sign-up attempt not complete:", completeSignUp);
      }
    } catch (error) {
      console.error("Verification error:", JSON.stringify(error, null, 2));
      alert(error.errors?.[0]?.message || error.message);
    }
  };

  return (
    <SafeAreaView className="bg-bg h-screen px-7">
      <View className=" justify-center mb-10">
        <Text className="text-primary text-2xl font-bold">Spot Us</Text>
      </View>

      <View className="mb-10">
        <Text className="text-2xl font-bold mb-2">Create Account</Text>
        <Text className="text-gray-500">Enter your details to sign up</Text>
      </View>

      {pendingVerification ? (
        <View className="mb-10 flex flex-col gap-5">
          <View className="flex flex-col gap-1">
            <Text className="uppercase text-sm tracking-wider text-gray-600">
              Verification Code
            </Text>
            <TextInput
              className="bg-gray-200 rounded-lg py-4 px-3"
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
          </View>
        </View>
      ) : (
        <View className="mb-10 flex flex-col gap-5">
          <View className="flex flex-col gap-1">
            <Text className="uppercase text-sm tracking-wider text-gray-600">
              Full Name
            </Text>
            <TextInput
              className="bg-gray-200 rounded-lg py-4 px-3"
              placeholder="Alexandria"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="flex flex-col gap-1">
            <Text className="uppercase text-sm tracking-wider text-gray-600">
              Email
            </Text>
            <TextInput
              className="bg-gray-200 rounded-lg py-4 px-3"
              placeholder="examplw@gmail.com"
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

          <View className="flex flex-col gap-1">
            <Text className="uppercase text-sm tracking-wider text-gray-600">
              Confirm Password
            </Text>
            <TextInput
              className="bg-gray-200 rounded-lg py-4 px-3"
              placeholder="********"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {password !== confirmPassword && confirmPassword.length > 0 && (
              <Text className="text-red-700">Passwords do not match</Text>
            )}
          </View>
        </View>
      )}

      <View>
        <TouchableOpacity
          className="bg-primary max-w-2xl px-10 py-3 rounded-2xl"
          onPress={pendingVerification ? handleVerify : handleSubmit}
        >
          <Text className="text-white text-center font-bold text-lg">
            {pendingVerification ? "Verify Email" : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex flex-row items-center justify-center gap-2 my-4">
        <View className="w-1/2 h-0.5 bg-gray-300"></View>
        <Text className="text-gray-500">Or continue with</Text>
        <View className="w-1/2 h-0.5 bg-gray-300"></View>
      </View>

      <Oauth />

      <View className="flex flex-row items-center justify-center gap-2">
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text className="text-primary font-bold">Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
