import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../context/ThemeContext";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "1";

const CORE_VALUES = [
  {
    icon: "people",
    title: "Rooms First",
    description:
      "Meet through shared-interest spaces before direct messages. Build connections organically.",
    color: "#4F46E5",
  },
  {
    icon: "shield-checkmark",
    title: "Trust Based",
    description:
      "Conversation access is earned through meaningful room participation and engagement.",
    color: "#10B981",
  },
  {
    icon: "location",
    title: "Nearby by Design",
    description:
      "Discover rooms and people around you. Hyperlocal connections that matter.",
    color: "#F59E0B",
  },
  {
    icon: "lock-closed",
    title: "Privacy First",
    description:
      "Your data stays yours. No selling, no tracking. End-to-end encrypted DMs.",
    color: "#8B5CF6",
  },
];

const TEAM_STATS = [
  { value: APP_VERSION, label: "Version", icon: "code-slash" },
  { value: "Expo 54", label: "Framework", icon: "layers" },
  { value: "React Native", label: "Built with", icon: "logo-react" },
  { value: "Firebase", label: "Backend", icon: "cloud" },
];

const LEGAL_LINKS = [
  {
    icon: "document-text-outline",
    title: "Terms of Service",
    url: "https://spotus.app/terms",
    color: "#4F46E5",
  },
  {
    icon: "shield-outline",
    title: "Privacy Policy",
    url: "https://spotus.app/privacy",
    color: "#10B981",
  },
  {
    icon: "information-circle-outline",
    title: "Open Source Licenses",
    url: "https://spotus.app/licenses",
    color: "#F59E0B",
  },
];

