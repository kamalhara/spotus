import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

const ACCENT = "#10B981";

export default function ContentModeration() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader
        title="Content Moderation"
        subtitle="Filtering, reports, and account action"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <SettingsSection title="How it works">
          <SettingsRow
            icon="funnel-outline"
            title="Automated filters"
            description="Automated checks can flag explicit terms, hate speech, and spam."
            color={ACCENT}
          />
          <SettingsRow
            icon="people-outline"
            title="Community reporting"
            description="Every message and profile has a report button."
            color={ACCENT}
          />
          <SettingsRow
            icon="eye-outline"
            title="Report review"
            description="Flagged content can be reviewed with relevant account and room details."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="What happens" className="mt-3">
          <SettingsRow
            icon="trash-outline"
            title="Content removal"
            description="Messages, images, or rooms may be removed when they break the rules."
            color={ACCENT}
          />
          <SettingsRow
            icon="pause-circle-outline"
            title="Temporary suspension"
            description="Repeat offenders may be temporarily blocked from rooms."
            color={ACCENT}
          />
          <SettingsRow
            icon="close-circle-outline"
            title="Account ban"
            description="Severe or repeated violations may result in an account ban."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-5 mt-3">
          <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold mb-1">
            Appeals
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-sm leading-5">
            Email support with your account details and the action you want reviewed.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
