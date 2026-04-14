import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import useFirestoreUser from "../../../hook/useFireStoreUser";

const MenuItem = ({
  icon,
  label,
  subtitle,
  onPress,
  color = "#4F46E5",
  isLast = false,
}) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }}
    activeOpacity={0.6}
    className={`bg-white px-5 py-4.5 flex-row items-center justify-between ${!isLast ? "border-b border-border-light" : ""}`}
  >
    <View className="flex-row items-center flex-1">
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: `${color}12` }}
      >
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-secondary font-bold text-[15px]">{label}</Text>
        {subtitle && (
          <Text
            className="text-muted text-xs font-medium mt-0.5"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
  </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
  <Text className="text-muted font-bold text-[10px] uppercase tracking-[2px] px-6 mt-3 mb-2.5">
    {title}
  </Text>
);

export default function Profile() {
  const { signOut } = useAuth();
  const { firestoreUser, loading } = useFirestoreUser();
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!firestoreUser) {
    return <Redirect href="/welcome" />;
  }

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="bg-bg flex-1" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center px-6 mt-8 mb-8">
          <View className="relative">
            <View className="w-[120px] h-[120px] rounded-[36px] border-4 border-white shadow-xl shadow-slate-200 overflow-hidden bg-surface-alt">
              <Image
                source={firestoreUser?.profilePic || "https://picsum.photos/200"}
                contentFit="cover"
                transition={500}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              className="absolute -bottom-1 -right-1 bg-primary w-11 h-11 rounded-2xl border-4 border-bg items-center justify-center shadow-md shadow-indigo-200"
            >
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-secondary text-[28px] font-black mt-5 tracking-tight">
            {firestoreUser?.userName || "User"}
          </Text>
          <Text className="text-muted text-sm font-semibold mt-1">
            {firestoreUser?.email}
          </Text>
        </View>

        {/* Stats Section */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-3xl p-5 border border-border-light flex-row items-center justify-between">
            <View className="items-center flex-1">
              <Text className="text-[26px] font-black text-primary">
                {firestoreUser?.roomsCreated ?? 0}
              </Text>
              <Text className="text-muted text-[9px] font-bold uppercase tracking-[1.5px] mt-1">
                Created
              </Text>
            </View>
            <View className="w-[1px] bg-border-light h-10" />
            <View className="items-center flex-1">
              <Text className="text-[26px] font-black text-secondary">
                {firestoreUser?.roomsJoined ?? 0}
              </Text>
              <Text className="text-muted text-[9px] font-bold uppercase tracking-[1.5px] mt-1">
                Joined
              </Text>
            </View>
            <View className="w-[1px] bg-border-light h-10" />
            <View className="items-center flex-1">
              <Text className="text-[26px] font-black text-success">
                {firestoreUser?.globalReputation ?? 0}
              </Text>
              <Text className="text-muted text-[9px] font-bold uppercase tracking-[1.5px] mt-1">
                Reputation
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="bg-white mx-6 rounded-3xl border border-border-light overflow-hidden">
          <SectionHeader title="General" />
          <MenuItem
            icon="person-outline"
            label="Account Settings"
            subtitle={firestoreUser?.email}
          />
          <MenuItem icon="create-outline" label="Edit Profile" />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Security"
            isLast
          />
        </View>

        <View className="bg-white mx-6 mt-5 rounded-3xl border border-border-light overflow-hidden">
          <SectionHeader title="App Settings" />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            color="#6366F1"
          />
          <MenuItem
            icon="eye-outline"
            label="Privacy & Data"
            color="#6366F1"
          />
          <MenuItem
            icon="language-outline"
            label="Language"
            subtitle="English"
            color="#6366F1"
            isLast
          />
        </View>

        <View className="bg-white mx-6 mt-5 rounded-3xl border border-border-light overflow-hidden">
          <SectionHeader title="Support & Legal" />
          <MenuItem
            icon="help-circle-outline"
            label="Help Center"
            color="#94A3B8"
          />
          <MenuItem
            icon="information-circle-outline"
            label="About SpotUs"
            color="#94A3B8"
            isLast
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.7}
          className="mx-6 mt-8 bg-danger/8 py-[18px] rounded-3xl border border-danger/15 flex-row items-center justify-center gap-2.5"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-danger font-bold text-[15px] tracking-wide">
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-muted/40 text-[9px] font-bold mt-8 uppercase tracking-[2.5px]">
          SpotUs v1.0.4
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
