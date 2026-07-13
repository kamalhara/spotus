import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function HomeEmptyRooms({ activeCategory, isGhostBrowsing }) {
  const isFiltered = activeCategory !== "all";

  return (
    <View className="items-center justify-center py-16 px-6">
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(255, 107, 71, 0.08)" }}
      >
        <Ionicons
          name="radio-outline"
          size={22}
          color="#FF6B47"
          style={{ opacity: 0.6 }}
        />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-lg font-heading tracking-tight text-center mb-2">
        {isFiltered ? `No ${activeCategory} rooms` : "Nothing open nearby"}
      </Text>
      <Text className="text-muted text-[14px] font-body text-center leading-5 px-4">
        {isGhostBrowsing
          ? "Exploring mode only shows public samples. Turn on location to see rooms around you."
          : isFiltered
            ? "Try another category or widen the radius."
            : "Start one for the people around you or widen the radius."}
      </Text>
    </View>
  );
}
