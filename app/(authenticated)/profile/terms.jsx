import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

const ACCENT = "#8B5CF6";

export default function Terms() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Terms of Service" subtitle="The ground rules" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <SettingsSection title="Requirements">
          <SettingsRow
            icon="calendar-outline"
            title="Age 16+"
            description="You must be at least 16 years old to use SpotUs."
            color={ACCENT}
          />
          <SettingsRow
            icon="finger-print-outline"
            title="Your account"
            description="Keep your login secure. You are responsible for all activity under your account."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Behavior" className="mt-3">
          <SettingsRow
            icon="ban"
            title="Zero tolerance"
            description="Harassment, hate speech, bullying, and explicit content lead to an instant ban."
            color={ACCENT}
          />
          <SettingsRow
            icon="chatbubbles-outline"
            title="Room conduct"
            description="Keep conversations respectful. No impersonation or misinformation."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Good to know" className="mt-3">
          <SettingsRow
            icon="time-outline"
            title="Rooms expire"
            description="All rooms and their content are temporary. Messages cannot be recovered."
            color={ACCENT}
          />
          <SettingsRow
            icon="power-outline"
            title="We can act"
            description="Accounts that violate these terms may be suspended or removed at any time."
            color={ACCENT}
            isLast
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
