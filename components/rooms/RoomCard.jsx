import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { memo, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories";
import ParticipantAvatar from "./ParticipantAvatar";

const RoomCard = memo(function RoomCard({
  room,
  onPress,
  variant = "discovery",
  currentUserId,
  isExploreMode = false,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isOwner = room.createdBy === currentUserId;
  const isDiscovery = variant === "discovery";
  const categoryIcon = CATEGORY_ICONS[room.category] || "grid";
  const categoryColor = CATEGORY_COLORS[room.category] || "#6B7280";

  const buttonText = isExploreMode
    ? "Preview"
    : isDiscovery
      ? "Jump in"
      : "Enter";

  const getExpiryText = () => {
    if (!room.expiresAt) return "Active Event";

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
    if (diffHours >= 24) return `${Math.floor(diffHours / 24)}d left`;
    if (diffHours > 0) return `${diffHours}h left`;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins > 0) return `${diffMins}m left`;
    return "< 1m left";
  };

  const participantCount = room.participants?.length || 0;
  const isDying = (() => {
    if (!room.expiresAt) return false;
    const expiresMs = room.expiresAt.seconds
      ? room.expiresAt.seconds * 1000
      : room.expiresAt instanceof Date
        ? room.expiresAt.getTime()
        : room.expiresAt;
    if (!expiresMs) return false;
    return expiresMs - Date.now() < 15 * 60 * 1000;
  })();

  const getParticipantText = () => {
    if (participantCount <= 1) return "Just started";
    if (participantCount === 2) return "2 here";
    return `${participantCount} here`;
  };

  const lastActivityMs = room.lastMessageAt?.seconds
    ? room.lastMessageAt.seconds * 1000
    : room.lastMessageAt instanceof Date
      ? room.lastMessageAt.getTime()
      : room.lastMessageAt ||
        (room.createdAt?.seconds ? room.createdAt.seconds * 1000 : Date.now());

  const isActiveNow = Date.now() - lastActivityMs < 5 * 60 * 1000;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    <View className="flex-row">
      {/* Left accent bar */}
      <View
        className="w-[3px] rounded-full mr-4 self-stretch"
        style={{ backgroundColor: categoryColor, opacity: 0.7 }}
      />
      <View className="flex-1">
        {/* Category + Ghost badge */}
        <View className="flex-row items-center mb-2">
          <Ionicons
            name={categoryIcon}
            size={11}
            color={categoryColor}
            style={{ marginRight: 5 }}
          />
          <Text
            className="font-medium text-[11px]"
            style={{ color: categoryColor }}
          >
            {room.category}
          </Text>

          {room.visibility === "ghost" && (
            <View className="flex-row items-center ml-2.5 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10">
              <MaterialCommunityIcons
                name="ghost"
                size={10}
                color="#A855F7"
                style={{ marginRight: 3 }}
              />
              <Text className="font-semibold text-[9px] text-purple-600 dark:text-purple-400">
                Ghost
              </Text>
            </View>
          )}

          {isActiveNow && (
            <View className="flex-row items-center ml-auto">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
              <Text className="text-green-600 dark:text-green-400 text-[10px] font-medium">
                Active
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          className="text-secondary dark:text-gray-100 font-heading tracking-tight text-[18px] leading-6 mb-1"
          numberOfLines={1}
        >
          {room.title}
        </Text>

        {/* Last Message */}
        {room.lastMessage && (
          <Text
            className="text-gray-400 dark:text-gray-500 text-[13px] font-body mb-2"
            numberOfLines={1}
          >
            {room.lastMessageSenderId === currentUserId ? "You: " : ""}
            {room.lastMessage}
          </Text>
        )}

        {/* Meta row */}
        <View className="flex-row items-center mb-3">
          {getExpiryText() === "Expired" ? (
            <View className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
          ) : isDying ? (
            <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          ) : (
            <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
          )}
          <Text className="text-gray-400 text-[11px] font-medium">
            {getExpiryText()}
          </Text>
          {room.distance !== undefined && !isExploreMode && (
            <>
              <Text className="text-gray-300 dark:text-gray-600 mx-1.5">·</Text>
              <Text className="text-gray-400 text-[11px] font-medium">
                {room.distance.toFixed(1)} km
              </Text>
            </>
          )}
          {isExploreMode && (
            <>
              <Text className="text-gray-300 dark:text-gray-600 mx-1.5">·</Text>
              <Text className="text-gray-400 text-[11px] font-medium">
                Approximate Area
              </Text>
            </>
          )}
        </View>

        {/* Footer */}
        <View className="flex-row justify-between items-center pt-3 border-t border-gray-50 dark:border-[#2A2A2E]">
          <View className="flex-row items-center">
            <View className="flex-row -space-x-2 mr-2.5">
              {(room.participants || []).slice(0, 3).map((participantId, i) => (
                <ParticipantAvatar
                  key={participantId}
                  userId={participantId}
                  size={24}
                  index={i}
                />
              ))}
              {participantCount > 3 && (
                <View className="w-6 h-6 rounded-lg border-2 border-white dark:border-[#1A1A1E] items-center justify-center bg-gray-100 dark:bg-[#252528]">
                  <Text className="text-gray-500 dark:text-gray-400 font-bold text-[9px]">
                    +{participantCount - 3}
                  </Text>
                </View>
              )}
              {participantCount === 0 && (
                <View className="w-6 h-6 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 items-center justify-center bg-gray-50 dark:bg-[#252528]">
                  <Ionicons name="person-add-outline" size={10} color="#9CA3AF" />
                </View>
              )}
            </View>
            <Text className="text-muted dark:text-gray-500 text-[12px] font-medium">
              {getParticipantText()}
            </Text>
          </View>
          <View className="border border-primary/30 px-4 py-2 rounded-xl">
            <Text className="text-primary font-semibold text-[12px]">{buttonText}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress?.(room)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        className="mb-3"
      >
        {isDiscovery ? (
          <View
            className="rounded-2xl p-4 bg-white dark:bg-[#1A1A1E] border border-border-light dark:border-[#2A2A2E]"
          >
            {cardContent}
          </View>
        ) : (
          <View
            className={`rounded-2xl p-4 border overflow-hidden ${
              isOwner
                ? "bg-primary-surface dark:bg-[#2C2320] border-primary/20"
                : "bg-white dark:bg-[#1A1A1E] border-border-light dark:border-[#2A2A2E]"
            }`}
          >
            {cardContent}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

export default RoomCard;
