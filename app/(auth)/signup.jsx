import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../config/firebase.config";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    try {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
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
          />
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
    </SafeAreaView>
  );
}
