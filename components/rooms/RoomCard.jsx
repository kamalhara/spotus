import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { memo, useRef } from "react";
import { Animated, Share, Text, TouchableOpacity, View } from "react-native";
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

  const handleShare = async () => {
    try {
      const inviteLink = Linking.createURL("join/" + room?.inviteCode);
      await Share.share({
        message: `Join my event: ${room?.title} on SpotUs! Use invite code ${room?.inviteCode} or tap here: ${inviteLink}`,
      });
    } catch (error) {
      console.error("Error sharing room:", error);
    }
  };

  const cardContent = (
    <>
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
      <View className="flex-row items-center mb-1.5 justify-between">
        <Text
          className="text-secondary dark:text-gray-100 font-display font-extrabold tracking-tight text-[20px] leading-7 flex-1"
          numberOfLines={1}
        >
          {room.title}
        </Text>
        {isActiveNow && (
          <View className="flex-row items-center ml-2 bg-green-500/10 px-2 py-1 rounded-md">
            <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
            <Text className="text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
              Active
            </Text>
          </View>
        )}
      </View>

      {/* Last Message */}
      {room.lastMessage && (
        <Text
          className="text-gray-500 dark:text-gray-400 text-[13px] font-medium mb-3"
          numberOfLines={1}
        >
          {room.lastMessageSenderId === currentUserId ? "You: " : ""}
          {room.lastMessage}
        </Text>
      )}

      <View className="flex-row items-center mb-4">
        {getExpiryText() === "Expired" ? (
          <View className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
        ) : isDying ? (
          <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
        ) : (
          <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
        )}
        <Text className="text-gray-400 text-xs font-semibold">
          {getExpiryText()}
        </Text>
        {room.distance !== undefined && !isExploreMode && (
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
        {isExploreMode && (
          <>
            <Text className="text-gray-300 dark:text-gray-600 mx-2">•</Text>
            <Ionicons
              name="location"
              size={12}
              color="#9CA3AF"
              style={{ marginRight: 2, marginTop: -1 }}
            />
            <Text className="text-gray-400 text-xs font-medium">
              Approximate Area
            </Text>
          </>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center pt-4 mt-1">
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
            {participantCount > 3 && (
              <View className="w-7 h-7 rounded-xl border-2 border-white dark:border-[#1C1C20] items-center justify-center bg-gray-100 dark:bg-[#252528]">
                <Text className="text-gray-500 dark:text-gray-400 font-bold text-[10px]">
                  +{participantCount - 3}
                </Text>
              </View>
            )}
            {participantCount === 0 && (
              <View className="w-7 h-7 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 items-center justify-center bg-gray-50 dark:bg-[#252528]">
                <Ionicons name="person-add-outline" size={12} color="#9CA3AF" />
              </View>
            )}
          </View>
          <Text className="text-muted dark:text-gray-500 text-[13px] font-semibold">
            {getParticipantText()}
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
          <View
            className="rounded-[20px] p-5 bg-white dark:bg-[#1C1C20] border border-border-light dark:border-[#2C2C30]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {cardContent}
          </View>
        ) : (
          <View
            className={`rounded-[24px] p-5 border overflow-hidden ${
              isOwner
                ? "bg-primary-surface dark:bg-[#2C2320] border-primary/30"
                : "bg-white dark:bg-[#1C1C20] border-border-light dark:border-[#2C2C30]"
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
