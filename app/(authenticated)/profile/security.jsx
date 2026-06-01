import { useState } from"react";
import { ScrollView, Switch } from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import ScreenHeader from"../../../components/ui/ScreenHeader";
import SettingsRow from"../../../components/ui/SettingsRow";
import SettingsSection from"../../../components/ui/SettingsSection";
import { useTheme } from"../../../context/ThemeContext";

export default function Security() {
 const [appLockEnabled, setAppLockEnabled] = useState(false);
 const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
 const { isDark } = useTheme();

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
 onValueChange={setAppLockEnabled}
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
 onValueChange={setLoginAlertsEnabled}
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
