import React from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories";
import { useTheme } from "../../context/ThemeContext";

export default function FallbackRoomCard({ room, onPress }) {
  const { isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
    if (onPress) onPress(room);
  };

  const categoryColor = CATEGORY_COLORS[room.category] || "#9CA3AF";
  const categoryIcon = CATEGORY_ICONS[room.category] || "planet";
  const participantCount = room.participantCount || (room.participants?.length || 0);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        className="mb-4"
      >
        <View
          className="rounded-2.5xl overflow-hidden"
          style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
              borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            },
            Platform.OS === "ios" && styles.cardShadow,
          ]}
        >
          {/* Soft category-colored ambient glow — top-left corner */}
          <View
            style={[
              styles.ambientGlow,
              { backgroundColor: categoryColor, opacity: 0.06 },
            ]}
          />

          {/* Thin accent line at the very top */}
          <View
            style={[
              styles.topAccent,
              { backgroundColor: categoryColor },
            ]}
          />

          <View className="px-4 pt-4 pb-3.5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${categoryColor}15` }}
                >
                  <Ionicons name={categoryIcon} size={15} color={categoryColor} />
                </View>
                <View 
                  className="flex-row items-center px-2.5 py-1.5 rounded-lg"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                >
                  <Ionicons name="people" size={12} color={isDark ? "#A1A1AA" : "#6B7280"} />
                  <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold ml-1.5">
                    {participantCount}
                  </Text>
                </View>
              </View>
              <View className="bg-primary/10 dark:bg-primary/20 px-2.5 py-1.5 rounded-lg">
                <Text className="text-primary font-bold text-[10px] uppercase tracking-wider">
                  Public
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-1.5">
              {room.icon && (
                <Text className="text-xl mr-2">{room.icon}</Text>
              )}
              <Text className="text-secondary dark:text-white font-display text-[19px] leading-6 tracking-tight font-bold">
                {room.title || "Untitled Room"}
              </Text>
            </View>
            
            <Text 
              className="text-gray-500 dark:text-gray-400 text-[13px] font-body leading-5 mb-4"
              numberOfLines={2}
            >
              {room.description || "No description provided."}
            </Text>

            <View 
              className="flex-row items-center justify-between pt-3"
              style={{
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              }}
            >
              <Text className="text-muted text-[11px] font-bold uppercase tracking-widest">
                Global Space
              </Text>
              <View 
                className="flex-row items-center px-4 py-2 rounded-xl"
                style={{ backgroundColor: categoryColor }}
              >
                <Text className="text-white font-bold text-[11px] tracking-wide mr-1.5">
                  Join
                </Text>
                <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.7)" />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  ambientGlow: {
    position: "absolute",
    top: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  topAccent: {
    height: 2,
    marginHorizontal: 20,
    borderRadius: 1,
    opacity: 0.35,
  },
});
