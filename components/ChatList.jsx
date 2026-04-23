import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import useFirestoreUser from "../hook/useFireStoreUser";
import usePresenceStatus from "../hook/usePresenceStatus";
import useTypingIndicator from "../hook/useTypingIndicator";
import { isChatUnseen } from "../lib/chatSeen";
import { getStatus } from "../lib/getStatus";

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

  // Pulsing animation for online status dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  const isTyping = useTypingIndicator(chat.id, currentUserId);
  const userStatus = usePresenceStatus(otherUser?.lastSeen);

  const isUnread = isChatUnseen(chat, currentUserId);
  const isOnline = userStatus === "Active now";

  // Pulse animation for active users
  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className={`flex-row items-center p-4 border rounded-3xl mb-3 ${
          isUnread
            ? "border-indigo-100 bg-indigo-50/30"
            : "border-gray-100 bg-white"
        }`}
        style={
          isUnread
            ? {
                shadowColor: "#4F46E5",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }
            : {
                shadowColor: "#94A3B8",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }
        }
      >
        <View className="relative">
          <Image
            source={{
              uri: otherUser?.profilePic || "https://picsum.photos/200",
            }}
            className="rounded-[22px] bg-gray-100 border border-gray-50"
            style={{ width: 60, height: 60 }}
          />
          {/* Pulse ring behind status dot */}
          {isOnline && (
            <Animated.View
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "rgba(74, 222, 128, 0.3)",
                transform: [{ scale: pulseAnim }],
              }}
            />
          )}
          <View
            className={`absolute -bottom-1 -right-1 w-5 h-5 ${
              isOnline ? "bg-green-400" : "bg-gray-300"
            } rounded-full border-[3px] border-white z-10`}
          />
        </View>

        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row justify-between items-center mb-1">
            <Text
              className={`text-secondary ${isUnread ? "font-black" : "font-extrabold"} text-[17px] tracking-tight`}
            >
              {otherUser?.userName || "User"}
            </Text>
            <View className="flex-row items-center">
              <Text
                className={`${isUnread ? "text-primary font-bold" : "text-gray-400 font-semibold"} text-xs`}
              >
                {time}
              </Text>
              {isUnread && (
                <View className="w-2.5 h-2.5 bg-primary rounded-full ml-2" />
              )}
            </View>
          </View>

          <View className="flex-row items-center">
            {isTyping ? (
              <Text className="text-primary text-[13px] font-semibold leading-5 flex-1">
                Typing...
              </Text>
            ) : (
              <Text
                className={`${isUnread ? "text-secondary font-bold" : "text-gray-500"} text-[13px] leading-5 flex-1`}
                numberOfLines={1}
              >
                {lastMsg || "Click to start the conversation..."}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
