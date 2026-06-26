import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import GlassContainer from "../ui/GlassContainer";
import ParticipantAvatar from "./ParticipantAvatar";

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

  const buttonText = isDiscovery ? "Join" : "Enter";

  const getExpiryText = () => {
    if (!room.expiresAt) return "Active Event";

    // Handle both Firestore Timestamp objects and raw JS Dates
    const expiresMs = room.expiresAt.seconds
      ? room.expiresAt.seconds * 1000
      : room.expiresAt instanceof Date
        ? room.expiresAt.getTime()
        : room.expiresAt;

    if (!expiresMs) return "Active Event";

    const now = Date.now();
    const diffMs = expiresMs - now;

    if (diffMs <= 0) return "Expired";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) return `Expires in ${diffHours}h`;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `Expires in ${diffMins}m`;
  };

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

  const cardContent = (
    <>
      {/* Category accent stripe */}
      <View
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{ backgroundColor: categoryColor }}
      />
      {/* Category — colored per type */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2">
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

          {room.visibility === "ghost" && (
            <View className="flex-row items-center px-2 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <MaterialCommunityIcons
                name="ghost"
                size={12}
                color="#A855F7"
                style={{ marginRight: 4 }}
              />
              <Text className="font-semibold text-[10px] text-purple-600 dark:text-purple-400">
                Ghost Mode
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Title */}
      <Text className="text-secondary dark:text-gray-100 text-[19px] font-display font-extrabold tracking-tight mb-1.5 leading-6">
        {room.title}
      </Text>

      <View className="flex-row items-center mb-4">
        {getExpiryText() === "Expired" ? (
          <View className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
        ) : (
          <View className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5" />
        )}
        <Text className="text-gray-400 text-xs font-semibold">
          {getExpiryText()}
        </Text>
        {room.distance !== undefined && (
          <>
            <Text className="text-gray-300 dark:text-gray-600 mx-2">•</Text>
            <Ionicons
              name="location"
              size={12}
              color="#9CA3AF"
              style={{ marginRight: 2, marginTop: -1 }}
            />
            <Text className="text-gray-400 text-xs font-medium">
              {room.distance.toFixed(1)} km
            </Text>
          </>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center pt-4 mt-1 border-t border-border-light dark:border-[#2A2A36]">
        <View className="flex-row items-center">
          <View className="flex-row -space-x-2 mr-3">
            {(room.participants || []).slice(0, 3).map((participantId, i) => (
              <ParticipantAvatar
                key={participantId}
                userId={participantId}
                size={28}
                index={i}
              />
            ))}
            {(!room.participants || room.participants.length === 0) &&
              [0, 1, 2].map((i) => (
                <View
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1A1A22] items-center justify-center"
                  style={{ backgroundColor: AVATAR_COLORS[i] }}
                >
                  <Text className="text-white text-[9px] font-display font-black">
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
              ))}
          </View>
          <Text className="text-muted dark:text-gray-500 text-[13px] font-semibold">
            🔥 {room.participantCount || room.participants?.length || 1}{" "}
            chatting now
          </Text>
        </View>
        <View className="bg-primary px-5 py-2.5 rounded-full">
          <Text className="text-white font-bold text-[13px]">{buttonText}</Text>
        </View>
      </View>
    </>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress?.(room)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        className="mb-4"
      >
        {isDiscovery ? (
          <GlassContainer
            borderRadius={24}
            fallbackClassName="bg-white dark:bg-[#1A1A22] border border-border-light dark:border-[#2A2A36]"
            style={{ padding: 20 }}
          >
            {cardContent}
          </GlassContainer>
        ) : (
          <View
            className={`rounded-[24px] p-5 border overflow-hidden ${
              isOwner
                ? "bg-primary-surface dark:bg-primary-surface border-primary/20"
                : "bg-white dark:bg-[#1A1A22] border-border-light dark:border-[#2A2A36]"
            }`}
          >
            {cardContent}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
