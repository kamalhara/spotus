import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import GlassContainer from "../ui/GlassContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

export default function GhostBrowsingBanner({ visible, onClose, onEnableLocation }) {
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
                👻 You're exploring anonymously.
              </Text>
              <Text className="text-purple-500 dark:text-purple-400 text-[12px] leading-4 mt-0.5">
                Enable location to join conversations and create rooms.
              </Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center ml-2"
            >
              <Ionicons name="close" size={16} color="#A855F7" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/30 gap-3">
          <TouchableOpacity
            className="flex-1 items-center justify-center py-2"
            onPress={onClose}
          >
            <Text className="text-purple-600 dark:text-purple-400 font-bold text-[13px]">
              Keep Exploring
            </Text>
          </TouchableOpacity>
          <View className="w-[1px] h-4 bg-purple-200 dark:bg-purple-800/50" />
          <TouchableOpacity
            className="flex-1 items-center justify-center py-2"
            onPress={async () => {
              await AsyncStorage.setItem("isGhostBrowsing", "false");
              if (onEnableLocation) onEnableLocation();
              if (onClose) onClose();
            }}
          >
            <Text className="text-primary font-bold text-[13px]">
              Enable Location
            </Text>
          </TouchableOpacity>
        </View>
      </GlassContainer>
    </Animated.View>
  );
}
