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

const AVATAR_COLORS = [
  "#4F46E5",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#14B8A6",
];

function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress?.(room)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        className={`rounded-3xl p-5 mb-4 ${
          isDiscovery
            ? "bg-white border border-border-light shadow-sm shadow-slate-100"
            : isOwner
              ? "bg-indigo-50/40 border border-indigo-100/60"
              : "bg-white border border-border-light shadow-sm shadow-slate-50"
        }`}
      >
        {/* Category + Menu Row */}
        <View className="flex flex-row justify-between items-center mb-4">
          <View className="flex-row items-center bg-surface-alt px-3.5 py-2 rounded-xl">
            <Ionicons
              name={categoryIcon}
              size={12}
              color="#64748B"
              style={{ marginRight: 6 }}
            />
            <Text className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">
              {room.category}
            </Text>
          </View>
          <TouchableOpacity className="w-8 h-8 items-center justify-center rounded-lg">
            <Ionicons name="ellipsis-horizontal" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Title + Status */}
        <View className="mb-5">
          <Text className="text-secondary text-xl font-black tracking-tight mb-1.5">
            {room.title}
          </Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-success mr-2" />
            <Text className="text-muted text-xs font-semibold">
              Active now in your area
            </Text>
          </View>
        </View>

        {/* Footer: Avatars + Join Button */}
        <View className="flex-row justify-between items-center pt-4 border-t border-border-light">
          <View className="flex-row items-center">
            <View className="flex-row -space-x-2.5 mr-3">
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  className="w-7 h-7 rounded-full border-[2.5px] border-white items-center justify-center"
                  style={{ backgroundColor: getAvatarColor(i) }}
                >
                  <Text className="text-white text-[9px] font-black">
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="text-muted font-bold text-[11px] uppercase tracking-wider">
              {room.participants?.length || 1} members
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onPress?.(room)}
            className="bg-primary px-5 py-2.5 rounded-xl flex-row items-center gap-1.5"
          >
            <Text className="text-white font-bold text-xs tracking-wide">
              Join
            </Text>
            <Ionicons name="arrow-forward" size={12} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
