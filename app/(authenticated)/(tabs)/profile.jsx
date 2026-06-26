import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Skeleton from "../../../components/ui/Skeleton";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";

const MenuItem = ({
  icon,
  label,
  subtitle,
  onPress,
  color = "#FF6B47",
  isLast = false,
}) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }}
    activeOpacity={0.6}
    className={`px-5 py-4 flex-row items-center justify-between ${!isLast ? "border-b border-gray-50 dark:border-gray-800" : ""}`}
  >
    <View className="flex-row items-center flex-1">
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
        style={{ backgroundColor: `${color}12` }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-secondary dark:text-gray-100 font-semibold text-[15px]">
          {label}
        </Text>
        {subtitle && (
          <Text
            className="text-gray-400 dark:text-gray-500 text-xs mt-0.5"
            numberOfLines={1}
          >
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
  useTheme();

  const [rooms, setRooms] = useState([]);
  useFocusEffect(
    useCallback(() => {
      const loadRooms = async () => {
        const data = await getRooms(firestoreUser?.id);
        setRooms(data);
      };
      if (firestoreUser?.id) {
        loadRooms();
      }
    }, [firestoreUser?.id]),
  );

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg dark:bg-[#111113] px-6"
        edges={["top"]}
      >
        <View className="items-center mt-8 mb-7">
          <Skeleton width={110} height={110} borderRadius={55} />
          <Skeleton
            width={150}
            height={28}
            borderRadius={14}
            style={{ marginTop: 16 }}
          />
          <Skeleton
            width={180}
            height={20}
            borderRadius={10}
            style={{ marginTop: 8 }}
          />
        </View>
        <Skeleton
          width="100%"
          height={80}
          borderRadius={16}
          style={{ marginBottom: 28 }}
        />
        <Skeleton
          width="100%"
          height={160}
          borderRadius={16}
          style={{ marginBottom: 16 }}
        />
        <Skeleton width="100%" height={160} borderRadius={16} />
      </SafeAreaView>
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

  const createdRooms = rooms.filter(
    (r) => r.createdBy === firestoreUser?.id,
  ).length;
  const joinedRooms = rooms.filter(
    (r) =>
      r.participants?.includes(firestoreUser?.id) &&
      r.createdBy !== firestoreUser?.id,
  ).length;

  return (
    <SafeAreaView className="bg-bg dark:bg-[#111113] flex-1" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center px-6 mt-2 mb-7">
          {/* Background accent */}
          <View className="absolute top-0 left-0 right-0 h-36 overflow-hidden rounded-b-[40px] " />

          <View className="relative mt-6">
            <View
              className="w-[110px] h-[110px] rounded-2xl border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-800"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Image
                source={
                  firestoreUser?.profilePic || "https://picsum.photos/200"
                }
                contentFit="cover"
                transition={500}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
          </View>

          <Text className="text-secondary dark:text-gray-100 text-[26px] font-display font-extrabold mt-4 tracking-tight">
            {firestoreUser?.userName || "User"}
          </Text>

          <Text
            className="text-muted dark:text-gray-400 text-[14px] mt-2 text-center px-8 font-medium leading-5"
            numberOfLines={2}
          >
            {firestoreUser?.bio ||
              "No bio yet — say something about yourself!"}
          </Text>
        </View>

        {/* Stats — inline, not dashboard */}
        <View className="mx-6 mb-7">
          <Text className="text-muted text-[14px] font-semibold text-center">
            <Text className="text-secondary dark:text-white font-display font-extrabold text-[15px]">{createdRooms}</Text> created · <Text className="text-secondary dark:text-white font-display font-extrabold text-[15px]">{joinedRooms}</Text> joined · <Text className="text-secondary dark:text-white font-display font-extrabold text-[15px]">{firestoreUser?.globalReputation ?? 0}</Text> rep
          </Text>
        </View>

        {/* Menu Groups */}
        <View className="bg-white dark:bg-[#1C1C20] mx-6 rounded-2xl border border-gray-100 dark:border-[#2C2C30] overflow-hidden">
          <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            General
          </Text>
          <MenuItem
            icon="person-outline"
            label="Settings"
            subtitle={firestoreUser?.email}
            onPress={() => router.push("/profile/accountSetting")}
          />
          <MenuItem
            icon="create-outline"
            label="Edit Profile"
            onPress={() => router.push("/profile/edit")}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Security"
            onPress={() => router.push("/profile/security")}
            isLast
          />
        </View>

        <View className="bg-white dark:bg-[#1C1C20] mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#2C2C30] overflow-hidden">
          <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            App
          </Text>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            color="#8B5CF6"
            onPress={() => router.push("/profile/notifications")}
          />
          <MenuItem
            icon="eye-outline"
            label="Privacy & Data"
            color="#8B5CF6"
            onPress={() => router.push("/profile/privacyData")}
          />
          <MenuItem
            icon="language-outline"
            label="Language"
            subtitle="English"
            color="#8B5CF6"
            onPress={() => router.push("/profile/language")}
            isLast
          />
        </View>

        <View className="bg-white dark:bg-[#1C1C20] mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#2C2C30] overflow-hidden">
          <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            Support
          </Text>
          <MenuItem
            icon="alert-circle-outline"
            label="Help Center"
            color="#64748B"
            onPress={() => router.push("/profile/helpCenter")}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About SpotUs"
            color="#64748B"
            onPress={() => router.push("/profile/about")}
            isLast
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.7}
          className="mx-6 mt-7 bg-red-50 dark:bg-red-950/30 py-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex-row items-center justify-center gap-2"
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-[15px]">
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-300 dark:text-gray-600 text-[10px] mt-6 tracking-wider">
          SpotUs v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
