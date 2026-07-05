import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

const ACCENT = "#8B5CF6";

const FAQS = [
  {
    title: "Unlocking direct messages",
    description:
      "Send 10 quality messages inside a shared room to build trust and unlock DMs.",
    icon: "shield-checkmark-outline",
  },
  {
    title: "What are rooms?",
    description:
      "Temporary chat spaces tied to a location. They group nearby people around shared interests.",
    icon: "people-outline",
  },
  {
    title: "Leaving a room",
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
      "All rooms expire automatically. SpotUs is built for the moment.",
    icon: "time-outline",
  },
];

export default function HelpCenter() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Help Center" subtitle="Common questions" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <SettingsSection title="Popular topics">
          {FAQS.map((item, index) => (
            <SettingsRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              color={ACCENT}
              isLast={index === FAQS.length - 1}
            />
          ))}
        </SettingsSection>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Linking.openURL("mailto:support@spotus.app")}
          className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-5 mt-3 flex-row items-center"
        >
          <View className="flex-1">
            <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold">
              Still need help?
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
              Include the room or conversation name when you reach out.
            </Text>
            <Text className="text-primary dark:text-primary-light text-xs font-bold mt-2">
              support@spotus.app
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
