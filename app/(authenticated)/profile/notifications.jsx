import * as ExpoNotifications from "expo-notifications";
import { Linking, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";
import { useTheme } from "../../../context/ThemeContext";
import { useModal } from "../../../context/ModalContext";
import useUserSettings from "../../../hook/useUserSettings";
import { registerForPushNotifications } from "../../../lib/notification";

export default function Notifications() {
  const { isDark } = useTheme();
  const { showConfirm } = useModal();
  const { firestoreUser, settings, updateSetting } = useUserSettings({
    notificationsEnabled: true,
    messageNotifications: true,
    roomNotifications: true,
    nearbyRoomNotifications: true,
  });

  const toggle = async (key, value) => {
    if (key === "notificationsEnabled" && value) {
      const permission = await ExpoNotifications.getPermissionsAsync();
      if (permission.status !== "granted" && !permission.canAskAgain) {
        showConfirm({
          title: "Notifications are blocked",
          message: "Enable notifications for SpotUs in your device settings.",
          confirmText: "Open Settings",
          onConfirm: Linking.openSettings,
        });
        return;
      }
      await registerForPushNotifications(firestoreUser?.id);
    }
    await updateSetting(key, value);
  };

  const renderSwitch = (key, value) => (
    <Switch
      value={value}
      onValueChange={(nextValue) => toggle(key, nextValue)}
      disabled={key !== "notificationsEnabled" && !settings.notificationsEnabled}
      trackColor={{ false: isDark ? "#242428" : "#E5E7EB", true: "#FF6B47" }}
      thumbColor="#FFFFFF"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader
        title="Notifications"
        subtitle="Push notification preferences"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <SettingsSection title="Push Notifications">
          <SettingsRow
            icon="notifications-outline"
            title="All Notifications"
            description="Enable or disable all push notifications."
            rightComponent={renderSwitch(
              "notificationsEnabled",
              settings.notificationsEnabled,
            )}
          />
          <SettingsRow
            icon="chatbubbles-outline"
            title="Message Notifications"
            description="Get notified when you receive a new direct message."
            rightComponent={renderSwitch(
              "messageNotifications",
              settings.messageNotifications,
            )}
          />
          <SettingsRow
            icon="people-outline"
            title="Room Notifications"
            description="Get notified about activity in your rooms."
            rightComponent={renderSwitch(
              "roomNotifications",
              settings.roomNotifications,
            )}
          />
          <SettingsRow
            icon="location-outline"
            title="Nearby Room Notifications"
            description="Get notified when a new room is created near you."
            rightComponent={renderSwitch(
              "nearbyRoomNotifications",
              settings.nearbyRoomNotifications,
            )}
            isLast
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
