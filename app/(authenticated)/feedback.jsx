import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlassButton from "../../components/ui/GlassButton";
import { db } from "../../config/firebase.config";
import { useTheme } from "../../context/ThemeContext";
import useFirestoreUser from "../../hook/useFireStoreUser";

const REPORT_CATEGORIES = [
  { label: "Harassment or bullying", icon: "alert-circle" },
  { label: "Spam or scam", icon: "mail-unread" },
  { label: "Inappropriate content", icon: "eye-off" },
  { label: "Impersonation", icon: "person-remove" },
  { label: "Other", icon: "help-circle" },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { firestoreUser } = useFirestoreUser();
  const { reportedUserId, roomId, type } = useLocalSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert(
        "Select a category",
        "Please choose a reason for your report.",
      );
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await addDoc(collection(db, "reports"), {
        type: type || (roomId ? "room" : "user"),
        reportedUserId: reportedUserId || null,
        roomId: roomId || null,
        reporterId: firestoreUser?.id,
        category: selectedCategory,
        description: description.trim(),
        createdAt: serverTimestamp(),
        status: "pending",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Report submitted",
        "Thanks for helping keep SpotUs safe. We'll review your report shortly.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Error submitting report:", err);
      Alert.alert("Error", "Could not submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-[#2C2C30]">
          <GlassButton onPress={() => router.back()} size={40} shape="circle">
            <Ionicons
              name="chevron-back"
              size={20}
              color={isDark ? "white" : "#18181B"}
            />
          </GlassButton>
          <Text className="text-secondary dark:text-gray-100 text-lg font-display font-extrabold">
            Report
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 40,
            paddingTop: 20,
          }}
        >
          {/* Info banner */}
          <View className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 mb-6 flex-row items-start">
            <View className="w-9 h-9 bg-primary/10 rounded-xl items-center justify-center mr-3">
              <Ionicons name="shield-checkmark" size={18} color="#FF6B47" />
            </View>
            <View className="flex-1">
              <Text className="text-secondary dark:text-gray-100 text-sm font-bold mb-1">
                Help us keep SpotUs safe
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs leading-4">
                Your report is confidential. We&apos;ll review it and take
                appropriate action.
              </Text>
            </View>
          </View>

          {/* Category selection */}
          <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold mb-3 tracking-tight">
            What&apos;s the issue?
          </Text>

          <View className="mb-6">
            {REPORT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.label;
              return (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(cat.label);
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
                        ? "rgba(79, 70, 229, 0.1)"
                        : "rgba(156, 163, 175, 0.1)",
                    }}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={18}
                      color={isSelected ? "#FF6B47" : "#9CA3AF"}
                    />
                  </View>
                  <Text
                    className={`text-sm font-semibold flex-1 ${
                      isSelected
                        ? "text-primary dark:text-primary"
                        : "text-secondary dark:text-gray-100"
                    }`}
                  >
                    {cat.label}
                  </Text>
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
            Additional details (optional)
          </Text>
          <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4 mb-8">
            <TextInput
              placeholder="Describe what happened..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              className="text-secondary dark:text-gray-100 text-sm min-h-[100px]"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || !selectedCategory}
            activeOpacity={0.8}
            className={`py-4 rounded-2xl flex-row items-center justify-center ${
              selectedCategory ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
