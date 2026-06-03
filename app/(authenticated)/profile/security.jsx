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

export default function Security() {
 const { firestoreUser } = useFirestoreUser();

 const [appLockEnabled, setAppLockEnabled] = useState(false);
 const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
 const { isDark } = useTheme();

 // Load saved settings on mount
 useEffect(() => {
 if (firestoreUser?.settings?.security) {
 const s = firestoreUser.settings.security;
 if (s.appLockEnabled !== undefined) setAppLockEnabled(s.appLockEnabled);
 if (s.loginAlertsEnabled !== undefined) setLoginAlertsEnabled(s.loginAlertsEnabled);
 }
 }, [firestoreUser?.settings?.security]);

 const persistSetting = async (key, value) => {
 if (!firestoreUser?.id) return;
 try {
 const userRef = doc(db, "users", firestoreUser.id);
 await updateDoc(userRef, {
 [`settings.security.${key}`]: value,
 });
 } catch (err) {
 console.error("Error saving security setting:", err);
 }
 };

 const toggle = (key, currentValue, setter) => {
 const newValue = !currentValue;
 setter(newValue);
 persistSetting(key, newValue);
 };

 return (
 <SafeAreaView className="flex-1 bg-bg dark:bg-[#0F0F13]"edges={["top"]}>
 <ScreenHeader title="Security"subtitle="Account access and alerts"/>

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
 />
 <SettingsRow
 icon="finger-print-outline"
 title="App lock"
 description="Require device unlock before opening SpotUs."
 rightComponent={
 <Switch
 value={appLockEnabled}
 onValueChange={() => toggle("appLockEnabled", appLockEnabled, setAppLockEnabled)}
 trackColor={{ false: isDark ? "#23232E" : "#E5E7EB", true:"#4F46E5"}}
 thumbColor="#FFFFFF"
 />
 }
 />
 <SettingsRow
 icon="phone-portrait-outline"
 title="Trusted devices"
 description="This device is currently trusted."
 rightText="1 device"
 isLast
 />
 </SettingsSection>

 <SettingsSection title="Alerts"className="mt-4">
 <SettingsRow
 icon="notifications-outline"
 title="Login alerts"
 description="Get notified when your account is used on a new device."
 rightComponent={
 <Switch
 value={loginAlertsEnabled}
 onValueChange={() => toggle("loginAlertsEnabled", loginAlertsEnabled, setLoginAlertsEnabled)}
 trackColor={{ false: isDark ? "#23232E" : "#E5E7EB", true:"#4F46E5"}}
 thumbColor="#FFFFFF"
 />
 }
 isLast
 />
 </SettingsSection>
 </ScrollView>
 </SafeAreaView>
 );
}
