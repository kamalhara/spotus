import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Skeleton from "../../../components/ui/Skeleton";

import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";
import { getTrustBadge } from "../../../lib/trust";

const MenuItem = ({
  icon,
  label,
  subtitle,
  onPress,
  color = "#6B7280",
  isLast = false,
}) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }}
    activeOpacity={0.6}
    className={`px-5 py-3.5 flex-row items-center justify-between ${!isLast ? "border-b border-gray-50 dark:border-[#222226]" : ""}`}
  >
    <View className="flex-row items-center flex-1">
      <Ionicons
        name={icon}
        size={18}
        color={color}
        style={{ marginRight: 14 }}
      />
      <View className="flex-1">
        <Text className="text-secondary dark:text-gray-100 font-medium text-[15px]">
          {label}
        </Text>
        {subtitle && (
          <Text
            className="text-gray-400 dark:text-gray-500 text-[12px] mt-0.5 font-body"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function Profile() {
  const { signOut } = useAuth();
  const { firestoreUser, loading } = useFirestoreUser();
  const router = useRouter();

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
        className="flex-1 bg-bg dark:bg-[#111112] px-6"
        edges={["top"]}
      >
        <View className="items-center mt-8 mb-7">
          <Skeleton width={100} height={100} borderRadius={36} />
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
    <SafeAreaView className="bg-bg dark:bg-[#111112] flex-1" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header — clean, no gradient */}
        <View className="items-center px-6 pt-6 pb-4">
          {/* Avatar and Edit Button */}
          <View className="relative">
            <View className="w-[100px] h-[100px] rounded-[36px] overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                source={
                  firestoreUser?.profilePic || "https://picsum.photos/200"
                }
                contentFit="cover"
                transition={500}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push("/profile/edit")}
              activeOpacity={0.8}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full items-center justify-center border-3 border-bg dark:border-[#111112]"
              style={{ borderWidth: 3 }}
            >
              <Ionicons name="pencil" size={13} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-secondary dark:text-gray-100 text-[24px] font-heading mt-4 tracking-tight text-center">
            {firestoreUser?.userName || "User"}
          </Text>

          <Text
            className="text-muted dark:text-gray-400 text-[14px] mt-1.5 text-center px-8 font-body leading-5"
            numberOfLines={2}
          >
            {firestoreUser?.bio || "No bio yet — say something about yourself!"}
          </Text>

          {/* Inline stats */}
          <View className="flex-row items-center mt-4 gap-4">
            {(() => {
              const badge = getTrustBadge(firestoreUser?.globalReputation ?? 0);
              return (
                <View className="flex-row items-center">
                  <Ionicons name={badge.icon} size={13} color={badge.color} />
                  <Text
                    className="text-[12px] font-medium ml-1"
                    style={{ color: badge.color }}
                  >
                    {badge.label}
                  </Text>
                </View>
              );
            })()}
            <Text className="text-gray-300 dark:text-gray-600">·</Text>
            <Text className="text-muted text-[12px] font-medium">
              {createdRooms} created
            </Text>
            <Text className="text-gray-300 dark:text-gray-600">·</Text>
            <Text className="text-muted text-[12px] font-medium">
              {joinedRooms} joined
            </Text>
          </View>

          {/* User Tags */}
          <View className="flex-row flex-wrap justify-center gap-2 mt-4">
            {firestoreUser?.motivation && (
              <View className="bg-primary/8 px-3 py-1.5 rounded-lg flex-row items-center">
                <Ionicons
                  name="sparkles"
                  size={11}
                  color="#FF6B47"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-primary font-medium text-[11px]">
                  {firestoreUser.motivation}
                </Text>
              </View>
            )}
            {firestoreUser?.interests?.slice(0, 3).map((interest) => (
              <View
                key={interest}
                className="bg-gray-100 dark:bg-[#222226] px-3 py-1.5 rounded-lg"
              >
                <Text className="text-gray-500 dark:text-gray-400 font-medium text-[11px]">
                  {interest}
                </Text>
              </View>
            ))}
            {firestoreUser?.interests?.length > 3 && (
              <View className="bg-gray-100 dark:bg-[#222226] px-3 py-1.5 rounded-lg">
                <Text className="text-gray-500 dark:text-gray-400 font-medium text-[11px]">
                  +{firestoreUser.interests.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Groups */}
        <View className="bg-white dark:bg-[#1A1A1E] mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#2A2A2E] overflow-hidden">
          <Text className="text-gray-400 dark:text-gray-500 text-[12px] font-medium px-5 pt-4 pb-2">
            Settings
          </Text>
          <MenuItem
            icon="person-outline"
            label="Account Details"
            subtitle={firestoreUser?.email}
            onPress={() => router.push("/profile/accountSetting")}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Security"
            onPress={() => router.push("/profile/security")}
            isLast
          />
        </View>

        <View className="bg-white dark:bg-[#1A1A1E] mx-6 mt-3 rounded-2xl border border-gray-100 dark:border-[#2A2A2E] overflow-hidden">
          <Text className="text-gray-400 dark:text-gray-500 text-[12px] font-medium px-5 pt-4 pb-2">
            App
          </Text>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push("/profile/notifications")}
          />
          <MenuItem
            icon="eye-outline"
            label="Privacy & Data"
            onPress={() => router.push("/profile/privacyData")}
          />
          <MenuItem
            icon="language-outline"
            label="Language"
            subtitle="English"
            onPress={() => router.push("/profile/language")}
            isLast
          />
        </View>

        <View className="bg-white dark:bg-[#1A1A1E] mx-6 mt-3 rounded-2xl border border-gray-100 dark:border-[#2A2A2E] overflow-hidden">
          <Text className="text-gray-400 dark:text-gray-500 text-[12px] font-medium px-5 pt-4 pb-2">
            Support
          </Text>
          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="Send Feedback"
            onPress={() => router.push("/feedback")}
          />
          <MenuItem
            icon="alert-circle-outline"
            label="Help Center"
            onPress={() => router.push("/profile/helpCenter")}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About SpotUs"
            onPress={() => router.push("/profile/about")}
            isLast
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.7}
          className="mx-6 mt-6 py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
        >
          <Ionicons name="log-out-outline" size={16} color="#EF4444" />
          <Text className="text-red-500 font-medium text-[14px]">Sign Out</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-300 dark:text-gray-600 text-[10px] mt-5 tracking-wider font-body">
          SpotUs v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
