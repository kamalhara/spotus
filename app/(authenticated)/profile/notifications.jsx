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

 const [messageRequests, setMessageRequests] = useState(true);
 const [roomInvites, setRoomInvites] = useState(true);
 const [replies, setReplies] = useState(true);
 const [nearbyRooms, setNearbyRooms] = useState(false);
 const [emailDigest, setEmailDigest] = useState(false);
 const { isDark } = useTheme();

 // Load saved settings on mount
 useEffect(() => {
 if (firestoreUser?.settings?.notifications) {
 const s = firestoreUser.settings.notifications;
 if (s.messageRequests !== undefined) setMessageRequests(s.messageRequests);
 if (s.roomInvites !== undefined) setRoomInvites(s.roomInvites);
 if (s.replies !== undefined) setReplies(s.replies);
 if (s.nearbyRooms !== undefined) setNearbyRooms(s.nearbyRooms);
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
 trackColor={{ false: isDark ? "#242428" : "#E5E7EB", true:"#FF6B47"}}
 thumbColor="#FFFFFF"
 />
 );

 return (
 <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]"edges={["top"]}>
 <ScreenHeader title="Notifications"subtitle="Messages and rooms"/>

 <ScrollView
 showsVerticalScrollIndicator={false}
 contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
 >
 <SettingsSection title="Messages & Interactions">
 <SettingsRow
 icon="mail-unread-outline"
 title="Message Requests"
 description="When someone wants to DM you."
 rightComponent={renderSwitch("messageRequests", messageRequests, setMessageRequests)}
 />
 <SettingsRow
 icon="person-add-outline"
 title="Room Invites"
 description="When someone invites you to a room."
 rightComponent={renderSwitch("roomInvites", roomInvites, setRoomInvites)}
 />
 <SettingsRow
 icon="chatbubbles-outline"
 title="Replies & Mentions"
 description="When someone replies to your message."
 rightComponent={renderSwitch("replies", replies, setReplies)}
 isLast
 />
 </SettingsSection>

 <SettingsSection title="Discovery"className="mt-4">
 <SettingsRow
 icon="compass-outline"
 title="Nearby rooms"
 description="New rooms that match your interests nearby."
 rightComponent={renderSwitch("nearbyRooms", nearbyRooms, setNearbyRooms)}
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
