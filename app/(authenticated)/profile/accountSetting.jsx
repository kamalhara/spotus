import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  LayoutAnimation,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MenuItem = ({
  icon,
  label,
  subtitle,
  onPress,
  color = "#4F46E5",
  isLast = false,
  switchComponent = false,
  tag,
  goto = true,
  rightComponent,
}) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (onPress) onPress();
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
        <Text className="text-secondary font-semibold text-[15px]">
          {label}
        </Text>
        {subtitle && (
          <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    {rightComponent ? (
      rightComponent
    ) : switchComponent ? (
      <Switch
        trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
        ios_backgroundColor="#E5E7EB"
        onValueChange={() => {}}
        value={true}
        thumbColor={"#fff"}
      />
    ) : tag ? (
      <View className="flex-row items-center justify-center bg-primary/10 px-2 py-1 rounded-lg">
        <Text className="text-primary text-xs font-semibold uppercase tracking-wide ">
          {tag}
        </Text>
      </View>
    ) : (
      goto && <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    )}
  </TouchableOpacity>
);

export default function Profile() {
  const { user: clerkUser } = useUser();
  const { firestoreUser, loading } = useFirestoreUser();
  const router = useRouter();
  const [activeSearch, setActiveSearch] = useState(false);
  const [visibility, setVisibility] = useState("Public");

  const toggleSearch = (active) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    setActiveSearch(active);
  };

  const getAuthMethod = () => {
    if (!clerkUser) return { name: "Email & Password", icon: "mail-outline" };

    if (clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0) {
      const provider = clerkUser.externalAccounts[0].provider;
      if (provider.includes("google"))
        return { name: "Google", icon: "logo-google" };
      if (provider.includes("apple"))
        return { name: "Apple", icon: "logo-apple" };
      if (provider.includes("github"))
        return { name: "GitHub", icon: "logo-github" };
      return { name: "OAuth Provider", icon: "shield-checkmark-outline" };
    }

    return { name: "Email & Password", icon: "mail-outline" };
  };

  const authMethod = getAuthMethod();

  const [rooms, setRooms] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadRooms = async () => {
        const data = await getRooms();
        setRooms(data);
      };
      loadRooms();
    }, []),
  );

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

  return (
    <SafeAreaView className="bg-bg flex-1" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-2 flex-row items-center justify-between min-h-[60px]">
        <View className="flex flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => {
              if (activeSearch) toggleSearch(false);
              else router.back();
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-200/50 mr-2"
          >
            <Ionicons
              name={activeSearch ? "close" : "arrow-back"}
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {!activeSearch ? (
            <Text
              className="text-secondary font-extrabold text-xl"
              numberOfLines={1}
            >
              Settings
            </Text>
          ) : (
            <TextInput
              className="text-secondary font-extrabold text-xl"
              placeholder="Search"
            />
          )}
        </View>
        {!activeSearch && (
          <TouchableOpacity
            onPress={() => toggleSearch(true)}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-200/50"
          >
            <Ionicons name="search" size={20} color="#4F46E5" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => {
          if (activeSearch) {
            Keyboard.dismiss();
            toggleSearch(false);
          }
        }}
        onTouchStart={() => {
          if (activeSearch) {
            Keyboard.dismiss();
            toggleSearch(false);
          }
        }}
      >
        {/* Profile Header */}
        <View className=" flex flex-row  items-center px-10 mt-2 mb-7">
          {/* Background accent */}
          <View className="absolute top-0 left-0 right-0 h-36 overflow-hidden rounded-b-[40px] bg-bg" />

          <View className="relative mt-6">
            <View
              className="w-[90px] h-[90px] rounded-full border-4 border-white overflow-hidden bg-gray-100"
              style={{
                shadowColor: "#4F46E5",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
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
          <View className=" flex flex-col px-10">
            <Text className="text-secondary text-[22px] font-extrabold mt-4 tracking-tight">
              {firestoreUser?.userName || "User"}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {firestoreUser?.email}
            </Text>
          </View>
        </View>

        {/* Stats — with gradient accent on primary stat */}

        {/* Menu Groups */}
        <View className="bg-white mx-6 rounded-2xl border border-gray-100 overflow-hidden shadow-sm shadow-gray-100">
          <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            Account
          </Text>

          <MenuItem
            icon="mail-outline"
            label="Email Address"
            subtitle={firestoreUser?.email}
            goto={false}
          />
          {
            <MenuItem
              icon={authMethod.icon}
              label="Sign-In Method"
              subtitle={authMethod.name}
              goto={false}
            />
          }
          {authMethod.name === "Email & Password" && (
            <MenuItem
              icon="lock-closed-outline"
              label="Password"
              isLast
              onPress={() => router.push("/profile/changePassword")}
            />
          )}
        </View>

        <View className="bg-white mx-6 mt-4 rounded-2xl border border-gray-100 overflow-hidden shadow-sm shadow-gray-100">
          <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            Preferences
          </Text>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            color="#8B5CF6"
            switchComponent={true}
          />
          <MenuItem
            icon="at-outline"
            label="Email Alerts"
            color="#8B5CF6"
            switchComponent={true}
          />
        </View>

        <View className="bg-white mx-6 mt-4 rounded-2xl border border-gray-100 overflow-hidden shadow-sm shadow-gray-100">
          <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            Privacy
          </Text>
          <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-50">
            <View className="flex-row items-center flex-1">
              <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
                style={{ backgroundColor: "#8B5CF612" }}
              >
                <Ionicons name="eye-off-outline" size={18} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-secondary font-semibold text-[15px]">
                  Profile Visibility
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {visibility === "Public"
                    ? "Anyone can view your profile"
                    : "Only approved users can view"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-gray-50 px-2 py-0.5 rounded-2xl border border-gray-100">
              <Text
                className={`text-[10px] font-bold ml-1 ${visibility === "Public" ? "text-primary" : "text-gray-300"}`}
              >
                Public
              </Text>
              <Switch
                value={visibility === "Private"}
                onValueChange={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setVisibility(val ? "Private" : "Public");
                }}
                trackColor={{ false: "#CBD5E1", true: "#4F46E5" }}
                thumbColor="#fff"
                ios_backgroundColor="#CBD5E1"
                style={{ transform: [{ scale: 0.8 }] }}
              />
              <Text
                className={`text-[10px] font-bold mr-1 ${visibility === "Private" ? "text-primary" : "text-gray-300"}`}
              >
                Private
              </Text>
            </View>
          </View>
          <MenuItem icon="ban" label="Blocked Users" color="#8B5CF6" />
        </View>

        <View className="bg-white mx-6 mt-4 rounded-2xl border border-gray-100 overflow-hidden shadow-sm shadow-gray-100">
          <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
            Support
          </Text>
          <MenuItem
            icon="information-circle-outline"
            label="Help Center"
            color="#8B5CF6"
          />
          <MenuItem
            icon="shield-checkmark"
            label="Privacy Policy"
            color="#8B5CF6"
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms of Service"
            color="#8B5CF6"
            isLast
          />
        </View>

        <Text className="text-center text-gray-300 text-[10px] mt-6 tracking-wider">
          SpotUs v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
