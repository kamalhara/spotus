import { useAuth, useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Oauth from "../../components/Oauth";

export default function SignUp() {
  const { isLoaded } = useAuth();
  const { client, setActive } = useClerk();
  const signUp = client?.signUp;
  const router = useRouter();

  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) {
      // Just log and prevent action, don’t return JSX
      console.log("Clerk is not loaded");
      return; // stop signup until loaded
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    try {
      if (!signUp) {
        throw new Error("SignUp resource not available on the client");
      }

      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      console.log("SignUp created. Status:", signUp.status);
      console.log("Unverified fields:", signUp.unverifiedFields);

      if (signUp.status === "missing_requirements") {
        if (signUp.unverifiedFields.includes("email_address")) {
          console.log("Attempting to prepare email verification...");
          // In some Core 3 builds, prototype methods like prepareVerification 
          // are on the prototype, so Object.keys(signUp) might not show them.
          // But accessing them directly usually works if we have the real resource.
          console.log("Has prepareVerification?", typeof signUp.prepareVerification);
          
          // Use the more generic prepareVerification which is required in some Core 3 versions
          await signUp.prepareVerification({
            strategy: "email_code",
          });
          setPendingVerification(true);
        } else {
          console.warn("SignUp is missing requirements:", signUp.missingFields);
          setError("Please fill in all required fields.");
        }
      } else if (signUp.status === "complete") {
        await setActive({ session: signUp.createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      console.error("Sign up error caught:", err);

      let errorMessage = "An error occurred during sign up.";

      if (err.errors) {
        err.errors.forEach((e, i) => {
          console.error(`Error ${i}: ${e.longMessage || e.message}`);
          if (e.code === "strategy_for_user_invalid") {
            errorMessage =
              "Email verification code is not enabled in your Clerk Dashboard. Please enable it in 'User & Auth > Sign-up'.";
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

  const onPressVerify = async () => {
    if (!isLoaded) return;

    setVerifyLoading(true);
    setVerifyError("");

    try {
      const completeSignUp = await signUp.attemptVerification({
        strategy: "email_code",
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/");
        setPendingVerification(false);
      } else {
        console.error("Verification not complete. Status:", completeSignUp.status);
        setVerifyError("Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Verification error caught:", err);
      // Log details if it exists
      if (err.errors) {
        err.errors.forEach((e) => console.error(e.longMessage || e.message));
      }
      setVerifyError(
        err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          "Verification failed. Please check the code.",
      );
    } finally {
      setVerifyLoading(false);
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
        </View>
        {error ? <Text className="text-red-500">{error}</Text> : null}
      </View>

      <View>
        <Pressable
          disabled={loading}
          onPress={onSignUpPress}
          className={`bg-primary max-w-2xl px-10 py-4 rounded-2xl flex-row justify-center items-center ${loading ? "opacity-70" : "active:opacity-80"}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Sign Up
            </Text>
          )}
        </Pressable>
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

      {/* OTP Verification Modal */}
      <Modal
        visible={pendingVerification}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white w-full rounded-2xl p-6 shadow-lg">
            <Text className="text-2xl font-bold mb-2 text-center text-primary">
              Verify Email
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Enter the 6-digit code sent to {emailAddress || "your email"}
            </Text>

            <View className="flex flex-col gap-1 mb-6">
              <Text className="uppercase text-sm tracking-wider text-gray-600">
                Verification Code
              </Text>
              <TextInput
                className="bg-gray-200 rounded-lg py-4 px-3 text-center text-xl tracking-widest"
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            {verifyError ? (
              <Text className="text-red-500 text-center mb-4">
                {verifyError}
              </Text>
            ) : null}

            <View className="flex-col gap-3">
              <Pressable
                disabled={verifyLoading}
                onPress={onPressVerify}
                className={`bg-primary px-10 py-4 rounded-xl flex-row justify-center items-center ${verifyLoading ? "opacity-70" : "active:opacity-80"}`}
              >
                {verifyLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    Verify
                  </Text>
                )}
              </Pressable>

              <TouchableOpacity
                onPress={() => setPendingVerification(false)}
                className="py-2"
              >
                <Text className="text-gray-500 text-center font-semibold text-base mt-2">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
