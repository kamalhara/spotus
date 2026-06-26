import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";
import { useTheme } from "../../../context/ThemeContext";

export default function PrivacyData() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [preciseLocation, setPreciseLocation] = useState(false);
  const { isDark } = useTheme();

  const renderSwitch = (value, onValueChange) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: isDark ? "#242428" : "#E5E7EB", true: "#FF6B47" }}
      thumbColor="#FFFFFF"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Privacy & Data" subtitle="Visibility and exports" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <SettingsSection title="Profile">
          <SettingsRow
            icon="person-circle-outline"
            title="Public profile"
            description="Allow people in shared rooms to view your profile."
            rightComponent={renderSwitch(publicProfile, setPublicProfile)}
          />
          <SettingsRow
            icon="checkmark-done-outline"
            title="Read receipts"
            description="Show when you have seen direct messages."
            rightComponent={renderSwitch(readReceipts, setReadReceipts)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Location" className="mt-4">
          <SettingsRow
            icon="location-outline"
            title="Precise location"
            description="Use exact location for room distance estimates."
            rightComponent={renderSwitch(preciseLocation, setPreciseLocation)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Data" className="mt-4">
          <SettingsRow
            icon="download-outline"
            title="Export account data"
            description="Download your profile and activity records."
          />
          <SettingsRow
            icon="trash-outline"
            title="Delete account request"
            description="Review deletion requirements before continuing."
            color="#EF4444"
            isLast
          />
        </SettingsSection>

        <TouchableOpacity
          activeOpacity={0.75}
          className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] mt-4 px-5 py-4"
        >
          <Text className="text-primary dark:text-primary-light text-sm font-bold">
            Review privacy policy
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
