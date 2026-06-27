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
        const uploadedUrl = await uploadToCloudinary(imageUri);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
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
        <Text className="text-3xl font-display font-black text-secondary dark:text-white mb-2 tracking-tight">
          Before you dive in...
        </Text>
        <Text className="text-base text-muted font-medium">
          Pick a name and pic so people know it&apos;s you.
        </Text>
      </View>

      <View className="items-center mb-10">
        <TouchableOpacity onPress={pickImage} className="relative" activeOpacity={0.8}>
          <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 items-center justify-center bg-gray-100 dark:bg-gray-800">
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
          title="Next"
          onPress={handleNextStep1}
        />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View className="mt-8 mb-8">
        <Text className="text-3xl font-display font-black text-secondary dark:text-white mb-2 tracking-tight">
          What are you into?
        </Text>
        <Text className="text-base text-muted font-medium">
          Select at least 3 interests to help us find relevant rooms.
        </Text>
      </View>

      {error ? (
        <Text className="text-red-500 text-sm font-semibold mb-4">{error}</Text>
      ) : null}

      <View className="flex-row flex-wrap gap-3 mb-8">
        {Object.keys(CATEGORY_ICONS).map((cat) => {
          const isSelected = selectedInterests.includes(cat);
          const color = CATEGORY_COLORS[cat] || "#FF6B47";
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => toggleInterest(cat)}
              activeOpacity={0.8}
              className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${
                isSelected ? "border-transparent" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C20]"
              }`}
              style={isSelected ? { backgroundColor: color } : {}}
            >
              <Ionicons
                name={CATEGORY_ICONS[cat]}
                size={18}
                color={isSelected ? "white" : color}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`font-bold text-[15px] ${
                  isSelected ? "text-white" : "text-secondary dark:text-gray-300"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-auto pt-8 flex-row gap-4">
        <TouchableOpacity 
          onPress={() => setStep(1)} 
          className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
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
        <Text className="text-3xl font-display font-black text-secondary dark:text-white mb-2 tracking-tight">
          How far will you go?
        </Text>
        <Text className="text-base text-muted font-medium">
          Set your preferred discovery radius. You can change this anytime.
        </Text>
      </View>

      <View className="items-center justify-center py-10">
        <View className="w-32 h-32 bg-primary/10 rounded-full items-center justify-center mb-8 border-4 border-primary/20">
          <Ionicons name="location" size={48} color="#FF6B47" />
          <Text className="text-primary font-black font-display mt-1 text-lg">{preferredRadius} km</Text>
        </View>
        
        <View className="flex-row flex-wrap justify-center gap-3">
          {RADIUS_OPTIONS.map((rad) => (
            <TouchableOpacity
              key={rad}
              onPress={() => setPreferredRadius(rad)}
              activeOpacity={0.8}
              className={`w-[60px] h-[60px] items-center justify-center rounded-2xl border-2 ${
                preferredRadius === rad
                  ? "bg-primary border-primary"
                  : "bg-white dark:bg-[#1C1C20] border-gray-200 dark:border-gray-800"
              }`}
            >
              <Text
                className={`font-bold text-lg ${
                  preferredRadius === rad ? "text-white" : "text-secondary dark:text-gray-300"
                }`}
              >
                {rad}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mt-auto pt-8 flex-row gap-4">
        <TouchableOpacity 
          onPress={() => setStep(2)} 
          className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
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
        <Text className="text-3xl font-display font-black text-secondary dark:text-white mb-2 tracking-tight">
          What brings you to SpotUs?
        </Text>
        <Text className="text-base text-muted font-medium">
          Pick your primary motivation.
        </Text>
      </View>

      {error ? (
        <Text className="text-red-500 text-sm font-semibold mb-4">{error}</Text>
      ) : null}

      <View className="flex flex-col gap-3">
        {MOTIVATIONS.map((mot) => {
          const isSelected = motivation === mot;
          return (
            <TouchableOpacity
              key={mot}
              onPress={() => setMotivation(mot)}
              activeOpacity={0.8}
              className={`flex-row items-center justify-between px-5 py-4 rounded-2xl border-2 ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C20]"
              }`}
            >
              <Text
                className={`font-bold text-[16px] ${
                  isSelected ? "text-primary" : "text-secondary dark:text-gray-300"
                }`}
              >
                {mot}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color="#FF6B47" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-auto pt-8 flex-row gap-4">
        <TouchableOpacity 
          onPress={() => setStep(3)} 
          className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
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
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          {/* Progress dots */}
          <View className="flex-row items-center justify-center gap-2 mt-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <View 
                key={s} 
                className={`h-2 rounded-full ${
                  s === step 
                    ? "w-8 bg-primary" 
                    : s < step 
                      ? "w-2 bg-primary/40" 
                      : "w-2 bg-gray-200 dark:bg-gray-800"
                }`} 
              />
            ))}
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
