import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

const ACCENT = "#10B981";

export default function ChildSafety() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Child Safety" subtitle="Protecting young people" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Zero tolerance warning */}
        <View className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-4 mb-4">
          <Text className="text-red-600 dark:text-red-400 text-[13px] font-bold mb-1">
            Zero tolerance for child exploitation
          </Text>
          <Text className="text-red-500/70 dark:text-red-400/60 text-xs leading-4">
            Accounts involved in CSAM, grooming, or exploitation are permanently banned and reported to NCMEC and law enforcement.
          </Text>
        </View>

        <SettingsSection title="Our commitment">
          <SettingsRow
            icon="calendar-outline"
            title="16+ only"
            description="Underage accounts are deleted immediately upon discovery."
            color={ACCENT}
          />
          <SettingsRow
            icon="eye-outline"
            title="Active monitoring"
            description="Automated systems and human review to detect violations."
            color={ACCENT}
          />
          <SettingsRow
            icon="document-lock-outline"
            title="Evidence preservation"
            description="Relevant data retained as required by law to assist investigations."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="For parents" className="mt-3">
          <SettingsRow
            icon="phone-portrait-outline"
            title="Device controls"
            description="Use iOS Screen Time or Android Family Link to manage access for teens."
            color={ACCENT}
          />
          <SettingsRow
            icon="navigate-outline"
            title="Location permissions"
            description="Disable location services for SpotUs in your device settings."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            Linking.openURL(
              "mailto:support@spotus.app?subject=URGENT%3A%20Child%20Safety",
            )
          }
          className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-4 mt-3 flex-row items-center"
        >
          <View className="flex-1">
            <Text className="text-red-600 dark:text-red-400 text-[13px] font-bold">
              Report a child safety issue
            </Text>
            <Text className="text-red-500/70 dark:text-red-400/60 text-xs mt-0.5">
              Tap to email our urgent safety team
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
