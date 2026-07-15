import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
      <View className="w-16 h-16 bg-primary-surface rounded-2xl items-center justify-center mb-5">
        <Ionicons name="location-outline" size={28} color="#FF6B47" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-xl font-display font-black tracking-tight text-center mb-2.5">
        Location is off
      </Text>
      <Text className="text-muted text-[15px] font-medium text-center leading-6 px-4 mb-8">
        You can preview sample public rooms without location. Location is needed
        to join or create a room.
      </Text>
      
      <View className="w-full gap-3">
        <TouchableOpacity
          onPress={handleEnableGhostMode}
          activeOpacity={0.8}
          className="h-12 rounded-xl bg-primary items-center justify-center"
        >
          <Text className="text-white font-bold text-[15px]">
            Preview public rooms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          activeOpacity={0.75}
          className="h-12 items-center justify-center"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="location-outline" size={18} color="#FF6B47" />
            <Text className="text-primary dark:text-primary-light font-bold text-[15px]">
              Open location settings
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