function AnimatedCard({ children }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function About() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [pressedHeart, setPressedHeart] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  const handleHeartPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPressedHeart(true);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.4,
        useNativeDriver: true,
        speed: 50,
        bounciness: 12,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
  };

  const handleLinkPress = (url) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#0F0F13]" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center justify-between min-h-[48px]">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              activeOpacity={0.75}
              className="w-11 h-11 rounded-full bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36] items-center justify-center mr-3"
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color={isDark ? "white" : "#18181B"}
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text
                className="text-secondary dark:text-gray-100 text-xl font-extrabold tracking-tight"
                numberOfLines={1}
              >
                About SpotUs
              </Text>
              <Text
                className="text-gray-400 dark:text-gray-500 text-xs font-medium mt-0.5"
                numberOfLines={1}
              >
                Learn more about the app
              </Text>
            </View>
          </View>
          <View className="w-11" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
      >
        {/* Hero Card */}
        <View
          className="bg-white dark:bg-[#1A1A22] rounded-3xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden mb-5"
          style={{
            shadowColor: isDark ? "#000" : "#94A3B8",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 24,
            elevation: 4,
          }}
        >
          {/* Gradient accent bar */}
          <View style={{ height: 4, backgroundColor: "#4F46E5" }} />

          <View className="items-center px-6 pt-8 pb-7">
            {/* App icon */}
            <View
              className="w-20 h-20 rounded-[22px] items-center justify-center mb-5"
              style={{
                backgroundColor: "#4F46E5",
                shadowColor: "#4F46E5",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Ionicons name="navigate" size={34} color="white" />
            </View>

            {/* App name with dot */}
            <View className="flex-row items-center mb-2">
              <Text className="text-secondary dark:text-gray-100 text-[28px] font-black tracking-tight">
                Spot
              </Text>
              <Text className="text-primary text-[28px] font-black tracking-tight">
                Us
              </Text>
              <View
                className="w-2.5 h-2.5 rounded-full bg-primary ml-1 -mt-4"
                style={{
                  shadowColor: "#4F46E5",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                }}
              />
            </View>

            {/* Tagline */}
            <Text className="text-gray-400 dark:text-gray-500 text-[15px] leading-[22px] text-center font-medium max-w-[280px]">
              Real conversations with real people nearby. No algorithms, no
              feeds — just genuine connections.
            </Text>

            {/* Heart easter egg */}
            <TouchableOpacity
              onPress={handleHeartPress}
              activeOpacity={0.7}
              className="mt-5"
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <View
                  className="flex-row items-center px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: pressedHeart
                      ? isDark
                        ? "rgba(239, 68, 68, 0.15)"
                        : "rgba(239, 68, 68, 0.08)"
                      : isDark
                        ? "rgba(79, 70, 229, 0.1)"
                        : "rgba(79, 70, 229, 0.06)",
                  }}
                >
                  <Ionicons
                    name={pressedHeart ? "heart" : "heart-outline"}
                    size={14}
                    color={pressedHeart ? "#EF4444" : "#4F46E5"}
                  />
                  <Text
                    className="text-xs font-bold ml-1.5"
                    style={{ color: pressedHeart ? "#EF4444" : "#4F46E5" }}
                  >
                    {pressedHeart ? "Made with love" : "Made in India"}
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tech Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-5">
          {TEAM_STATS.map((stat) => (
            <View
              key={stat.label}
              className="bg-white dark:bg-[#1A1A22] rounded-2xl border border-gray-100 dark:border-[#2A2A36] p-4"
              style={{
                width: "47.5%",
                shadowColor: isDark ? "#000" : "#94A3B8",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.2 : 0.04,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <View
                className="w-8 h-8 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: "rgba(79, 70, 229, 0.08)" }}
              >
                <Ionicons name={stat.icon} size={16} color="#4F46E5" />
              </View>
              <Text className="text-secondary dark:text-gray-100 text-lg font-black tracking-tight">
                {stat.value}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Core Values Section */}
        <View className="mb-5">
          <View className="flex-row items-center mb-4">
            <View
              className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
              style={{ backgroundColor: "rgba(79, 70, 229, 0.08)" }}
            >
              <Ionicons name="diamond" size={15} color="#4F46E5" />
            </View>
            <Text className="text-secondary dark:text-gray-100 text-lg font-black tracking-tight">
              Core Values
            </Text>
          </View>

          <View
            className="bg-white dark:bg-[#1A1A22] rounded-3xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden"
            style={{
              shadowColor: isDark ? "#000" : "#94A3B8",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.25 : 0.06,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            {CORE_VALUES.map((value, index) => (
              <AnimatedCard key={value.title}>
                <View
                  className={`flex-row items-start px-5 py-4 ${
                    index !== CORE_VALUES.length - 1
                      ? "border-b border-gray-50 dark:border-[#23232E]"
                      : ""
                  }`}
                >
                  <View
                    className="w-11 h-11 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${value.color}12` }}
                  >
                    <Ionicons name={value.icon} size={20} color={value.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold mb-1">
                      {value.title}
                    </Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-[13px] leading-[19px] font-medium">
                      {value.description}
                    </Text>
                  </View>
                </View>
              </AnimatedCard>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View className="mb-5">
          <View className="flex-row items-center mb-4">
            <View
              className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
              style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}
            >
              <Ionicons name="sparkles" size={15} color="#10B981" />
            </View>
            <Text className="text-secondary dark:text-gray-100 text-lg font-black tracking-tight">
              How It Works
            </Text>
          </View>

          <View className="gap-3">
            {[
              {
                step: "01",
                title: "Discover Rooms",
                desc: "Find rooms nearby based on your interests and location.",
                icon: "compass",
                color: "#4F46E5",
              },
              {
                step: "02",
                title: "Build Trust",
                desc: "Participate in room conversations to build your trust score.",
                icon: "trending-up",
                color: "#F59E0B",
              },
              {
                step: "03",
                title: "Connect Directly",
                desc: "Once trusted, unlock direct messaging with room members.",
                icon: "chatbubbles",
                color: "#10B981",
              },
            ].map((item) => (
              <View
                key={item.step}
                className="bg-white dark:bg-[#1A1A22] rounded-2xl border border-gray-100 dark:border-[#2A2A36] p-4 flex-row items-center"
                style={{
                  shadowColor: isDark ? "#000" : "#94A3B8",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.15 : 0.04,
                  shadowRadius: 8,
                  elevation: 1,
                }}
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${item.color}10` }}
                >
                  <Text
                    className="text-[11px] font-black"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold mb-0.5">
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs leading-4 font-medium">
                    {item.desc}
                  </Text>
                </View>
                <View
                  className="w-8 h-8 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${item.color}10` }}
                >
                  <Ionicons name={item.icon} size={16} color={item.color} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Legal Section */}
        <View className="mb-5">
          <View className="flex-row items-center mb-4">
            <View
              className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
              style={{ backgroundColor: "rgba(139, 92, 246, 0.08)" }}
            >
              <Ionicons name="briefcase" size={15} color="#8B5CF6" />
            </View>
            <Text className="text-secondary dark:text-gray-100 text-lg font-black tracking-tight">
              Legal
            </Text>
          </View>

          <View
            className="bg-white dark:bg-[#1A1A22] rounded-3xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden"
            style={{
              shadowColor: isDark ? "#000" : "#94A3B8",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.25 : 0.06,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            {LEGAL_LINKS.map((link, index) => (
              <TouchableOpacity
                key={link.title}
                onPress={() => handleLinkPress(link.url)}
                activeOpacity={0.7}
                className={`flex-row items-center px-5 py-4 ${
                  index !== LEGAL_LINKS.length - 1
                    ? "border-b border-gray-50 dark:border-[#23232E]"
                    : ""
                }`}
              >
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-3.5"
                  style={{ backgroundColor: `${link.color}12` }}
                >
                  <Ionicons name={link.icon} size={18} color={link.color} />
                </View>
                <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold flex-1">
                  {link.title}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDark ? "#4B5563" : "#CBD5E1"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View className="items-center mt-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View
              className="w-7 h-7 rounded-lg items-center justify-center mr-2"
              style={{ backgroundColor: "rgba(79, 70, 229, 0.08)" }}
            >
              <Ionicons name="navigate" size={13} color="#4F46E5" />
            </View>
            <Text className="text-gray-300 dark:text-gray-600 text-sm font-bold">
              SpotUs
            </Text>
          </View>
          <Text className="text-gray-300 dark:text-gray-700 text-[11px] font-medium text-center leading-4">
            Version {APP_VERSION} ({BUILD_NUMBER}) • Expo SDK 54
          </Text>
          <Text className="text-gray-300 dark:text-gray-700 text-[11px] font-medium text-center mt-1">
            © {new Date().getFullYear()} SpotUs. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
