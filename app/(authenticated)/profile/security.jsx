import { ScrollView, Switch } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";
import { useTheme } from "../../../context/ThemeContext";
import { useModal } from "../../../context/ModalContext";
import useUserSettings from "../../../hook/useUserSettings";

export default function Security() {
  const { isDark } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const { showAlert } = useModal();
  const { settings, updateSetting } = useUserSettings({
    appLockEnabled: false,
  });
  const [sessionCount, setSessionCount] = useState(1);

  useEffect(() => {
    user?.getSessions().then((sessions) => setSessionCount(sessions.length)).catch(() => {});
  }, [user]);

  const toggleAppLock = async (enabled) => {
    if (enabled) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        showAlert(
          "Device lock unavailable",
          "Set up Face ID, Touch ID, fingerprint, or a device passcode before enabling App Lock.",
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enable App Lock",
        cancelLabel: "Cancel",
      });
      if (!result.success) return;
    }
    await updateSetting("appLockEnabled", enabled);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Security" subtitle="Account access and alerts" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <SettingsSection title="Access">
          <SettingsRow
            icon="lock-closed-outline"
            title="Password"
            description="Change your password from account settings."
            rightText="Managed"
            onPress={() => router.push("/profile/changePassword")}
          />
          <SettingsRow
            icon="finger-print-outline"
            title="App lock"
            description="Require device unlock before opening SpotUs."
            rightComponent={
              <Switch
                value={settings.appLockEnabled}
                onValueChange={toggleAppLock}
                trackColor={{
                  false: isDark ? "#242428" : "#E5E7EB",
                  true: "#FF6B47",
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsRow
            icon="phone-portrait-outline"
            title="Active sessions"
            description="Devices currently signed in to your SpotUs account."
            rightText={`${sessionCount} ${sessionCount === 1 ? "session" : "sessions"}`}
            isLast
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
