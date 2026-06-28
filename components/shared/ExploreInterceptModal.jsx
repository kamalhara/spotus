import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import GlassButton from "../ui/GlassButton";
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
          <View className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full items-center justify-center mb-5 border border-purple-100 dark:border-purple-800/30">
            <Ionicons name="location" size={28} color="#A855F7" />
          </View>
          
          <Text className="text-secondary dark:text-gray-100 text-[22px] font-display font-black tracking-tight mb-2.5">
            Enable Location
          </Text>
          
          <Text className="text-muted text-[15px] font-medium leading-6 mb-8">
            SpotUs requires location sharing to {actionName}. This helps keep the community authentic and prevents anonymous abuse.
          </Text>
          
          <View className="gap-3">
            <GlassButton
              onPress={onEnableLocation}
              shape="pill"
              size="regular"
            >
              <View className="flex-row items-center justify-center gap-2 py-3.5 w-full">
                <Ionicons name="location-outline" size={18} color="#FF6B47" />
                <Text className="text-primary dark:text-primary-light font-bold text-[15px]">
                  Share Precise Location
                </Text>
              </View>
            </GlassButton>
            
            <GlassButton
              onPress={onClose}
              shape="pill"
              size="regular"
            >
              <View className="flex-row items-center justify-center gap-2 py-3.5 w-full">
                <MaterialCommunityIcons name="ghost" size={18} color="#A855F7" />
                <Text className="text-purple-600 dark:text-purple-400 font-bold text-[15px]">
                  Keep Exploring
                </Text>
              </View>
            </GlassButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}
