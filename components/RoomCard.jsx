import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

const CATEGORY_ICONS = {
  Music: "musical-notes",
  Coffee: "cafe",
  Art: "color-palette",
  Books: "book",
  Tech: "code-slash",
  Food: "restaurant",
  Fashion: "shirt",
  Sports: "football",
  "Local Events": "calendar",
};

const CATEGORY_COLORS = {
  Music: "#8B5CF6",
  Coffee: "#D97706",
  Art: "#EC4899",
  Books: "#6366F1",
  Tech: "#3B82F6",
  Food: "#EF4444",
  Fashion: "#F59E0B",
  Sports: "#10B981",
  "Local Events": "#14B8A6",
};

const AVATAR_COLORS = [
  "#6366F1",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
];

export default function RoomCard({
  room,
  onPress,
  variant = "discovery",
  currentUserId,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isOwner = room.createdBy === currentUserId;
  const isDiscovery = variant === "discovery";
  const categoryIcon = CATEGORY_ICONS[room.category] || "grid";
  const categoryColor = CATEGORY_COLORS[room.category] || "#6B7280";

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress?.(room)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        className={`rounded-2xl p-5 mb-3 border ${
          isDiscovery
            ? "bg-white border-gray-100"
            : isOwner
              ? "bg-indigo-50/30 border-indigo-100"
              : "bg-white border-gray-100"
        }`}
      >
        {/* Category — colored per type */}
        <View className="flex-row justify-between items-center mb-3">
          <View
            className="flex-row items-center px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${categoryColor}10` }}
          >
            <Ionicons
              name={categoryIcon}
              size={11}
              color={categoryColor}
              style={{ marginRight: 5 }}
            />
            <Text
              className="font-semibold text-[11px]"
              style={{ color: categoryColor }}
            >
              {room.category}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-secondary text-[18px] font-bold tracking-tight mb-1">
          {room.title}
        </Text>
        <View className="flex-row items-center mb-4">
          <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
          <Text className="text-gray-400 text-xs">Active now</Text>
        </View>

        {/* Footer */}
        <View className="flex-row justify-between items-center pt-3.5 border-t border-gray-50">
          <View className="flex-row items-center">
            <View className="flex-row -space-x-2 mr-2.5">
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white items-center justify-center"
                  style={{ backgroundColor: AVATAR_COLORS[i] }}
                >
                  <Text className="text-white text-[8px] font-bold">
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="text-gray-400 text-xs">
              {room.participants?.length || 1} members
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onPress?.(room)}
            className="bg-primary px-5 py-2 rounded-xl"
          >
            <Text className="text-white font-bold text-xs">Join</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
