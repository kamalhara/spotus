import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories";

export default function HomeEmptyRooms({
  activeCategory,
  displayDistance,
  isGhostBrowsing,
}) {
  const isFiltered = activeCategory !== "all";
  const categoryColor = CATEGORY_COLORS[activeCategory] || "#FF6B47";
  const categoryIcon = CATEGORY_ICONS[activeCategory] || "location-outline";

  return (
    <View className="py-10 px-1">
      <View className="flex-row items-center mb-4">
        <View className="h-px flex-1 bg-border dark:bg-[#2A2A2E]" />
        <View className="flex-row items-center px-3">
          <Ionicons name={categoryIcon} size={13} color={categoryColor} />
          <Text className="text-muted dark:text-gray-400 text-[10px] font-semibold tracking-[1.2px] ml-1.5">
            {isGhostBrowsing ? "PREVIEW COMPLETE" : `${displayDistance} KM CHECKED`}
          </Text>
        </View>
        <View className="h-px flex-1 bg-border dark:bg-[#2A2A2E]" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-[22px] leading-7 font-display tracking-tight text-center px-5">
        {isGhostBrowsing
          ? "No rooms to preview"
          : isFiltered
            ? `No ${activeCategory} rooms within ${displayDistance} km`
            : `No rooms open within ${displayDistance} km`}
      </Text>
      <Text className="text-muted dark:text-gray-400 text-[14px] font-body text-center leading-5 px-7 mt-2">
        {isGhostBrowsing
          ? "Turn on location to see rooms near you."
          : isFiltered
            ? "Choose another category or try a larger distance."
            : "Try a larger distance or create a room."}
      </Text>
    </View>
  );
}
