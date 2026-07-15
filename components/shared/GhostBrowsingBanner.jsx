import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function GhostBrowsingBanner({
  visible,
  onClose,
  onEnableLocation,
}) {
  const { isDark } = useTheme();

  if (!visible) return null;

  return (
    <View className="absolute top-16 left-5 right-5 z-50">
      <View
        className="rounded-2xl border border-border dark:border-[#303034]"
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: isDark ? "#1C1C20" : "#FFFFFF",
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="w-9 h-9 rounded-xl bg-primary-surface items-center justify-center mr-3">
              <Ionicons name="eye-outline" size={18} color="#FF6B47" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-secondary dark:text-gray-100 font-bold text-[15px] tracking-tight">
                Preview mode
              </Text>
              <Text className="text-muted dark:text-gray-400 text-[12px] leading-4 mt-0.5">
                Sample rooms only. Use location to join or create.
              </Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              className="w-8 h-8 rounded-full items-center justify-center ml-2"
            >
              <Ionicons name="close" size={16} color="#8A8A8A" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center mt-3 pt-3 border-t border-border dark:border-[#303034] gap-3">
          <TouchableOpacity
            className="flex-1 items-center justify-center py-2"
            onPress={onClose}
          >
            <Text className="text-muted dark:text-gray-400 font-semibold text-[13px]">
              Dismiss
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
              Use location
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
