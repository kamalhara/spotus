import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import GlassContainer from "../ui/GlassContainer";
import { useTheme } from "../../context/ThemeContext";

export default function GhostModeBanner({ room, showGhostBanner = true, setShowGhostBanner, onShare }) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  if (room?.visibility !== "ghost" || !showGhostBanner) return null;

  const handleCopyCode = async () => {
    if (!room?.inviteCode) return;
    await Clipboard.setStringAsync(room.inviteCode);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <View className="px-5 pt-3 pb-1">
      <GlassContainer
        borderRadius={16}
        fallbackClassName="bg-purple-50 dark:bg-[#2A1635] border border-purple-200 dark:border-[#4B2261]"
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: isDark ? "#2A1635" : "#FAF5FF",
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-1.5">
              <MaterialCommunityIcons name="ghost" size={16} color="#A855F7" />
              <Text className="text-purple-600 dark:text-purple-300 text-xs font-bold ml-1.5 uppercase tracking-widest">
                Ghost Mode Active
              </Text>
            </View>
            <Text className="text-purple-500 dark:text-purple-400 text-xs leading-4 pr-2">
              Share this code with friends so they can join the event:
            </Text>
          </View>
          {setShowGhostBanner && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowGhostBanner(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#A855F7" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/30">
          <TouchableOpacity
            onPress={handleCopyCode}
            activeOpacity={0.7}
            className="bg-white dark:bg-[#1C1C20] border border-purple-100 dark:border-purple-800/50 px-4 py-2.5 rounded-xl flex-row items-center mr-3"
          >
            <Text className="text-purple-700 dark:text-purple-300 font-display font-black tracking-[3px] text-[17px] mr-2">
              {copied ? "COPIED" : room?.inviteCode}
            </Text>
            <Ionicons
              name={copied ? "checkmark-outline" : "copy-outline"}
              size={14}
              color="#A855F7"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShare || handleCopyCode}
            activeOpacity={0.7}
            className="bg-purple-600 px-4 py-2.5 rounded-xl flex-row items-center flex-1 justify-center"
          >
            <Ionicons
              name="share-outline"
              size={14}
              color="white"
              style={{ marginRight: 6 }}
            />
            <Text className="text-white text-xs font-bold">{onShare ? "Share Link" : "Copy Link"}</Text>
          </TouchableOpacity>
        </View>
      </GlassContainer>
    </View>
  );
}
