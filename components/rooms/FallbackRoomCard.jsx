import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import GlassContainer from "../ui/GlassContainer";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories";

export default function FallbackRoomCard({ room, onPress }) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
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
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        className="mb-4"
      >
        <GlassContainer
          borderRadius={24}
          fallbackClassName="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View className="p-5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center space-x-2">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: `${categoryColor}20` }}
                >
                  <Ionicons name={categoryIcon} size={16} color={categoryColor} />
                </View>
                <View className="flex-row items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-[#252528]">
                  <Ionicons name="people" size={12} color="#6B7280" />
                  <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold ml-1">
                    {participantCount}
                  </Text>
                </View>
              </View>
              <View className="bg-primary-surface dark:bg-primary-surface px-2.5 py-1 rounded-full">
                <Text className="text-primary font-bold text-[10px] uppercase tracking-widest">
                  Public
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-1.5">
              {room.icon && (
                <Text className="text-xl mr-2">{room.icon}</Text>
              )}
              <Text className="text-secondary dark:text-gray-100 text-lg font-display font-bold">
                {room.title}
              </Text>
            </View>
            
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-5 mb-4">
              {room.description}
            </Text>

            <View className="flex-row items-center justify-between mt-1 pt-4 border-t border-gray-100 dark:border-[#2C2C30]">
              <Text className="text-muted text-[11px] font-bold uppercase tracking-widest">
                Global Space
              </Text>
              <View className="bg-gray-100 dark:bg-[#252528] px-4 py-2 rounded-full flex-row items-center">
                <Text className="text-secondary dark:text-gray-300 font-bold text-[12px] mr-1">
                  Join
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#4B5563" />
              </View>
            </View>
          </View>
        </GlassContainer>
      </TouchableOpacity>
    </Animated.View>
  );
}
