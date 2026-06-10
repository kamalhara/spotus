import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
} from "react-native-reanimated";
import CustomButton from "../../../components/ui/CustomButton";
import CustomInput from "../../../components/ui/CustomInput";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { createRoom } from "../../../lib/createRoom";

const CATEGORIES = [
  { label: "Music", icon: "musical-notes", color: "#8B5CF6" },
  { label: "Coffee", icon: "cafe", color: "#D97706" },
  { label: "Art", icon: "color-palette", color: "#EC4899" },
  { label: "Books", icon: "book", color: "#6366F1" },
  { label: "Tech", icon: "code-slash", color: "#3B82F6" },
  { label: "Food", icon: "restaurant", color: "#EF4444" },
  { label: "Fashion", icon: "shirt", color: "#F59E0B" },
  { label: "Sports", icon: "football", color: "#10B981" },
  { label: "Local Events", icon: "calendar", color: "#14B8A6" },
];

const MAX_TITLE = 60;

// Threshold at which the inline title scrolls out of view
const TITLE_SCROLL_THRESHOLD = 70;

export default function CreateRooms() {
  const router = useRouter();
  const { firestoreUser: user } = useFirestoreUser();
  const { isDark } = useTheme();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showOnMap, setShowOnMap] = useState(false);
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
      await createRoom(
        title,
        description,
        selectedCategory,
        user.id,
        showOnMap,
      );
      router.push("/(tabs)/rooms_tab");
    } catch (err) {
      console.error("Error creating room:", err);
      alert(err.message || "Failed to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView className="bg-bg dark:bg-[#0F0F13] flex-1">
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1A22] items-center justify-center border border-gray-100 dark:border-[#2A2A36]"
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#E2E8F0" : "#18181B"}
            />
          </TouchableOpacity>

          <Animated.View style={[styles.headerTitleContainer, headerTitleStyle]}>
            <Text
              className="text-secondary dark:text-gray-100 text-[17px] font-bold tracking-tight"
              numberOfLines={1}
            >
              Create a Room
            </Text>
          </Animated.View>

          {/* Spacer to balance the back button */}
          <View style={{ width: 40 }} />
        </View>

        {/* Animated border */}
        <Animated.View
          style={[
            styles.headerBorder,
            { backgroundColor: isDark ? "#2A2A36" : "#F1F5F9" },
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
                <Text className="text-secondary dark:text-gray-100 text-[28px] font-extrabold tracking-tight leading-[34px]">
                  Create a Room
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm leading-5 mt-2">
                  Set a clear topic so people know what they are joining.
                </Text>
              </Animated.View>

              {/* Room Title Input */}
              <View className="mb-1">
                <CustomInput
                  label="Room Title"
                  placeholder="e.g. Saturday coffee and vinyl"
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
                  placeholder="Add a short description"
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                />
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
                            : "bg-white dark:bg-[#1A1A22] border-gray-100 dark:border-[#2A2A36]"
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
                <View className="bg-white dark:bg-[#1A1A22] rounded-2xl border border-gray-100 dark:border-[#2A2A36] p-4">
                  <View className="flex-row items-center justify-between mb-3">
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
                  </View>
                  <Text
                    className={`text-lg font-extrabold tracking-tight ${
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
                </View>
              </View>

              {/* Show on Map Toggle */}
              <View className="mt-8 bg-white dark:bg-[#1A1A22] rounded-2xl border border-gray-100 dark:border-[#2A2A36] p-4 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="map"
                      size={16}
                      color="#4F46E5"
                      style={{ marginRight: 6 }}
                    />
                    <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold">
                      Show Room on Map
                    </Text>
                  </View>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs leading-4">
                    Allow nearby users to discover this room on the public map.
                  </Text>
                </View>
                <Switch
                  value={showOnMap}
                  onValueChange={(val) => {
                    if (val) {
                      Alert.alert(
                        "Show Room on Map?",
                        "Displaying a room on the map makes it easier for nearby users to discover. Only enable this if you are comfortable with the room appearing on the public map.",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                            onPress: () => setShowOnMap(false),
                          },
                          {
                            text: "Enable",
                            style: "default",
                            onPress: () => setShowOnMap(true),
                          },
                        ],
                      );
                    } else {
                      setShowOnMap(false);
                    }
                  }}
                  trackColor={{
                    false: isDark ? "#2A2A36" : "#E2E8F0",
                    true: "#4F46E5",
                  }}
                  thumbColor={"#FFFFFF"}
                />
              </View>

              {/* Create Button */}
              <View className="flex-1 justify-end mt-10">
                <CustomButton
                  title="Create Room"
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
  backButton: {
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
