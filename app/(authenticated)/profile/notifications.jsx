import { useState } from"react";
import { ScrollView, Switch } from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import ScreenHeader from"../../../components/ui/ScreenHeader";
import SettingsRow from"../../../components/ui/SettingsRow";
import SettingsSection from"../../../components/ui/SettingsSection";
import { useTheme } from"../../../context/ThemeContext";

export default function Notifications() {
 const [directMessages, setDirectMessages] = useState(true);
 const [roomMessages, setRoomMessages] = useState(true);
 const [nearbyRooms, setNearbyRooms] = useState(false);
 const [trustAlerts, setTrustAlerts] = useState(true);
 const [emailDigest, setEmailDigest] = useState(false);
 const { isDark } = useTheme();

 const renderSwitch = (value, onValueChange) => (
 <Switch
 value={value}
 onValueChange={onValueChange}
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
 rightComponent={renderSwitch(directMessages, setDirectMessages)}
 />
 <SettingsRow
 icon="people-outline"
 title="Room messages"
 description="Activity in rooms you have joined."
 rightComponent={renderSwitch(roomMessages, setRoomMessages)}
 isLast
 />
 </SettingsSection>

 <SettingsSection title="Discovery"className="mt-4">
 <SettingsRow
 icon="compass-outline"
 title="Nearby rooms"
 description="New rooms that match your interests nearby."
 rightComponent={renderSwitch(nearbyRooms, setNearbyRooms)}
 />
 <SettingsRow
 icon="shield-checkmark-outline"
 title="Trust milestones"
 description="Progress updates when DMs become available."
 rightComponent={renderSwitch(trustAlerts, setTrustAlerts)}
 isLast
 />
 </SettingsSection>

 <SettingsSection title="Email"className="mt-4">
 <SettingsRow
 icon="mail-outline"
 title="Weekly digest"
 description="A weekly summary of room and message activity."
 rightComponent={renderSwitch(emailDigest, setEmailDigest)}
 isLast
 />
 </SettingsSection>
 </ScrollView>
 </SafeAreaView>
 );
}
