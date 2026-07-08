import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";
import { db } from "../../../config/firebase.config";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";

export default function Notifications() {
  const { firestoreUser } = useFirestoreUser();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [roomNotifications, setRoomNotifications] = useState(true);
  const [nearbyRoomNotifications, setNearbyRoomNotifications] = useState(true);
  const { isDark } = useTheme();

  // Load saved settings on mount
  useEffect(() => {
    if (firestoreUser) {
      if (firestoreUser.notificationsEnabled !== undefined) {
        setNotificationsEnabled(firestoreUser.notificationsEnabled);
      }
      if (firestoreUser.messageNotifications !== undefined) {
        setMessageNotifications(firestoreUser.messageNotifications);
      }
      if (firestoreUser.roomNotifications !== undefined) {
        setRoomNotifications(firestoreUser.roomNotifications);
      }
      if (firestoreUser.nearbyRoomNotifications !== undefined) {
        setNearbyRoomNotifications(firestoreUser.nearbyRoomNotifications);
      }
    }
  }, [firestoreUser]);

  const persistSetting = async (key, value) => {
    if (!firestoreUser?.id) return;
    try {
      const userRef = doc(db, "users", firestoreUser.id);
      await updateDoc(userRef, {
        [key]: value,
      });
    } catch (err) {
      console.error("Error saving notification setting:", err);
    }
  };

  const toggle = (key, currentValue, setter) => {
    const newValue = !currentValue;
    setter(newValue);
    persistSetting(key, newValue);
  };

  const renderSwitch = (key, value, setter) => (
    <Switch
      value={value}
      onValueChange={() => toggle(key, value, setter)}
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
              notificationsEnabled,
              setNotificationsEnabled,
            )}
          />
          <SettingsRow
            icon="chatbubbles-outline"
            title="Message Notifications"
            description="Get notified when you receive a new direct message."
            rightComponent={renderSwitch(
              "messageNotifications",
              messageNotifications,
              setMessageNotifications,
            )}
          />
          <SettingsRow
            icon="people-outline"
            title="Room Notifications"
            description="Get notified about activity in your rooms."
            rightComponent={renderSwitch(
              "roomNotifications",
              roomNotifications,
              setRoomNotifications,
            )}
          />
          <SettingsRow
            icon="location-outline"
            title="Nearby Room Notifications"
            description="Get notified when a new room is created near you."
            rightComponent={renderSwitch(
              "nearbyRoomNotifications",
              nearbyRoomNotifications,
              setNearbyRoomNotifications,
            )}
            isLast
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
