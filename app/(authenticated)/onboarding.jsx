import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
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
import { trackEvent } from "../../lib/analytics";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "../../constants/categories";

const MOTIVATIONS = [
  "Meeting new people",
  "Finding local events",
  "Networking",
  "Just looking around",
  "Dating",
  "Discovering hidden gems",
];

const RADIUS_OPTIONS = [1, 5, 10, 25, 50];

export default function OnboardingScreen() {
  const { user } = useUser();
  const { isDark } = useTheme();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(
    user?.username || user?.firstName || ""
  );
  const [bio, setBio] = useState("");
  const [imageUri, setImageUri] = useState(user?.imageUrl || "");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [preferredRadius, setPreferredRadius] = useState(5);
  const [motivation, setMotivation] = useState("");

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

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNextStep1 = () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (selectedInterests.length < 3) {
      setError("Please select at least 3 interests");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleNextStep3 = () => {
    setStep(4);
  };

  const handleComplete = async () => {
    if (!motivation) {
      setError("Please select a primary motivation");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let finalImageUrl = imageUri;

      if (imageUri && !imageUri.startsWith("http")) {
        const uploadResult = await uploadToCloudinary(imageUri);
        if (uploadResult?.imageUrl) {
          finalImageUrl = uploadResult.imageUrl;
        }
      }

      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        userName: username,
        bio: bio,
        profilePic: finalImageUrl,
        interests: selectedInterests,
        preferredRadius: preferredRadius,
        motivation: motivation,
      });

      await user.update({
        unsafeMetadata: {
          onboardingComplete: true,
        },
      });

      trackEvent("onboarding_completed", {
        interestsCount: selectedInterests.length,
        radius: preferredRadius,
        motivation: motivation
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      router.replace("/(authenticated)/(tabs)/home");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <View className="mt-8 mb-10">
        <Text className="text-[28px] font-display text-secondary dark:text-white mb-2 tracking-tight">
          Before you dive in...
        </Text>
        <Text className="text-[15px] text-muted font-body leading-6">
          Pick a name and pic so people know it&apos;s you.
        </Text>
      </View>

      <View className="items-center mb-10">
        <TouchableOpacity onPress={pickImage} className="relative" activeOpacity={0.8}>
          <View className="w-28 h-28 rounded-[32px] overflow-hidden border-2 border-gray-100 dark:border-[#2A2A2E] items-center justify-center bg-gray-50 dark:bg-[#1A1A1E]">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Ionicons
                name="person"
                size={48}
                color={isDark ? "#4B5563" : "#C0BDB8"}
              />
            )}
          </View>
          <View className="absolute bottom-0 right-0 bg-primary w-9 h-9 rounded-full items-center justify-center border-3 border-bg dark:border-[#111112]" style={{ borderWidth: 3 }}>
            <Ionicons name="camera" size={15} color="white" />
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
          title="Next"
          onPress={handleNextStep1}
        />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View className="mt-8 mb-8">
        <Text className="text-[28px] font-display text-secondary dark:text-white mb-2 tracking-tight">
          What are you into?
        </Text>
        <Text className="text-[15px] text-muted font-body leading-6">
          Select at least 3 interests to help us find relevant rooms.
        </Text>
      </View>

      {error ? (
        <Text className="text-red-500 text-[13px] font-medium mb-4">{error}</Text>
      ) : null}

      <View className="flex-row flex-wrap gap-2.5 mb-8">
        {Object.keys(CATEGORY_ICONS).map((cat) => {
          const isSelected = selectedInterests.includes(cat);
          const color = CATEGORY_COLORS[cat] || "#FF6B47";
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => toggleInterest(cat)}
              activeOpacity={0.8}
              className={`flex-row items-center px-3.5 py-2.5 rounded-xl border ${
                isSelected ? "border-transparent" : "border-gray-150 dark:border-[#2A2A2E] bg-white dark:bg-[#1A1A1E]"
              }`}
              style={isSelected ? { backgroundColor: `${color}18` } : {}}
            >
              <Ionicons
                name={CATEGORY_ICONS[cat]}
                size={16}
                color={isSelected ? color : "#9CA3AF"}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`font-semibold text-[14px] ${
                  isSelected ? "" : "text-secondary dark:text-gray-300"
                }`}
                style={isSelected ? { color } : {}}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-auto pt-8 flex-row gap-3">
        <TouchableOpacity 
          onPress={() => setStep(1)} 
          className="w-12 h-12 bg-gray-50 dark:bg-[#1A1A1E] rounded-xl items-center justify-center border border-gray-100 dark:border-[#2A2A2E]"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? "white" : "black"} />
        </TouchableOpacity>
        <View className="flex-1">
          <CustomButton
            title={`Continue (${selectedInterests.length}/3)`}
            onPress={handleNextStep2}
            disabled={selectedInterests.length < 3}
          />
        </View>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <View className="mt-8 mb-10">
        <Text className="text-[28px] font-display text-secondary dark:text-white mb-2 tracking-tight">
          How far will you go?
        </Text>
        <Text className="text-[15px] text-muted font-body leading-6">
          Set your preferred discovery radius. You can change this anytime.
        </Text>
      </View>

      <View className="items-center justify-center py-10">
        <View className="w-28 h-28 bg-primary/8 rounded-[32px] items-center justify-center mb-8">
          <Ionicons name="location" size={40} color="#FF6B47" />
          <Text className="text-primary font-heading mt-1 text-lg">{preferredRadius} km</Text>
        </View>
        
        <View className="flex-row flex-wrap justify-center gap-2.5">
          {RADIUS_OPTIONS.map((rad) => (
            <TouchableOpacity
              key={rad}
              onPress={() => setPreferredRadius(rad)}
              activeOpacity={0.8}
              className={`w-[56px] h-[56px] items-center justify-center rounded-xl border ${
                preferredRadius === rad
                  ? "bg-primary border-primary"
                  : "bg-white dark:bg-[#1A1A1E] border-gray-150 dark:border-[#2A2A2E]"
              }`}
            >
              <Text
                className={`font-heading text-lg ${
                  preferredRadius === rad ? "text-white" : "text-secondary dark:text-gray-300"
                }`}
              >
                {rad}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mt-auto pt-8 flex-row gap-3">
        <TouchableOpacity 
          onPress={() => setStep(2)} 
          className="w-12 h-12 bg-gray-50 dark:bg-[#1A1A1E] rounded-xl items-center justify-center border border-gray-100 dark:border-[#2A2A2E]"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? "white" : "black"} />
        </TouchableOpacity>
        <View className="flex-1">
          <CustomButton
            title="Looks good"
            onPress={handleNextStep3}
          />
        </View>
      </View>
    </>
  );

  const renderStep4 = () => (
    <>
      <View className="mt-8 mb-10">
        <Text className="text-[28px] font-display text-secondary dark:text-white mb-2 tracking-tight">
          What brings you to SpotUs?
        </Text>
        <Text className="text-[15px] text-muted font-body leading-6">
          Pick your primary motivation.
        </Text>
      </View>

      {error ? (
        <Text className="text-red-500 text-[13px] font-medium mb-4">{error}</Text>
      ) : null}

      <View className="flex flex-col gap-2.5">
        {MOTIVATIONS.map((mot) => {
          const isSelected = motivation === mot;
          return (
            <TouchableOpacity
              key={mot}
              onPress={() => setMotivation(mot)}
              activeOpacity={0.8}
              className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl border ${
                isSelected
                  ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                  : "border-gray-150 dark:border-[#2A2A2E] bg-white dark:bg-[#1A1A1E]"
              }`}
            >
              <Text
                className={`font-semibold text-[15px] ${
                  isSelected ? "text-primary" : "text-secondary dark:text-gray-300"
                }`}
              >
                {mot}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={18} color="#FF6B47" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-auto pt-8 flex-row gap-3">
        <TouchableOpacity 
          onPress={() => setStep(3)} 
          className="w-12 h-12 bg-gray-50 dark:bg-[#1A1A1E] rounded-xl items-center justify-center border border-gray-100 dark:border-[#2A2A2E]"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? "white" : "black"} />
        </TouchableOpacity>
        <View className="flex-1">
          <CustomButton
            title="Let's Go!"
            onPress={handleComplete}
            loading={isLoading}
          />
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111112]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          {/* Step counter — text instead of dots */}
          <View className="mt-2 mb-4">
            <Text className="text-muted text-[12px] font-medium">
              Step {step} of 4
            </Text>
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
