import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, Text, View } from "react-native";
import GlassButton from "../ui/GlassButton";

export default function LocationPermissionDenied({ fullScreen = false }) {
  return (
    <View
      className={`${fullScreen ? "flex-1 " : ""}items-center justify-center py-20 px-6`}
    >
      <View className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full items-center justify-center mb-6">
        <Ionicons name="location-outline" size={40} color="#EF4444" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-xl font-display font-black tracking-tight text-center mb-2.5">
        Location Required
      </Text>
      <Text className="text-muted text-[15px] font-medium text-center leading-6 px-4 mb-6">
        We need your location to find rooms near you. Please enable it in your
        device settings.
      </Text>
      <GlassButton
        onPress={() => Linking.openSettings()}
        shape="pill"
        size="regular"
      >
        <View className="flex-row items-center justify-center gap-2 py-3 px-6">
          <Ionicons name="settings-outline" size={18} color="#FF6B47" />
          <Text className="text-primary dark:text-primary-light font-bold text-[15px]">
            Open Settings
          </Text>
        </View>
      </GlassButton>
    </View>
  );
}
