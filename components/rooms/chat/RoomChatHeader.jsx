import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlassButton from "../../ui/GlassButton";

function getTimeRemaining(expiresAt) {
  if (!expiresAt) return "Open now";
  const expiresMs = expiresAt.seconds
    ? expiresAt.seconds * 1000
    : expiresAt instanceof Date
      ? expiresAt.getTime()
      : expiresAt;
  const diffMs = expiresMs - Date.now();
  if (diffMs <= 0) return "Expired";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) return `${Math.floor(hours / 24)}d left`;
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m left` : `${hours}h left`;
  }
  return `${Math.max(1, minutes)}m left`;
}

export default function RoomChatHeader({
  room,
  categoryIcon,
  categoryColor,
  isDark,
  onBack,
  onDetails,
  onShare,
  onInfo,
}) {
  return (
    <View className="bg-white dark:bg-[#1C1C20] z-10 border-b border-gray-100 dark:border-[#2C2C30]">
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-3">
          <View className="flex-row items-center flex-1">
            <GlassButton
              onPress={onBack}
              size={40}
              shape="circle"
              style={{ marginRight: 12 }}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={isDark ? "white" : "#18181B"}
              />
            </GlassButton>

            <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center mr-3">
              <Ionicons name={categoryIcon} size={18} color={categoryColor} />
            </View>

            <TouchableOpacity
              className="flex-1"
              onPress={onDetails}
              activeOpacity={0.7}
            >
              <Text
                className="text-secondary dark:text-gray-100 text-base font-display font-extrabold"
                numberOfLines={1}
              >
                {room?.title || "Loading..."}
              </Text>
              <Text
                className="text-gray-400 dark:text-gray-500 text-xs mt-0.5"
                numberOfLines={1}
              >
                {room?.category || "Room"} · {room?.participants?.length || 0}{" "}
                members · {getTimeRemaining(room?.expiresAt)}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <GlassButton
              onPress={onShare}
              size={40}
              shape="circle"
              style={{ marginRight: 8 }}
            >
              <Ionicons name="share-outline" size={18} color="#9CA3AF" />
            </GlassButton>
            <GlassButton onPress={onInfo} size={40} shape="circle">
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color="#9CA3AF"
              />
            </GlassButton>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
