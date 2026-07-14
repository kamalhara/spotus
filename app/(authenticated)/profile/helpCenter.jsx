import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import { useTheme } from "../../../context/ThemeContext";
import { trackEvent } from "../../../lib/analytics";

const FAQS = [
  {
    title: "Starting Direct Messages",
    description:
      "Open a member profile and send a message request. Once accepted, you can chat privately.",
    icon: "chatbubble-ellipses-outline",
  },
  {
    title: "What are Rooms?",
    description:
      "Temporary chat spaces tied to a location. They group nearby people around shared interests.",
    icon: "people-outline",
  },
  {
    title: "Leaving a Room",
    description:
      "Open room info and tap Leave Room at the bottom of the screen.",
    icon: "log-out-outline",
  },
  {
    title: "Ghost Mode",
    description:
      "Browse rooms without sharing your location. You can see activity but cannot join or post.",
    icon: "eye-off-outline",
  },
  {
    title: "Why did my room disappear?",
    description:
      "All rooms expire automatically. SpotUs is built for the moment — rooms are temporary by design.",
    icon: "time-outline",
  },
];

function FAQItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded(!expanded);
        trackEvent("faq_opened", { title: item.title });
      }}
      className={`bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4 mb-3 ${
        expanded ? "border-primary/20 dark:border-primary/20" : ""
      }`}
    >
      <View className="flex-row items-center">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
          style={{
            backgroundColor: expanded
              ? "rgba(255, 107, 71, 0.1)"
              : "rgba(156, 163, 175, 0.1)",
          }}
        >
          <Ionicons
            name={item.icon}
            size={18}
            color={expanded ? "#FF6B47" : "#9CA3AF"}
          />
        </View>
        <Text
          className={`text-sm font-semibold flex-1 ${
            expanded
              ? "text-primary"
              : "text-secondary dark:text-gray-100"
          }`}
        >
          {item.title}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={isDark ? "#4B5563" : "#CBD5E1"}
        />
      </View>
      {expanded && (
        <Text className="text-gray-500 dark:text-gray-400 text-xs leading-5 mt-3 ml-12">
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function HelpCenter() {
  const router = useRouter();
  const { isDark } = useTheme();

  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    trackEvent("help_center_opened");
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Help Center" subtitle="Find answers & get support" />

      <Animated.View style={{ flex: 1, opacity: fadeIn }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 40,
          }}
        >
          {/* Popular Topics */}
          <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold mb-3 tracking-tight">
            Popular Topics
          </Text>

          {FAQS.map((item) => (
            <FAQItem key={item.title} item={item} />
          ))}

          {/* Safety & Policies */}
          <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold mb-3 mt-4 tracking-tight">
            Safety & Policies
          </Text>

          <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] overflow-hidden mb-3">
            <PolicyRow
              icon="document-text-outline"
              label="Community Guidelines"
              onPress={() => router.push("/profile/communityGuidelines")}
              isDark={isDark}
            />
            <PolicyRow
              icon="shield-checkmark-outline"
              label="Child Safety Information"
              onPress={() => router.push("/profile/childSafety")}
              isDark={isDark}
            />
            <PolicyRow
              icon="eye-outline"
              label="Privacy & Data"
              onPress={() => router.push("/profile/privacyData")}
              isDark={isDark}
            />
            <PolicyRow
              icon="flag-outline"
              label="How Reporting Works"
              onPress={() => router.push("/profile/safety")}
              isDark={isDark}
              isLast
            />
          </View>

          {/* Support */}
          <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold mb-3 mt-4 tracking-tight">
            Support
          </Text>

          <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] overflow-hidden mb-3">
            <PolicyRow
              icon="mail-outline"
              label="Contact Support"
              onPress={() => router.push("/profile/contactSupport")}
              isDark={isDark}
            />
            <PolicyRow
              icon="bug-outline"
              label="Report a Problem"
              onPress={() => router.push("/profile/reportProblem")}
              isDark={isDark}
            />
            <PolicyRow
              icon="information-circle-outline"
              label={`App Version ${appVersion}`}
              isDark={isDark}
              isLast
              noChevron
            />
          </View>

          {/* Still need help */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL("mailto:support@spotus.app")}
            className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-5 mt-2 flex-row items-center"
          >
            <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-3.5">
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#FF6B47"
              />
            </View>
            <View className="flex-1">
              <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold">
                Still need help?
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                Include the room or conversation name when you reach out.
              </Text>
              <Text className="text-primary dark:text-primary-light text-xs font-bold mt-1.5">
                support@spotus.app
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isDark ? "#4B5563" : "#CBD5E1"}
            />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function PolicyRow({ icon, label, onPress, isDark, isLast = false, noChevron = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.6}
      className={`flex-row items-center px-4 py-3.5 ${
        !isLast ? "border-b border-gray-50 dark:border-[#2C2C30]" : ""
      }`}
    >
      <View
        className="w-8 h-8 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: "rgba(156, 163, 175, 0.1)" }}
      >
        <Ionicons name={icon} size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-sm font-medium flex-1">
        {label}
      </Text>
      {!noChevron && (
        <Ionicons
          name="chevron-forward"
          size={14}
          color={isDark ? "#4B5563" : "#D1D5DB"}
        />
      )}
    </TouchableOpacity>
  );
}
