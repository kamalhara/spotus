import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";
import { db } from "../../config/firebase.config";
import { useTheme } from "../../context/ThemeContext";
import { uploadToCloudinary } from "../../lib/uploadCloudinary";

export default function OnboardingScreen() {
  const { user } = useUser();
  const { isDark } = useTheme();

  const [username, setUsername] = useState(
    user?.username || user?.firstName || ""
  );
  const [bio, setBio] = useState("");
  const [imageUri, setImageUri] = useState(user?.imageUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      shape: "oval",
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleComplete = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let finalImageUrl = imageUri;

      // If the user selected a new local image, upload it
      if (imageUri && !imageUri.startsWith("http")) {
        const uploadedUrl = await uploadToCloudinary(imageUri);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      // Update Firestore
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        userName: username,
        bio: bio,
        profilePic: finalImageUrl,
      });

      // Update Clerk metadata
      await user.update({
        unsafeMetadata: {
          onboardingComplete: true,
        },
      });

      router.replace("/(authenticated)/(tabs)/home");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <View className="mt-8 mb-10">
            <Text className="text-3xl font-bold text-secondary dark:text-white mb-2">
              Before you dive in...
            </Text>
            <Text className="text-base text-muted">
              Pick a name and pic so people know it&apos;s you.
            </Text>
          </View>

          <View className="items-center mb-10">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary/20 items-center justify-center bg-gray-100 dark:bg-gray-800">
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={60}
                    color={isDark ? "#4B5563" : "#9CA3AF"}
                  />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full items-center justify-center border-4 border-bg dark:border-[#111113]">
                <Ionicons name="camera" size={18} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <View className="mb-6">
              <CustomInput
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                error={error}
                autoCapitalize="none"
              />
            </View>

            <View className="mb-6">
              <CustomInput
                label="Bio (Optional)"
                placeholder="Tell us a bit about yourself"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                containerStyle={{ alignItems: "flex-start", height: 100 }}
              />
            </View>
          </View>

          <View className="mt-auto pt-8">
            <CustomButton
              title="I'm ready"
              onPress={handleComplete}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
