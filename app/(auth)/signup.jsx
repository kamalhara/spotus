import { useAuth, useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
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
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";

function StepIndicator({ currentStep }) {
  return (
    <View className="flex-row items-center justify-center gap-2.5 mb-8">
      <View
        className={`h-1.5 rounded-full ${currentStep >= 1 ? "bg-primary w-8" : "bg-border w-5"}`}
      />
      <View
        className={`h-1.5 rounded-full ${currentStep >= 2 ? "bg-primary w-8" : "bg-border w-5"}`}
      />
    </View>
  );
}

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
            onPress={() =>
              pendingVerification
                ? setPendingVerification(false)
                : router.back()
            }
            className="w-11 h-11 bg-surface-alt rounded-2xl items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#18181B" />
          </TouchableOpacity>
        </View>

        <View className="mb-8 mt-10">
          <StepIndicator currentStep={pendingVerification ? 2 : 1} />

          <Text className="text-secondary text-[36px] font-black tracking-tight mb-2 leading-[42px]">
            {pendingVerification ? "Verify Email" : "Create\nAccount"}
          </Text>
          <Text className="text-muted text-[16px] leading-6 mt-2 font-medium">
            {pendingVerification
              ? `Enter the 6-digit code sent to ${emailAddress}`
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
              icon={<Ionicons name="person-outline" size={20} color="#94A3B8" />}
            />

            <CustomInput
              label="Email Address"
              placeholder="example@gmail.com"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={20} color="#94A3B8" />}
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
                  size={20}
                  color="#94A3B8"
                />
              }
            />

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

            <View className="mt-3">
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
                <Ionicons name="keypad-outline" size={20} color="#94A3B8" />
              }
            />
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

        <View className="flex flex-row items-center justify-center gap-1.5 mt-8">
          <Text className="text-muted font-medium text-[15px]">
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-primary font-black text-[15px]">Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
