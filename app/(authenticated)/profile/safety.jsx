import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

const ACCENT = "#10B981";

export default function Safety() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Safety Center" subtitle="Stay safe on SpotUs" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Emergency banner */}
        <View className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-4 mb-4 flex-row items-center">
          <Ionicons
            name="warning"
            size={18}
            color="#EF4444"
            style={{ marginRight: 12 }}
          />
          <View className="flex-1">
            <Text className="text-red-600 dark:text-red-400 text-[13px] font-bold">
              In immediate danger? Call 911 / 112 right away.
            </Text>
          </View>
        </View>

        <SettingsSection title="Your toolkit">
          <SettingsRow
            icon="eye-off-outline"
            title="Ghost Mode"
            description="Browse rooms invisibly. Your location is not shared."
            color={ACCENT}
          />
          <SettingsRow
            icon="location-outline"
            title="Approximate location"
            description="Share a general area instead of exact coordinates."
            color={ACCENT}
          />
          <SettingsRow
            icon="ban"
            title="Block users"
            description="Cut off all contact instantly. They cannot see your activity."
            color={ACCENT}
          />
          <SettingsRow
            icon="flag-outline"
            title="Report abuse"
            description="Flag harassment, threats, or illegal behavior. We act within 24 hours."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Meeting up IRL" className="mt-3">
          <SettingsRow
            icon="sunny-outline"
            title="Public places only"
            description="Always meet in a well-lit public space."
            color={ACCENT}
          />
          <SettingsRow
            icon="people-outline"
            title="Tell a friend"
            description="Let someone you trust know where you are going."
            color={ACCENT}
          />
          <SettingsRow
            icon="walk-outline"
            title="Trust your gut"
            description="If something feels off, leave. No conversation is worth your safety."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="How Reporting Works" className="mt-3">
          <SettingsRow
            icon="shield-checkmark"
            title="Reports are reviewed"
            description="Our team reviews every report manually. False reports may result in account restrictions."
            color="#FF6B47"
          />
          <SettingsRow
            icon="warning-outline"
            title="Child safety priority"
            description="Reports involving minors are escalated immediately to specialized teams and law enforcement when necessary."
            color="#EF4444"
            isLast
          />
        </SettingsSection>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Linking.openURL("mailto:support@spotus.app")}
          className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-5 mt-3 flex-row items-center"
        >
          <View className="flex-1">
            <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold">
              Report a safety issue
            </Text>
            <Text className="text-primary dark:text-primary-light text-xs font-semibold mt-1">
              support@spotus.app
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
