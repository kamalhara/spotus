import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { trackEvent } from "../../../lib/analytics";

const PROBLEM_CATEGORIES = [
  {
    label: "Bug",
    icon: "bug-outline",
    description: "Something isn't working as expected.",
  },
  {
    label: "App Crash",
    icon: "flash-off-outline",
    description: "The app closed unexpectedly.",
  },
  {
    label: "Performance Issue",
    icon: "speedometer-outline",
    description: "Slow loading, lag, or battery drain.",
  },
  {
    label: "UI Problem",
    icon: "phone-portrait-outline",
    description: "Layout, text, or visual glitches.",
  },
  {
    label: "Login Issue",
    icon: "log-in-outline",
    description: "Can't sign in or authentication errors.",
  },
  {
    label: "Notification Problem",
    icon: "notifications-off-outline",
    description: "Not receiving or getting wrong notifications.",
  },
  {
    label: "Payment Problem",
    icon: "card-outline",
    description: "Billing, subscription, or purchase issues.",
  },
  {
    label: "Feature Request",
    icon: "bulb-outline",
    description: "Suggest a new feature or improvement.",
  },
  {
    label: "Other",
    icon: "help-circle-outline",
    description: "Something else not listed above.",
  },
];

export default function ReportProblem() {
  const router = useRouter();
  const { firestoreUser } = useFirestoreUser();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Entrance animation
  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    trackEvent("report_problem_opened");
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  const handleSubmit = async () => {
    if (!selectedCategory) return;

    if (description.trim().length > 0 && description.trim().length < 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await addDoc(collection(db, "supportTickets"), {
        userId: firestoreUser?.id || null,
        category: selectedCategory.label,
        description: description.trim(),
        screenshotUrl: null,
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version || "1.0.0",
        createdAt: serverTimestamp(),
        status: "open",
      });

      trackEvent("support_ticket_created", {
        category: selectedCategory.label,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch (err) {
      console.error("Error creating support ticket:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={44} color="#10B981" />
          </View>
          <Text className="text-secondary dark:text-gray-100 text-2xl font-display font-extrabold text-center mb-3">
            Thank you!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm leading-5 mb-8">
            Your report has been submitted. Our team will investigate and work on
            a fix as soon as possible.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-full py-4 rounded-2xl items-center justify-center bg-primary"
            style={{
              shadowColor: "#FF6B47",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-bold text-white text-sm">
              Back to Settings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader
        title="Report a Problem"
        subtitle="Help us improve SpotUs"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Animated.View style={{ flex: 1, opacity: fadeIn }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Info banner */}
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6 flex-row items-start">
              <View className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl items-center justify-center mr-3">
                <Ionicons name="bug" size={18} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-secondary dark:text-gray-100 text-sm font-bold mb-1">
                  Report app issues here
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs leading-4">
                  This is for bugs, crashes, and feature requests. To report a
                  user or safety concern, use the Report button on their profile.
                </Text>
              </View>
            </View>

            {/* Category selection */}
            <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold mb-3 tracking-tight">
              What&apos;s the problem?
            </Text>

            <View className="mb-6">
              {PROBLEM_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory?.label === cat.label;
                return (
                  <TouchableOpacity
                    key={cat.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCategory(cat);
                    }}
                    activeOpacity={0.7}
                    className={`flex-row items-center p-4 rounded-2xl mb-2 border ${
                      isSelected
                        ? "bg-primary/5 dark:bg-primary/10 border-primary/20"
                        : "bg-white dark:bg-[#1C1C20] border-gray-100 dark:border-[#2C2C30]"
                    }`}
                  >
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(255, 107, 71, 0.1)"
                          : "rgba(156, 163, 175, 0.1)",
                      }}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={18}
                        color={isSelected ? "#FF6B47" : "#9CA3AF"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected
                            ? "text-primary"
                            : "text-secondary dark:text-gray-100"
                        }`}
                      >
                        {cat.label}
                      </Text>
                      <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                        {cat.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}
            <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold mb-3 tracking-tight">
              Describe the problem (optional)
            </Text>
            <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4 mb-2">
              <TextInput
                placeholder="What happened? Steps to reproduce..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={(text) => {
                  if (text.length <= 500) setDescription(text);
                }}
                multiline
                numberOfLines={5}
                className="text-secondary dark:text-gray-100 text-sm min-h-[110px]"
                style={{ textAlignVertical: "top" }}
              />
            </View>
            <Text className="text-right text-xs text-gray-400 dark:text-gray-500 mb-8">
              {description.length}/500
            </Text>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !selectedCategory}
              activeOpacity={0.8}
              className={`py-4 rounded-2xl flex-row items-center justify-center ${
                selectedCategory
                  ? "bg-primary"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
              style={
                selectedCategory
                  ? {
                      shadowColor: "#FF6B47",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 3,
                    }
                  : {}
              }
            >
              <Ionicons
                name="send"
                size={16}
                color={selectedCategory ? "white" : "#9CA3AF"}
              />
              <Text
                className={`font-bold text-sm ml-2 ${
                  selectedCategory ? "text-white" : "text-gray-400"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
