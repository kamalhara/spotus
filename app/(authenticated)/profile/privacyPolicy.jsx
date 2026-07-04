import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";

const SECTIONS = [
  {
    title: "Information we show",
    body: "Your profile, room memberships, and message activity help other members understand who they are talking to.",
  },
  {
    title: "Location",
    body: "Location is used for nearby room suggestions and distance estimates.",
  },
  {
    title: "Your choices",
    body: "You can review visibility, location, blocked users, and account data from Privacy & Data.",
  },
];

export default function PrivacyPolicy() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Privacy Policy" subtitle="Privacy details" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {SECTIONS.map((section) => (
          <View
            key={section.title}
            className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-5 mb-3"
          >
            <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold">
              {section.title}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm leading-6 mt-2">
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
