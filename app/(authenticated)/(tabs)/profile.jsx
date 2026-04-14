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
    className={`px-5 py-4 flex-row items-center justify-between ${!isLast ? "border-b border-gray-50" : ""}`}
  >
    <View className="flex-row items-center flex-1">
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
        style={{ backgroundColor: `${color}12` }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-secondary font-semibold text-[15px]">{label}</Text>
        {subtitle && (
          <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
  </TouchableOpacity>
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
        <View className="items-center px-6 mt-8 mb-7">
          <View className="relative">
            <View className="w-[110px] h-[110px] rounded-full border-4 border-white shadow-lg shadow-gray-200 overflow-hidden bg-gray-100">
              <Image
                source={firestoreUser?.profilePic || "https://picsum.photos/200"}
                contentFit="cover"
                transition={500}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              className="absolute -bottom-1 -right-1 bg-primary w-10 h-10 rounded-full border-4 border-bg items-center justify-center"
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-secondary text-[24px] font-extrabold mt-4 tracking-tight">
            {firestoreUser?.userName || "User"}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            {firestoreUser?.email}
          </Text>
        </View>

        {/* Stats — with a touch of color */}
        <View className="flex-row mx-6 bg-white rounded-2xl border border-gray-100 py-5 mb-7">
          <View className="items-center flex-1">
            <Text className="text-[22px] font-extrabold text-primary">
              {firestoreUser?.roomsCreated ?? 0}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Created</Text>
          </View>
          <View className="w-px bg-gray-100" />
          <View className="items-center flex-1">
            <Text className="text-[22px] font-extrabold text-secondary">
              {firestoreUser?.roomsJoined ?? 0}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Joined</Text>
          </View>
          <View className="w-px bg-gray-100" />
          <View className="items-center flex-1">
            <Text className="text-[22px] font-extrabold text-green-500">
              {firestoreUser?.globalReputation ?? 0}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Reputation</Text>
          </View>
        </View>

        {/* Menu Groups */}
        <View className="bg-white mx-6 rounded-2xl border border-gray-100 overflow-hidden">
          <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            General
          </Text>
          <MenuItem
            icon="person-outline"
            label="Account Settings"
            subtitle={firestoreUser?.email}
          />
          <MenuItem icon="create-outline" label="Edit Profile" />
          <MenuItem icon="shield-checkmark-outline" label="Security" isLast />
        </View>

        <View className="bg-white mx-6 mt-4 rounded-2xl border border-gray-100 overflow-hidden">
          <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            App
          </Text>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            color="#8B5CF6"
          />
          <MenuItem
            icon="eye-outline"
            label="Privacy & Data"
            color="#8B5CF6"
          />
          <MenuItem
            icon="language-outline"
            label="Language"
            subtitle="English"
            color="#8B5CF6"
            isLast
          />
        </View>

        <View className="bg-white mx-6 mt-4 rounded-2xl border border-gray-100 overflow-hidden">
          <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            Support
          </Text>
          <MenuItem
            icon="help-circle-outline"
            label="Help Center"
            color="#64748B"
          />
          <MenuItem
            icon="information-circle-outline"
            label="About SpotUs"
            color="#64748B"
            isLast
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.7}
          className="mx-6 mt-7 bg-red-50 py-4.5 rounded-2xl border border-red-100 flex-row items-center justify-center gap-2"
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-[15px]">
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-300 text-[10px] mt-6 tracking-wider">
          SpotUs v1.0.4
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
