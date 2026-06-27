import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../../components/ui/CustomButton";
import CustomInput from "../../../components/ui/CustomInput";
import GlassButton from "../../../components/ui/GlassButton";
import GlassContainer from "../../../components/ui/GlassContainer";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { createRoom } from "../../../lib/createRoom";
import { trackEvent } from "../../../lib/analytics";

const CATEGORIES = [
  { label: "Music", icon: "musical-notes", color: "#8B5CF6" },
  { label: "Coffee", icon: "cafe", color: "#D97706" },
  { label: "Art", icon: "color-palette", color: "#EC4899" },
  { label: "Books", icon: "book", color: "#FF8566" },
  { label: "Tech", icon: "code-slash", color: "#3B82F6" },
  { label: "Food", icon: "restaurant", color: "#EF4444" },
  { label: "Fashion", icon: "shirt", color: "#F59E0B" },
  { label: "Sports", icon: "football", color: "#10B981" },
  { label: "Local Events", icon: "calendar", color: "#14B8A6" },
];

const MAX_TITLE = 60;

const DURATIONS = [
  { label: "1 Hour", value: 1 },
  { label: "3 Hours", value: 3 },
  { label: "12 Hours", value: 12 },
  { label: "24 Hours", value: 24 },
];

// Threshold at which the inline title scrolls out of view
const TITLE_SCROLL_THRESHOLD = 70;

