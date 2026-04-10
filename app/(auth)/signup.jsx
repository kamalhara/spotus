import { useAuth, useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";

export default function SignUp() {
  const { isLoaded } = useAuth();
  const { client, setActive } = useClerk();
  const signUp = client?.signUp;
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

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
      <SafeAreaView className="flex-1 justify-center items-center">
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
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <View className="mb-10 mt-8">
        <Text className="text-secondary text-4xl font-black tracking-tight mb-2">
          {pendingVerification ? "Verify Email" : "Create\nAccount"}
        </Text>
        <Text className="text-gray-500 text-lg leading-6 mt-1">
          {pendingVerification
            ? `Enter the code sent to ${emailAddress}`
            : "Join the local discovery circle and connect with people nearby."}
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
            icon={<Ionicons name="person-outline" size={20} color="#9CA3AF" />}
          />

          <CustomInput
            label="Email Address"
            placeholder="example@gmail.com"
            value={emailAddress}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
          />

          <CustomInput
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            }
          />

          {error ? <Text className="text-red-500 ml-1">{error}</Text> : null}

          <View className="mt-4">
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
            icon={<Ionicons name="keypad-outline" size={20} color="#9CA3AF" />}
          />
          {error ? <Text className="text-red-500 ml-1">{error}</Text> : null}
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

      <View className="flex flex-row items-center justify-center gap-1 mt-8">
        <Text className="text-gray-600">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text className="text-primary font-bold">Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
