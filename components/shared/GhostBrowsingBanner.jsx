import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import GlassContainer from "../ui/GlassContainer";
import { useTheme } from "../../context/ThemeContext";

export default function GhostBrowsingBanner({ visible, onClose }) {
  const { isDark } = useTheme();

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify()}
      exiting={FadeOutUp.duration(300)}
      className="absolute top-16 left-5 right-5 z-50"
    >
      <GlassContainer
        borderRadius={20}
        fallbackClassName="bg-purple-50 dark:bg-[#2A1635] border border-purple-200 dark:border-[#4B2261]"
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: isDark ? "#2A1635" : "#FAF5FF",
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 items-center justify-center mr-3 border border-purple-200 dark:border-purple-800/50">
              <MaterialCommunityIcons name="ghost" size={20} color="#A855F7" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-purple-700 dark:text-purple-300 font-display font-bold text-[15px] tracking-tight">
                Exploring Privately
              </Text>
              <Text className="text-purple-500 dark:text-purple-400 text-[12px] leading-4 mt-0.5">
                Enable location to join conversations.
              </Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#A855F7" />
            </TouchableOpacity>
          )}
        </View>
      </GlassContainer>
    </Animated.View>
  );
}
