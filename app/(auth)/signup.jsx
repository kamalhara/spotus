import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Oauth from "../../components/Oauth";
import { auth, db } from "../../config/firebase.config";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const handleSignup = async () => {
    try {
      if (!name || !email || !password || !confirmPassword) {
        const error = new Error("Please fill all the fields");
        error.code = "ERR_MISSING_FIELDS";
        throw error;
      }
      if (password !== confirmPassword) {
        const error = new Error("Passwords do not match");
        error.code = "ERR_PASSWORDS_MISMATCH";
        throw error;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        profilePic: "",
        roomsJoined: [],
      });

      alert("User created successfully");
      console.log("User created:", user);
    } catch (error) {
      alert(error.message);
      console.log(error.message);
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
            value={email}
            onChangeText={setEmail}
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
          {password !== confirmPassword && (
            <Text className="text-red-700">Passwords do not match</Text>
          )}
        </View>
      </View>

      <View>
        <TouchableOpacity
          className="bg-primary max-w-2xl px-10 py-3 rounded-2xl"
          onPress={handleSignup}
        >
          <Text className="text-white text-center font-bold text-lg">
            Sign Up
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
