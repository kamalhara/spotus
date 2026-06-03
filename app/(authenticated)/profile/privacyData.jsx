import { doc, updateDoc } from"firebase/firestore";
import { useEffect, useState } from"react";
import { ScrollView, Switch, Text, TouchableOpacity } from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import ScreenHeader from"../../../components/ui/ScreenHeader";
import SettingsRow from"../../../components/ui/SettingsRow";
import SettingsSection from"../../../components/ui/SettingsSection";
import { db } from"../../../config/firebase.config";
import { useTheme } from"../../../context/ThemeContext";
import useFirestoreUser from"../../../hook/useFireStoreUser";

export default function PrivacyData() {
 const { firestoreUser } = useFirestoreUser();

 const [publicProfile, setPublicProfile] = useState(true);
 const [readReceipts, setReadReceipts] = useState(true);
 const [preciseLocation, setPreciseLocation] = useState(false);
 const { isDark } = useTheme();

 // Load saved settings on mount
 useEffect(() => {
 if (firestoreUser?.settings?.privacy) {
 const s = firestoreUser.settings.privacy;
 if (s.publicProfile !== undefined) setPublicProfile(s.publicProfile);
 if (s.readReceipts !== undefined) setReadReceipts(s.readReceipts);
 if (s.preciseLocation !== undefined) setPreciseLocation(s.preciseLocation);
 }
 }, [firestoreUser?.settings?.privacy]);

 const persistSetting = async (key, value) => {
 if (!firestoreUser?.id) return;
 try {
 const userRef = doc(db, "users", firestoreUser.id);
 await updateDoc(userRef, {
 [`settings.privacy.${key}`]: value,
 });
 } catch (err) {
 console.error("Error saving privacy setting:", err);
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
 <ScreenHeader title="Privacy & Data"subtitle="Visibility and exports"/>

 <ScrollView
 showsVerticalScrollIndicator={false}
 contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
 >
 <SettingsSection title="Profile">
 <SettingsRow
 icon="person-circle-outline"
 title="Public profile"
 description="Allow people in shared rooms to view your profile."
 rightComponent={renderSwitch("publicProfile", publicProfile, setPublicProfile)}
 />
 <SettingsRow
 icon="checkmark-done-outline"
 title="Read receipts"
 description="Show when you have seen direct messages."
 rightComponent={renderSwitch("readReceipts", readReceipts, setReadReceipts)}
 isLast
 />
 </SettingsSection>

 <SettingsSection title="Location"className="mt-4">
 <SettingsRow
 icon="location-outline"
 title="Precise location"
 description="Use exact location for room distance estimates."
 rightComponent={renderSwitch("preciseLocation", preciseLocation, setPreciseLocation)}
 isLast
 />
 </SettingsSection>

 <SettingsSection title="Data"className="mt-4">
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
 className="bg-white dark:bg-[#1A1A22] rounded-2xl border border-gray-100 dark:border-[#2A2A36] mt-4 px-5 py-4"
 >
 <Text className="text-primary dark:text-primary-light text-sm font-bold">
 Review privacy policy
 </Text>
 </TouchableOpacity>
 </ScrollView>
 </SafeAreaView>
 );
}
