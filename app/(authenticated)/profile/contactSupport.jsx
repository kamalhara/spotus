import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import { useTheme } from "../../../context/ThemeContext";
import { trackEvent } from "../../../lib/analytics";

const CONTACT_OPTIONS = [
  {
    title: "General Support",
    description: "Questions, account issues, or general help.",
    email: "support@spotus.app",
    icon: "chatbubble-ellipses-outline",
    color: "#FF6B47",
  },
  {
    title: "Privacy Questions",
    description: "Data requests, deletion, or privacy concerns.",
    email: "privacy@spotus.app",
    icon: "lock-closed-outline",
    color: "#8B5CF6",
  },
  {
    title: "Safety Team",
    description: "Report urgent safety issues or threats.",
    email: "safety@spotus.app",
    icon: "shield-checkmark-outline",
    color: "#EF4444",
  },
  {
    title: "Business Inquiries",
    description: "Partnerships, press, or collaboration.",
    email: "business@spotus.app",
    icon: "briefcase-outline",
    color: "#3B82F6",
  },
];

export default function ContactSupport() {
  const { isDark } = useTheme();

  useEffect(() => {
    trackEvent("contact_support_opened");
  }, []);

  const handleEmailPress = (email, title) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent("contact_support_email_tapped", { email, title });
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Contact Support" subtitle="Get in touch with us" />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 40,
          }}
        >
          {/* Response time banner */}
          <View className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 mb-6 flex-row items-start">
            <View className="w-9 h-9 bg-primary/10 rounded-xl items-center justify-center mr-3">
              <Ionicons name="time-outline" size={18} color="#FF6B47" />
            </View>
            <View className="flex-1">
              <Text className="text-secondary dark:text-gray-100 text-sm font-bold mb-1">
                Contact the right team
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs leading-4">
                Include your username and a description of the issue for the
                fastest response.
              </Text>
            </View>
          </View>

          {/* Contact options */}
          {CONTACT_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.email}
              onPress={() => handleEmailPress(option.email, option.title)}
              activeOpacity={0.7}
              className={`bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4 flex-row items-center ${
                index < CONTACT_OPTIONS.length - 1 ? "mb-3" : ""
              }`}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
                style={{ backgroundColor: `${option.color}15` }}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={option.color}
                />
              </View>
              <View className="flex-1">
                <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold">
                  {option.title}
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                  {option.description}
                </Text>
                <Text
                  className="text-xs font-semibold mt-1.5"
                  style={{ color: option.color }}
                >
                  {option.email}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDark ? "#4B5563" : "#CBD5E1"}
              />
            </TouchableOpacity>
          ))}

          {/* Social / App info */}
          <View className="mt-6 bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-5">
            <Text className="text-secondary dark:text-gray-100 text-sm font-bold mb-1">
              Before contacting us
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs leading-4">
              Check the Help Center for answers to common questions. You can
              also report app bugs through Report a Problem in Settings.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
