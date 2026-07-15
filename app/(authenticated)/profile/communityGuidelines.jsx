import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

const ACCENT = "#8B5CF6";

export default function CommunityGuidelines() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader
        title="Community Guidelines"
        subtitle="Rules for using SpotUs"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Quick-glance pills */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {["Be kind", "No hate", "Respect privacy", "No spam"].map((rule) => (
            <View
              key={rule}
              className="bg-white dark:bg-[#1C1C20] rounded-full border border-gray-100 dark:border-[#2C2C30] px-3.5 py-2"
            >
              <Text className="text-secondary dark:text-gray-200 text-xs font-bold">
                {rule}
              </Text>
            </View>
          ))}
        </View>

        <SettingsSection title="The details">
          <SettingsRow
            icon="happy-outline"
            title="Treat people right"
            description="No bullying, insults, or harassment. Everyone deserves respect."
            color={ACCENT}
          />
          <SettingsRow
            icon="hand-left-outline"
            title="No discrimination"
            description="Attacks based on race, gender, orientation, religion, or disability are never okay."
            color={ACCENT}
          />
          <SettingsRow
            icon="image-outline"
            title="Keep it clean"
            description="No pornographic, sexually explicit, or violent imagery."
            color={ACCENT}
          />
          <SettingsRow
            icon="lock-closed-outline"
            title="Protect privacy"
            description="Never share someone else&apos;s phone number, address, or location without consent."
            color={ACCENT}
          />
          <SettingsRow
            icon="flag-outline"
            title="Report a problem"
            description="Use the block and report buttons when a person or message breaks these rules."
            color={ACCENT}
            isLast
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
