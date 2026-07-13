import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import RoomCard from "../RoomCard";
import GlassContainer from "../../ui/GlassContainer";

export const ROOM_CATEGORIES = [
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

const ROOM_DURATIONS = [
  { label: "1 Hour", value: 1 },
  { label: "3 Hours", value: 3 },
  { label: "12 Hours", value: 12 },
  { label: "24 Hours", value: 24 },
];

export default function CreateRoomOptions({
  duration,
  onDurationChange,
  selectedCategory,
  onCategoryChange,
  title,
  showOnMap,
  onShowOnMapChange,
  user,
  isDark,
}) {
  return (
    <>
      <View className="mt-5">
        <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 ml-1">
          Room closes after
        </Text>
        <View className="flex-row flex-wrap gap-2.5">
          {ROOM_DURATIONS.map(({ label, value }) => {
            const selected = duration === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => onDurationChange(value)}
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

      <View className="mt-5">
        <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 ml-1">
          Category
        </Text>

        <View className="flex-row flex-wrap gap-2.5">
          {ROOM_CATEGORIES.map(({ label, icon, color }) => {
            const selected = selectedCategory === label;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => onCategoryChange(label)}
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
                  className={`text-sm font-medium ${
                    !selected ? "text-secondary dark:text-gray-100" : ""
                  }`}
                  style={selected ? { color } : {}}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="mt-8">
        <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 ml-1">
          List preview
        </Text>
        <View pointerEvents="none" style={{ opacity: 0.9 }}>
          <RoomCard
            room={{
              id: "preview",
              title: title || "Your room title",
              category: selectedCategory || "General",
              visibility: showOnMap ? "public" : "ghost",
              createdAt: Date.now(),
              expiresAt: Date.now() + duration * 60 * 60 * 1000,
              participants: user?.id ? [user.id] : [],
              createdBy: user?.id,
              distance: showOnMap ? 0.0 : undefined,
            }}
            currentUserId={user?.id}
            variant="discovery"
          />
        </View>
      </View>

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
                Hide from map
              </Text>
            </View>
            <Text className="text-gray-400 dark:text-gray-500 text-xs leading-4 pr-2">
              People can still join with the invite code. Nearby discovery will
              not show this room.
            </Text>
          </View>
          <Switch
            value={!showOnMap}
            onValueChange={(value) => {
              import("expo-haptics").then((Haptics) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              });
              onShowOnMapChange(!value);
            }}
            trackColor={{
              false: isDark ? "#2C2C30" : "#E2E8F0",
              true: "#A855F7",
            }}
            thumbColor="#FFFFFF"
          />
        </GlassContainer>
      </View>
    </>
  );
}
