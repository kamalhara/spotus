import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import GlassContainer from "../../ui/GlassContainer";

export default function PinnedMessageBanner({
  pinnedMessage,
  isHost,
  isDark,
  onUnpin,
}) {
  if (!pinnedMessage) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(240)}
      className="px-5 pt-2 pb-1 z-10"
    >
      <GlassContainer
        borderRadius={16}
        fallbackClassName="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30"
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isDark
            ? "rgba(59,130,246,0.1)"
            : "rgba(239,246,255,0.8)",
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-1">
              <Ionicons name="pin" size={14} color="#3B82F6" />
              <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold ml-1.5 uppercase tracking-widest">
                Pinned Announcement
              </Text>
            </View>
            <Text
              className="text-secondary dark:text-gray-200 text-sm font-semibold"
              numberOfLines={2}
            >
              <Text className="font-bold text-primary dark:text-primary-light">
                {pinnedMessage.senderName}: {" "}
              </Text>
              {pinnedMessage.text}
            </Text>
          </View>
          {isHost && (
            <TouchableOpacity
              onPress={onUnpin}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="bg-white/50 dark:bg-black/20 p-1.5 rounded-full"
            >
              <Ionicons name="close" size={16} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>
      </GlassContainer>
    </Animated.View>
  );
}
