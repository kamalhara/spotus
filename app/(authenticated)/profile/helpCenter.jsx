import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

const FAQS = [
  {
    title: "Unlocking direct messages",
    description:
      "Send 10 quality messages inside a shared room to build trust.",
    icon: "shield-checkmark-outline",
  },
  {
    title: "Rooms",
    description:
      "Rooms group nearby people around shared interests and topics.",
    icon: "people-outline",
  },
  {
    title: "Leaving a room",
    description: "Open room info and use Leave Room from the bottom action.",
    icon: "log-out-outline",
  },
];

export default function HelpCenter() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
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
              isLast={index === FAQS.length - 1}
            />
          ))}
        </SettingsSection>

        <View className="bg-white dark:bg-[#1A1A22] rounded-2xl border border-gray-100 dark:border-[#2A2A36] p-5 mt-4">
          <Text className="text-secondary dark:text-gray-100 text-base font-extrabold">
            Support
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-sm leading-5 mt-1">
            Include the room or conversation name when you contact support.
          </Text>
          <Text className="text-primary dark:text-primary-light text-sm font-bold mt-4">
            support@spotus.app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
