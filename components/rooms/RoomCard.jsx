import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { memo, useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories";
import { useTheme } from "../../context/ThemeContext";
import ParticipantAvatar from "./ParticipantAvatar";

function toMillis(value) {
  if (!value) return null;
  if (value.seconds) return value.seconds * 1000;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return null;
}

/** Breathing green dot for active rooms */
function ActiveDot() {
  const breathe = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0.5,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [breathe]);

  return (
    <View className="flex-row items-center ml-auto bg-green-500/10 px-2.5 py-1 rounded-lg">
      <Animated.View
        className="w-[6px] h-[6px] rounded-full bg-green-400 mr-1.5"
        style={{ opacity: breathe }}
      />
      <Text className="text-green-500 dark:text-green-400 text-[10px] font-bold tracking-wide">
        LIVE
      </Text>
    </View>
  );
}

/** Expiry tone dot */
function ToneDot({ tone }) {
  const colors = {
    expired: "#F87171",
    ending: "#FBBF24",
    active: "#34D399",
  };
  return (
    <View
      className="w-[5px] h-[5px] rounded-full mr-1.5"
      style={{ backgroundColor: colors[tone] || colors.active }}
    />
  );
}

const RoomCard = memo(function RoomCard({
  room,
  onPress,
  variant = "discovery",
  currentUserId,
  isExploreMode = false,
}) {
  const { isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDiscovery = variant === "discovery";
  const categoryIcon = CATEGORY_ICONS[room.category] || "grid";
  const categoryColor = CATEGORY_COLORS[room.category] || "#6B7280";

  const buttonText = isExploreMode ? "Preview" : isDiscovery ? "Join" : "Enter";

  const getExpiryInfo = () => {
    const expiresMs = toMillis(room.expiresAt);
    if (!expiresMs) return { label: "Open now", tone: "active" };
    const now = Date.now();
    const diffMs = expiresMs - now;

    if (diffMs <= 0) return { label: "Expired", tone: "expired" };

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    let label;
    if (hours >= 24) {
      label = `${Math.floor(hours / 24)}d left`;
    } else if (hours > 0) {
      label = mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
    } else {
      label = `${Math.max(1, mins)}m left`;
    }

    return {
      label,
      tone: diffMs < 15 * 60 * 1000 ? "ending" : "active",
    };
  };

  const participantCount = room.participants?.length || 0;
  const expiryInfo = getExpiryInfo();

  const getParticipantText = () => {
    if (participantCount <= 1) return "Just started";
    if (participantCount === 2) return "2 people";
    return `${participantCount} people`;
  };

  const lastActivityMs =
    toMillis(room.lastMessageAt) || toMillis(room.createdAt);

  const isActiveNow =
    !!lastActivityMs && Date.now() - lastActivityMs < 5 * 60 * 1000;

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

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(room);
  };

  const cardContent = (
    <View className="overflow-hidden">
      {/* Soft category-colored ambient glow — top-left corner */}
      <View
        style={[
          styles.ambientGlow,
          { backgroundColor: categoryColor, opacity: 0.06 },
        ]}
      />

      {/* Thin accent line at the very top */}
      <View style={[styles.topAccent, { backgroundColor: categoryColor }]} />

      <View className="px-4 pt-4 pb-3.5">
        {/* Top row: Category badge + Active indicator */}
        <View className="flex-row items-center mb-3">
          <View
            className="flex-row items-center px-2.5 py-1.5 rounded-lg mr-2"
            style={{ backgroundColor: `${categoryColor}15` }}
          >
            <Ionicons name={categoryIcon} size={12} color={categoryColor} />
            <Text
              className="font-bold text-[10px] ml-1.5 uppercase tracking-wider"
              style={{ color: categoryColor }}
            >
              {room.category || "General"}
            </Text>
          </View>

          {room.visibility === "ghost" && (
            <View className="flex-row items-center px-2.5 py-1.5 rounded-lg bg-purple-500/10">
              <MaterialCommunityIcons
                name="ghost"
                size={11}
                color="#A855F7"
                style={{ marginRight: 3 }}
              />
              <Text className="font-bold text-[10px] text-purple-400 uppercase tracking-wider">
                Ghost
              </Text>
            </View>
          )}
          {isActiveNow && <ActiveDot />}
        </View>

        {/* Title */}
        <Text
          className="text-secondary dark:text-white font-display text-[19px] leading-6 mb-1.5 tracking-tight"
          numberOfLines={2}
        >
          {room.title || "Untitled room"}
        </Text>

        {/* Last Message preview */}
        {room.lastMessage && (
          <Text
            className="text-gray-400 dark:text-gray-500 text-[13px] font-body mb-1"
            numberOfLines={1}
          >
            {room.lastMessageSenderId === currentUserId ? "You: " : ""}
            {room.lastMessage}
          </Text>
        )}

        {/* Meta: expiry + distance */}
        <View className="flex-row items-center mt-1 mb-3.5">
          <ToneDot tone={expiryInfo.tone} />
          <Text className="text-gray-500 dark:text-gray-500 text-[11px] font-medium">
            {expiryInfo.label}
          </Text>
          {room.distance !== undefined && !isExploreMode && (
            <>
              <Text className="text-gray-300 dark:text-gray-700 mx-1.5 text-[8px]">
                ●
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-[11px] font-medium">
                {room.distance.toFixed(1)} km
              </Text>
            </>
          )}
          {isExploreMode && (
            <>
              <Text className="text-gray-300 dark:text-gray-700 mx-1.5 text-[8px]">
                ●
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-[11px] font-medium">
                Nearby area
              </Text>
            </>
          )}
        </View>

        {/* Footer: participants + action button */}
        <View
          className="flex-row justify-between items-center pt-3"
          style={{
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
          }}
        >
          <View className="flex-row items-center">
            <View className="flex-row mr-2.5" style={{ marginLeft: -2 }}>
              {(room.participants || []).slice(0, 3).map((participantId, i) => (
                <ParticipantAvatar
                  key={`${participantId}-${i}`}
                  userId={participantId}
                  size={26}
                  index={i}
                />
              ))}
              {participantCount > 3 && (
                <View
                  className="w-[26px] h-[26px] rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                    marginLeft: -6,
                    borderWidth: 2,
                    borderColor: isDark ? "#1E1E23" : "#FFFFFF",
                  }}
                >
                  <Text className="text-gray-400 font-bold text-[8px]">
                    +{participantCount - 3}
                  </Text>
                </View>
              )}
              {participantCount === 0 && (
                <View
                  className="w-[26px] h-[26px] rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.04)",
                  }}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={11}
                    color="#6B7280"
                  />
                </View>
              )}
            </View>
            <Text className="text-gray-500 dark:text-gray-500 text-[12px] font-medium">
              {getParticipantText()}
            </Text>
          </View>

          {/* Action button */}
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={[
              styles.actionButton,

              {
                backgroundColor: "transparent",
                borderWidth: 1.5,
                borderColor: `${categoryColor}50`,
              },
            ]}
          >
            <Text
              className="font-bold text-[11px] tracking-wide"
              style={{
                color: categoryColor,
              }}
            >
              {buttonText}
            </Text>
            {isDiscovery && (
              <Ionicons
                name="arrow-forward"
                size={12}
                color={categoryColor}
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        className="mb-3"
      >
        <View
          className="overflow-hidden"
          style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
              borderColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.06)",
            },

            Platform.OS === "ios" && styles.cardShadow,
          ]}
        >
          {cardContent}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    elevation: 2,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  topAccent: {
    height: 2,
    marginHorizontal: 20,
    borderRadius: 1,
    opacity: 0.35,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
});

export default RoomCard;
