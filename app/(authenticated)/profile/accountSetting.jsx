import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import GlassButton from "../../../components/ui/GlassButton";
import GlassContainer from "../../../components/ui/GlassContainer";
import BlockedUserModal from "../../../components/users/BlockedUserModal";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";

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
}) => {
  const { isDark } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
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
      {rightComponent ? (
        rightComponent
      ) : switchComponent ? (
        <Switch
          trackColor={{
            false: isDark ? "#23232E" : "#E5E7EB",
            true: "#4F46E5",
          }}
          ios_backgroundColor="#E5E7EB"
          onValueChange={() => {}}
          value={true}
          thumbColor={"#fff"}
        />
      ) : tag ? (
        <View className="flex-row items-center justify-center bg-primary/10 px-2 py-1 rounded-lg">
          <Text className="text-primary text-xs font-semibold uppercase tracking-wide">
            {tag}
          </Text>
        </View>
      ) : (
        goto && <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
};

export default function Profile() {
  const { user: clerkUser } = useUser();
  const { firestoreUser, loading } = useFirestoreUser();
  const router = useRouter();
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const { theme, setTheme, isDark } = useTheme();

  const searchExpand = useSharedValue(0);

  const toggleSearch = (active) => {
    Keyboard.dismiss();
    setActiveSearch(active);
    searchExpand.value = withTiming(active ? 1 : 0, { duration: 350 });
    if (!active) setSearchQuery("");
  };

  const filterMatch = (text) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg dark:bg-[#0F0F13]">
        <ActivityIndicator
          size="large"
          color={isDark ? "#818CF8" : "#4F46E5"}
        />
      </View>
    );
  }

  if (!firestoreUser) {
    return <Redirect href="/welcome" />;
  }

  return (
    <SafeAreaView className="bg-bg dark:bg-[#0F0F13] flex-1" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4 h-16">
        <View className="flex-row items-center flex-1 h-full relative">
          {/* Back/Close Button */}
          {!activeSearch && (
            <GlassButton
              onPress={() => {
                router.back();
              }}
              size={44}
              shape="circle"
              style={{ marginRight: 12 }}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={isDark ? "#818CF8" : "#4F46E5"}
              />
            </GlassButton>
          )}

          {/* Title (Fades out when search is active) */}
          {!activeSearch && (
            <Animated.Text
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="text-secondary dark:text-gray-100 font-extrabold text-xl flex-1"
              numberOfLines={1}
            >
              Settings
            </Animated.Text>
          )}

          {/* Expanding Search Bar */}
          <Animated.View
            layout={LinearTransition.duration(250)}
            style={{
              flex: activeSearch ? 1 : 0,
              alignItems: "flex-end",
              justifyContent: "center",
              height: 44,
            }}
          >
            {activeSearch ? (
              <View className="flex-row items-center gap-2 flex-1 w-full">
                <GlassContainer
                  borderRadius={22}
                  isInteractive={true}
                  fallbackClassName="bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700"
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 44,
                  }}
                >
                  <Ionicons name="search" size={18} color="#9CA3AF" />
                  <TextInput
                    ref={searchInputRef}
                    autoFocus
                    className="flex-1 ml-3 text-secondary dark:text-gray-100 text-base font-semibold h-full"
                    placeholder="Search settings..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </GlassContainer>
                <GlassButton
                  onPress={() => toggleSearch(false)}
                  size={44}
                  shape="circle"
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={isDark ? "#818CF8" : "#4F46E5"}
                  />
                </GlassButton>
              </View>
            ) : (
              <GlassButton
                onPress={() => toggleSearch(true)}
                size={44}
                shape="circle"
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={isDark ? "#818CF8" : "#4F46E5"}
                />
              </GlassButton>
            )}
          </Animated.View>
        </View>
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
        <View className="flex-row items-center px-6 mt-2 mb-7">
          {/* Background accent */}
          <View className="absolute top-0 left-0 right-0 h-36 overflow-hidden rounded-b-[40px]" />

          <View className="relative mt-6">
            <View
              className="w-[82px] h-[82px] rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-800"
              style={{
                shadowColor: "#94A3B8",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
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
          <View className="flex-1 ml-4">
            <Text
              className="text-secondary dark:text-gray-100 text-[22px] font-extrabold tracking-tight"
              numberOfLines={1}
            >
              {firestoreUser?.userName || "User"}
            </Text>
            <Text
              className="text-gray-400 dark:text-gray-500 text-sm mt-1"
              numberOfLines={1}
            >
              {firestoreUser?.email}
            </Text>
          </View>
        </View>

        {/* Menu Groups */}
        {(filterMatch("Email Address") ||
          filterMatch("Sign-In Method") ||
          filterMatch("Password")) && (
          <View className="bg-white dark:bg-[#1A1A22] mx-6 rounded-2xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden">
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
              Account
            </Text>

            {filterMatch("Email Address") && (
              <MenuItem
                icon="mail-outline"
                label="Email Address"
                subtitle={firestoreUser?.email}
                goto={false}
              />
            )}
            {filterMatch("Sign-In Method") && (
              <MenuItem
                icon={authMethod.icon}
                label="Sign-In Method"
                subtitle={authMethod.name}
                goto={false}
              />
            )}
            {authMethod.name === "Email & Password" &&
              filterMatch("Password") && (
                <MenuItem
                  icon="lock-closed-outline"
                  label="Change Password"
                  isLast
                  onPress={() => router.push("/profile/changePassword")}
                />
              )}
          </View>
        )}

        {(filterMatch("Notifications") || filterMatch("Email Alerts")) && (
          <View className="bg-white dark:bg-[#1A1A22] mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden">
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
              Preferences
            </Text>
            {filterMatch("Notifications") && (
              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                color="#8B5CF6"
                onPress={() => router.push("/profile/notifications")}
              />
            )}
            {filterMatch("Email Alerts") && (
              <MenuItem
                icon="at-outline"
                label="Email Alerts"
                color="#8B5CF6"
                onPress={() => router.push("/profile/notifications")}
              />
            )}
          </View>
        )}

        {/* Appearance / Theme */}
        {(filterMatch("Theme") ||
          filterMatch("Appearance") ||
          filterMatch("Dark Mode")) && (
          <View className="bg-white dark:bg-[#1A1A22] mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden">
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
              Appearance
            </Text>
            <View className="px-5 py-4">
              <View className="flex-row items-center mb-3">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
                  style={{
                    backgroundColor: isDark ? "#6366F118" : "#4F46E512",
                  }}
                >
                  <Ionicons
                    name="color-palette-outline"
                    size={18}
                    color={isDark ? "#818CF8" : "#4F46E5"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-secondary dark:text-gray-100 font-semibold text-[15px]">
                    Theme
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                    {theme === "system"
                      ? "Follows system"
                      : theme === "dark"
                        ? "Dark mode"
                        : "Light mode"}
                  </Text>
                </View>
              </View>
              <View className="flex-row bg-gray-100 dark:bg-[#23232E] rounded-2xl p-1">
                {[
                  { key: "light", label: "Light", icon: "sunny" },
                  { key: "dark", label: "Dark", icon: "moon" },
                  {
                    key: "system",
                    label: "System",
                    icon: "phone-portrait-outline",
                  },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTheme(opt.key);
                    }}
                    activeOpacity={0.7}
                    className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
                      theme === opt.key ? "bg-white dark:bg-[#1A1A22]" : ""
                    }`}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={14}
                      color={
                        theme === opt.key
                          ? isDark
                            ? "#818CF8"
                            : "#4F46E5"
                          : isDark
                            ? "#6B7280"
                            : "#9CA3AF"
                      }
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      className={`text-xs font-bold ${
                        theme === opt.key
                          ? "text-primary dark:text-primary-light"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {(filterMatch("Profile Visibility") ||
          filterMatch("Blocked Users")) && (
          <View className="bg-white dark:bg-[#1A1A22] mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden">
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
              Privacy
            </Text>

            {filterMatch("Blocked Users") && (
              <MenuItem
                icon="ban"
                label="Blocked Users"
                color="#8B5CF6"
                rightComponent={
                  <View
                    className={`flex-row items-center px-2 py-0.5 rounded-2xl border ${
                      isDark
                        ? "dark:bg-[#1F1F29] border-[#2A2A36]"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <Text className="text-[10px] font-bold mr-1 text-gray-300">
                      {firestoreUser?.blockedUsers?.length || 0}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
                  </View>
                }
                onPress={() => setShowBlockedModal(true)}
              />
            )}
          </View>
        )}

        <BlockedUserModal
          showBlockedModal={showBlockedModal}
          setShowBlockedModal={setShowBlockedModal}
        />

        {(filterMatch("Help Center") ||
          filterMatch("Privacy Policy") ||
          filterMatch("Terms of Service")) && (
          <View className="bg-white dark:bg-[#1A1A22] mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden">
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
              Support
            </Text>
            {filterMatch("Help Center") && (
              <MenuItem
                icon="information-circle-outline"
                label="Help Center"
                color="#8B5CF6"
                onPress={() => router.push("/profile/helpCenter")}
              />
            )}
            {filterMatch("Privacy Policy") && (
              <MenuItem
                icon="shield-checkmark"
                label="Privacy Policy"
                color="#8B5CF6"
                onPress={() => router.push("/profile/privacyPolicy")}
              />
            )}
            {filterMatch("Terms of Service") && (
              <MenuItem
                icon="document-text-outline"
                label="Terms of Service"
                color="#8B5CF6"
                onPress={() => router.push("/profile/terms")}
                isLast
              />
            )}
          </View>
        )}

        {searchQuery.length > 0 &&
          !filterMatch("Email Address") &&
          !filterMatch("Sign-In Method") &&
          !filterMatch("Password") &&
          !filterMatch("Notifications") &&
          !filterMatch("Email Alerts") &&
          !filterMatch("Profile Visibility") &&
          !filterMatch("Blocked Users") &&
          !filterMatch("Help Center") &&
          !filterMatch("Privacy Policy") &&
          !filterMatch("Terms of Service") &&
          !filterMatch("Theme") &&
          !filterMatch("Appearance") &&
          !filterMatch("Dark Mode") && (
            <View className="flex-1 items-center justify-center py-10">
              <Ionicons name="search-outline" size={48} color="#E5E7EB" />
              <Text className="text-gray-400 mt-4 font-medium">
                {`No results found for"${searchQuery}"`}
              </Text>
            </View>
          )}

        <Text className="text-center text-gray-300 dark:text-gray-600 text-[10px] mt-6 tracking-wider">
          SpotUs v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
