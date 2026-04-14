import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();

  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChatRow({ chat, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const otherUser = chat?.otherUser;
  const lastMsg = chat?.lastMessage;
  const time = chat?.lastMessageAt ? formatTime(chat.lastMessageAt) : "";

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 100,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className="flex-row items-center p-4 border border-gray-100 bg-white rounded-3xl shadow-sm shadow-gray-200 mb-3"
      >
        <View className="relative">
          <Image
            source={{
              uri: otherUser?.profilePic || "https://picsum.photos/200",
            }}
            className="rounded-[22px] bg-gray-100 border border-gray-50"
            style={{ width: 60, height: 60 }}
          />
          <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-[3px] border-white z-10 shadow-sm shadow-green-100" />
        </View>

        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-secondary font-extrabold text-[17px] tracking-tight">
              {otherUser?.userName || "User"}
            </Text>
            <Text className="text-gray-400 text-xs font-semibold">{time}</Text>
          </View>

          <View className="flex-row items-center">
            <Text
              className="text-gray-500 text-[13px] leading-5 flex-1"
              numberOfLines={1}
            >
              {lastMsg || "Click to start the conversation..."}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
