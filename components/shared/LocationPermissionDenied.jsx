import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Linking, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GlassButton from "../ui/GlassButton";
import { trackEvent } from "../../lib/analytics";

export default function LocationPermissionDenied({ fullScreen = false, onEnableGhostMode }) {
  const handleEnableGhostMode = async () => {
    await AsyncStorage.setItem("isGhostBrowsing", "true");
    trackEvent("Explore Mode enabled", { source: "permission_denied_screen" });
    if (onEnableGhostMode) {
      onEnableGhostMode();
    }
  };

  return (
    <View
      className={`${fullScreen ? "flex-1 " : ""}items-center justify-center py-20 px-6`}
    >
      <View className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full items-center justify-center mb-6 border border-purple-100 dark:border-purple-800/30">
        <MaterialCommunityIcons name="ghost-outline" size={40} color="#A855F7" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-xl font-display font-black tracking-tight text-center mb-2.5">
        Explore Privately
      </Text>
      <Text className="text-muted text-[15px] font-medium text-center leading-6 px-4 mb-8">
        You can still discover conversations happening nearby without sharing your exact location.
      </Text>
      
      <View className="w-full gap-3">
        <GlassButton
          onPress={handleEnableGhostMode}
          shape="pill"
          size="regular"
        >
          <View className="flex-row items-center justify-center gap-2 py-3.5 w-full">
            <MaterialCommunityIcons name="ghost" size={18} color="#A855F7" />
            <Text className="text-purple-600 dark:text-purple-400 font-bold text-[15px]">
              Continue Exploring
            </Text>
          </View>
        </GlassButton>

        <GlassButton
          onPress={() => Linking.openSettings()}
          shape="pill"
          size="regular"
        >
          <View className="flex-row items-center justify-center gap-2 py-3.5 w-full">
            <Ionicons name="location-outline" size={18} color="#FF6B47" />
            <Text className="text-primary dark:text-primary-light font-bold text-[15px]">
              Enable Location
            </Text>
          </View>
        </GlassButton>
      </View>
    </View>
  );
}
