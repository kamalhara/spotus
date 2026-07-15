import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function ExploreInterceptModal({ visible, onClose, onEnableLocation, actionName = "participate" }) {
  const { isDark } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)" }}
      >
        <TouchableOpacity 
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <View className="w-full bg-white dark:bg-[#1C1C20] rounded-[32px] p-6 border border-gray-100 dark:border-[#2C2C30]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View className="w-12 h-12 bg-primary-surface rounded-xl items-center justify-center mb-5">
            <Ionicons name="location" size={22} color="#FF6B47" />
          </View>
          
          <Text className="text-secondary dark:text-gray-100 text-[22px] font-display font-black tracking-tight mb-2.5">
            Location needed
          </Text>
          
          <Text className="text-muted text-[15px] font-medium leading-6 mb-8">
            Turn on location to {actionName}. SpotUs uses it to find rooms near you.
          </Text>
          
          <View className="gap-3">
            <TouchableOpacity
              onPress={onEnableLocation}
              activeOpacity={0.8}
              className="h-12 rounded-xl bg-primary items-center justify-center"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="location-outline" size={18} color="white" />
                <Text className="text-white font-bold text-[15px]">
                  Use my location
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.75}
              className="h-11 items-center justify-center"
            >
              <Text className="text-muted dark:text-gray-400 font-semibold text-[14px]">
                Not now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
