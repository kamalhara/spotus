import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";
import { useTheme } from "../../../context/ThemeContext";
import { useLocalization } from "../../../context/LocalizationContext";
import { useModal } from "../../../context/ModalContext";
import useUserSettings from "../../../hook/useUserSettings";
import { trackEvent } from "../../../lib/analytics";

export default function PrivacyData() {
  const [isGhostBrowsing, setIsGhostBrowsing] = useState(false);
  const { isDark } = useTheme();
  const { t } = useLocalization();
  const { showAlert } = useModal();
  const router = useRouter();
  const { firestoreUser, settings, updateSetting } = useUserSettings({
    publicProfile: true,
    readReceipts: true,
    preciseLocation: false,
  });

  useEffect(() => {
    AsyncStorage.getItem("isGhostBrowsing").then((val) => {
      setIsGhostBrowsing(val === "true");
    });
  }, []);

  const handleGhostToggle = async (val) => {
    setIsGhostBrowsing(val);
    await AsyncStorage.setItem("isGhostBrowsing", val ? "true" : "false");
    trackEvent(val ? "Explore Mode enabled" : "Explore Mode disabled", {
      source: "privacy_settings",
    });
  };

  const handlePreciseLocation = async (value) => {
    await AsyncStorage.setItem("preciseLocation", value ? "true" : "false");
    await updateSetting("preciseLocation", value);
  };

  const handleExport = async () => {
    if (!firestoreUser) return;
    try {
      const { expoPushToken: _token, pushToken: _legacyToken, ...safeProfile } = firestoreUser;
      const exportFile = new File(Paths.cache, `spotus-account-${Date.now()}.json`);
      exportFile.create();
      exportFile.write(JSON.stringify({ exportedAt: new Date().toISOString(), profile: safeProfile }, null, 2));
      await Sharing.shareAsync(exportFile.uri, {
        mimeType: "application/json",
        dialogTitle: "Export SpotUs account data",
      });
    } catch (error) {
      console.error("Account data export failed:", error);
      showAlert(t("common.error"), t("privacy.exportFailed"));
    }
  };

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
      <ScreenHeader title={t("privacy.title")} subtitle={t("privacy.subtitle")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <SettingsSection title={t("privacy.profile")}>
          <SettingsRow
            icon="person-circle-outline"
            title={t("privacy.publicProfile")}
            description={t("privacy.publicProfileDesc")}
            rightComponent={renderSwitch(settings.publicProfile, (value) => updateSetting("publicProfile", value))}
          />
          <SettingsRow
            icon="checkmark-done-outline"
            title={t("privacy.readReceipts")}
            description={t("privacy.readReceiptsDesc")}
            rightComponent={renderSwitch(settings.readReceipts, (value) => updateSetting("readReceipts", value))}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t("privacy.location")} className="mt-4">
          <SettingsRow
            icon="location-outline"
            title={t("privacy.preciseLocation")}
            description={t("privacy.preciseLocationDesc")}
            rightComponent={renderSwitch(settings.preciseLocation, handlePreciseLocation)}
          />
          <SettingsRow
            icon="eye-outline"
            title={t("privacy.previewMode")}
            description={t("privacy.previewModeDesc")}
            rightComponent={renderSwitch(isGhostBrowsing, handleGhostToggle)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t("privacy.data")} className="mt-4">
          <SettingsRow
            icon="download-outline"
            title={t("privacy.exportData")}
            description={t("privacy.exportDataDesc")}
            onPress={handleExport}
          />
          <SettingsRow
            icon="trash-outline"
            title={t("privacy.deleteAccount")}
            description={t("privacy.deleteAccountDesc")}
            color="#EF4444"
            onPress={() => router.push("/profile/deleteAccount")}
            isLast
          />
        </SettingsSection>

        <TouchableOpacity
          onPress={() => router.push("/profile/privacyPolicy")}
          activeOpacity={0.75}
          className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] mt-4 px-5 py-4"
        >
          <Text className="text-primary dark:text-primary-light text-sm font-bold">
            {t("privacy.privacyPolicy")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
