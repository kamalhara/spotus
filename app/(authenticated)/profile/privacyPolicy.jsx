import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

const ACCENT = "#8B5CF6";

export default function PrivacyPolicy() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Privacy Policy" subtitle="How we handle your data" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <SettingsSection title="What we collect">
          <SettingsRow
            icon="person-outline"
            title="Account basics"
            description="Name, email, profile photo, and username."
            color={ACCENT}
          />
          <SettingsRow
            icon="location-outline"
            title="Location"
            description="Precise or approximate — your choice. Ghost Mode hides you entirely."
            color={ACCENT}
          />
          <SettingsRow
            icon="chatbubble-outline"
            title="Messages & images"
            description="Content you send in rooms. Deleted when rooms expire."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="How we use it" className="mt-3">
          <SettingsRow
            icon="compass-outline"
            title="Local discovery"
            description="Finding nearby rooms and conversations happening around you."
            color={ACCENT}
          />
          <SettingsRow
            icon="notifications-outline"
            title="Notifications"
            description="Room activity, messages, and invitations."
            color={ACCENT}
          />
          <SettingsRow
            icon="shield-outline"
            title="Safety enforcement"
            description="Enforcing community guidelines and preventing abuse."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Your control" className="mt-3">
          <SettingsRow
            icon="eye-off-outline"
            title="Ghost Mode"
            description="Browse rooms without sharing your location."
            color={ACCENT}
          />
          <SettingsRow
            icon="trash-outline"
            title="Delete anytime"
            description="Delete your account and all associated data whenever you want."
            color={ACCENT}
          />
          <SettingsRow
            icon="hand-left-outline"
            title="No data sales"
            description="We never sell your personal information."
            color={ACCENT}
            isLast
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
