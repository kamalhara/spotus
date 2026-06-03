import { doc, updateDoc } from"firebase/firestore";
import { useEffect, useState } from"react";
import { ScrollView, Switch } from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import ScreenHeader from"../../../components/ui/ScreenHeader";
import SettingsRow from"../../../components/ui/SettingsRow";
import SettingsSection from"../../../components/ui/SettingsSection";
import { db } from"../../../config/firebase.config";
import { useTheme } from"../../../context/ThemeContext";
import useFirestoreUser from"../../../hook/useFireStoreUser";

export default function Notifications() {
 const { firestoreUser } = useFirestoreUser();

 const [directMessages, setDirectMessages] = useState(true);
 const [roomMessages, setRoomMessages] = useState(true);
 const [nearbyRooms, setNearbyRooms] = useState(false);
 const [trustAlerts, setTrustAlerts] = useState(true);
 const [emailDigest, setEmailDigest] = useState(false);
 const { isDark } = useTheme();

 // Load saved settings on mount
 useEffect(() => {
 if (firestoreUser?.settings?.notifications) {
 const s = firestoreUser.settings.notifications;
 if (s.directMessages !== undefined) setDirectMessages(s.directMessages);
 if (s.roomMessages !== undefined) setRoomMessages(s.roomMessages);
 if (s.nearbyRooms !== undefined) setNearbyRooms(s.nearbyRooms);
 if (s.trustAlerts !== undefined) setTrustAlerts(s.trustAlerts);
 if (s.emailDigest !== undefined) setEmailDigest(s.emailDigest);
 }
 }, [firestoreUser?.settings?.notifications]);

 const persistSetting = async (key, value) => {
 if (!firestoreUser?.id) return;
 try {
 const userRef = doc(db, "users", firestoreUser.id);
 await updateDoc(userRef, {
 [`settings.notifications.${key}`]: value,
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
 trackColor={{ false: isDark ? "#23232E" : "#E5E7EB", true:"#4F46E5"}}
 thumbColor="#FFFFFF"
 />
 );

 return (
 <SafeAreaView className="flex-1 bg-bg dark:bg-[#0F0F13]"edges={["top"]}>
 <ScreenHeader title="Notifications"subtitle="Messages and rooms"/>

 <ScrollView
 showsVerticalScrollIndicator={false}
 contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
 >
 <SettingsSection title="Messages">
 <SettingsRow
 icon="chatbubble-outline"
 title="Direct messages"
 description="New one-to-one messages from unlocked contacts."
 rightComponent={renderSwitch("directMessages", directMessages, setDirectMessages)}
 />
 <SettingsRow
 icon="people-outline"
 title="Room messages"
 description="Activity in rooms you have joined."
 rightComponent={renderSwitch("roomMessages", roomMessages, setRoomMessages)}
 isLast
 />
 </SettingsSection>

 <SettingsSection title="Discovery"className="mt-4">
 <SettingsRow
 icon="compass-outline"
 title="Nearby rooms"
 description="New rooms that match your interests nearby."
 rightComponent={renderSwitch("nearbyRooms", nearbyRooms, setNearbyRooms)}
 />
 <SettingsRow
 icon="shield-checkmark-outline"
 title="Trust milestones"
 description="Progress updates when DMs become available."
 rightComponent={renderSwitch("trustAlerts", trustAlerts, setTrustAlerts)}
 isLast
 />
 </SettingsSection>

 <SettingsSection title="Email"className="mt-4">
 <SettingsRow
 icon="mail-outline"
 title="Weekly digest"
 description="A weekly summary of room and message activity."
 rightComponent={renderSwitch("emailDigest", emailDigest, setEmailDigest)}
 isLast
 />
 </SettingsSection>
 </ScrollView>
 </SafeAreaView>
 );
}