export default function CreateRooms() {
  const router = useRouter();
  const { firestoreUser: user } = useFirestoreUser();
  const { isDark } = useTheme();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(3); // Default 3 hours
  const [isCreating, setIsCreating] = useState(false);
  const [showOnMap, setShowOnMap] = useState(true); // Default to Public
  const selectedCategoryMeta = CATEGORIES.find(
    (item) => item.label === selectedCategory,
  );
  const canCreateRoom =
    title.trim().length > 0 && !!selectedCategory && !isCreating;

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated style for the compact header title (fades + slides in)
  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [TITLE_SCROLL_THRESHOLD - 20, TITLE_SCROLL_THRESHOLD + 10],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [TITLE_SCROLL_THRESHOLD - 20, TITLE_SCROLL_THRESHOLD + 10],
      [8, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Animated style for the header bottom border (appears on scroll)
  const headerBorderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 30],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
    };
  });

  // Animated style for the inline title (fades out as it scrolls away)
  const inlineTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, TITLE_SCROLL_THRESHOLD],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
    };
  });

  const handleCreateRoom = async () => {
    if (!title || !selectedCategory) return alert("Please fill all the fields");
    if (!user) return alert("User not loaded");
    setIsCreating(true);
    try {
      const { roomId } = await createRoom(
        title,
        description,
        selectedCategory,
        user.id,
        showOnMap,
        duration,
      );
      
      trackEvent("room_created", {
        category: selectedCategory,
        duration: duration
      });

      router.replace(`/rooms/${roomId}`);
    } catch (err) {
      console.error("Error creating room:", err);
      alert(err.message || "Failed to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView className="bg-bg dark:bg-[#111113] flex-1">
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          {/* Glass Back Button */}
          <GlassButton onPress={() => router.back()} size={40} shape="circle">
            <Ionicons
              name="chevron-back"
              size={20}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </GlassButton>

          {/* Animated compact title — slides in on scroll */}
          <Animated.View
            style={[styles.headerTitleContainer, headerTitleStyle]}
          >
            <Text
              className="text-secondary dark:text-gray-100 text-[17px] font-bold tracking-tight"
              numberOfLines={1}
            >
              Drop a Room
            </Text>
          </Animated.View>

          {/* Spacer to balance the back button */}
          <View style={{ width: 40 }} />
        </View>

        {/* Animated border — fades in on scroll */}
        <Animated.View
          style={[
            styles.headerBorder,
            { backgroundColor: isDark ? "#2C2C30" : "#F1F5F9" },
            headerBorderStyle,
          ]}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: 1,
            paddingHorizontal: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
              {/* Inline Title — fades out on scroll */}
              <Animated.View className="mt-4 mb-8" style={inlineTitleStyle}>
                <Text className="text-secondary dark:text-gray-100 text-[28px] font-display font-extrabold tracking-tight leading-[34px]">
                  What&apos;s happening?
                </Text>
                <Text className="text-muted text-sm leading-5 mt-2">
                  Give it a name and let people find you.
                </Text>
              </Animated.View>

              {/* Room Title Input */}
              <View className="mb-1">
                <CustomInput
                  label="Room Title"
                  placeholder="e.g. Saturday park hangs"
                  value={title}
                  onChangeText={(text) => {
                    if (text.length <= MAX_TITLE) setTitle(text);
                  }}
                />
                <Text className="text-gray-300 dark:text-gray-600 text-xs self-end mt-1.5 mr-1">
                  {title.length}/{MAX_TITLE}
                </Text>
              </View>

              <View>
                <CustomInput
                  label="Description (Optional)"
                  placeholder="Tell people what to expect"
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                />
              </View>

              {/* Duration Picker */}
              <View className="mt-5">
                <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 ml-1">
                  Duration (Expires in)
                </Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {DURATIONS.map(({ label, value }) => {
                    const selected = duration === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setDuration(value)}
                        className={`px-4 py-2.5 rounded-xl border ${
                          selected
                            ? "bg-primary border-primary"
                            : "bg-white dark:bg-[#1C1C20] border-gray-100 dark:border-[#2C2C30]"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            selected
                              ? "text-white"
                              : "text-secondary dark:text-gray-100"
                          }`}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Categories — each with its own color */}
              <View className="mt-5">
                <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 ml-1">
                  Category
                </Text>

                <View className="flex-row flex-wrap gap-2.5">
                  {CATEGORIES.map(({ label, icon, color }) => {
                    const selected = selectedCategory === label;
                    return (
                      <TouchableOpacity
                        key={label}
                        onPress={() => setSelectedCategory(label)}
                        className={`px-3.5 py-2.5 rounded-xl flex-row items-center gap-2 border ${
                          selected
                            ? "border-transparent"
                            : "bg-white dark:bg-[#1C1C20] border-gray-100 dark:border-[#2C2C30]"
                        }`}
                        style={
                          selected
                            ? {
                                backgroundColor: `${color}15`,
                                borderColor: `${color}30`,
                              }
                            : {}
                        }
                      >
                        <Ionicons
                          name={selected ? "checkmark" : icon}
                          size={14}
                          color={selected ? color : "#9CA3AF"}
                        />
                        <Text
                          className={`text-sm font-medium ${!selected ? "text-secondary dark:text-gray-100" : ""}`}
                          style={selected ? { color } : {}}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Preview */}
              <View className="mt-8">
                <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 ml-1">
                  Preview
                </Text>
                <GlassContainer
                  borderRadius={16}
                  fallbackClassName="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30]"
                  style={{ padding: 16 }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View
                        className="px-3 py-1.5 rounded-xl flex-row items-center"
                        style={{
                          backgroundColor: selectedCategoryMeta
                            ? `${selectedCategoryMeta.color}12`
                            : "#F1F5F9",
                        }}
                      >
                        <Ionicons
                          name={selectedCategoryMeta?.icon || "grid-outline"}
                          size={13}
                          color={selectedCategoryMeta?.color || "#94A3B8"}
                        />
                        <Text
                          className="text-xs font-bold ml-1.5"
                          style={{
                            color: selectedCategoryMeta?.color || "#94A3B8",
                          }}
                        >
                          {selectedCategory || "Choose category"}
                        </Text>
                      </View>
                      <View className="px-3 py-1.5 rounded-xl flex-row items-center bg-gray-100 dark:bg-[#2C2C30]">
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="#6B7280"
                        />
                        <Text className="text-xs font-bold ml-1.5 text-gray-500 dark:text-gray-400">
                          {duration}h
                        </Text>
                      </View>
                    </View>
                    {!showOnMap && (
                      <View className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 items-center justify-center">
                        <MaterialCommunityIcons
                          name="ghost"
                          size={16}
                          color="#A855F7"
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    className={`text-lg font-display font-extrabold tracking-tight ${
                      title
                        ? "text-secondary dark:text-gray-100"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                    numberOfLines={2}
                  >
                    {title || "Your room title"}
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs mt-2 leading-4">
                    This is how your room will appear in the list.
                  </Text>
                </GlassContainer>
              </View>

              {/* Visibility Toggle */}
              <View className="mt-8">
                <GlassContainer
                  borderRadius={16}
                  fallbackClassName="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30]"
                  style={{
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center mb-1">
                      <MaterialCommunityIcons
                        name="ghost-outline"
                        size={18}
                        color="#A855F7"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold">
                        Ghost Mode
                      </Text>
                    </View>
                    <Text className="text-gray-400 dark:text-gray-500 text-xs leading-4 pr-2">
                      If off, the room is public and shown to all users. Hidden
                      from the map when on.
                    </Text>
                  </View>
                  <Switch
                    value={!showOnMap}
                    onValueChange={(val) => {
                      import("expo-haptics").then((Haptics) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      });
                      setShowOnMap(!val);
                    }}
                    trackColor={{
                      false: isDark ? "#2C2C30" : "#E2E8F0",
                      true: "#A855F7",
                    }}
                    thumbColor={"#FFFFFF"}
                  />
                </GlassContainer>
              </View>

              {/* Create Button */}
              <View className="flex-1 justify-end mt-10">
                <CustomButton
                  title="Let's go"
                  onPress={handleCreateRoom}
                  disabled={!canCreateRoom}
                  loading={isCreating}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});
