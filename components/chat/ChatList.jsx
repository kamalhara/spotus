import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { doc, setDoc } from "firebase/firestore";
import React, { memo, useRef, useState } from "react";
import { deleteChatWithMessages } from "../../lib/deleteRoom";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase.config";
import { useTheme } from "../../context/ThemeContext";
import useFirestoreUser from "../../hook/useFireStoreUser";
import usePresenceStatus from "../../hook/usePresenceStatus";
import { isChatUnseen } from "../../lib/chatSeen";
import GlassButton from "../ui/GlassButton";
import GlassContainer from "../ui/GlassContainer";

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

const ChatRow = memo(function ChatRow({ chat, onPress }) {
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

  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  
  let isTyping = false;
  if (chat?.typing && currentUserId) {
    for (const [key, val] of Object.entries(chat.typing)) {
      if (key !== currentUserId && val) {
        isTyping = true;
        break;
      }
    }
  }

  const userStatus = usePresenceStatus(otherUser?.lastSeen);

  const isUnread = isChatUnseen(chat, currentUserId);
  const isOnline = userStatus === "Active now";
  const { isDark } = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const [isMuted, setIsMuted] = useState(
    chat?.mutedBy?.includes(currentUserId) || false,
  );

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowOptions(true);
  };

  const handleDeleteChat = () => {
    setShowOptions(false);
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteChatWithMessages(chat.id);
          } catch (err) {
            console.error("Error deleting chat:", err);
          }
        },
      },
    ]);
  };

  const handleMuteChat = async () => {
    setShowOptions(false);
    try {
      const mutedBy = chat?.mutedBy || [];
      const newMutedBy = isMuted
        ? mutedBy.filter((id) => id !== currentUserId)
        : [...mutedBy, currentUserId];

      await setDoc(
        doc(db, "chats", chat.id),
        { mutedBy: newMutedBy },
        { merge: true },
      );
      setIsMuted(!isMuted);
    } catch (err) {
      console.error("Error muting chat:", err);
    }
  };

  const handleBlockUser = () => {
    setShowOptions(false);
    Alert.alert(
      "Block User",
      `Are you sure you want to block ${otherUser?.userName || "this user"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              const userRef = doc(db, "users", currentUserId);
              const blockedUsers = firestoreUser?.blockedUsers || [];
              await setDoc(
                userRef,
                {
                  blockedUsers: [
                    ...blockedUsers,
                    otherUser?.id ||
                      chat?.participants?.find((p) => p !== currentUserId),
                  ],
                },
                { merge: true },
              );
            } catch (err) {
              console.error("Error blocking user:", err);
            }
          },
        },
      ],
    );
  };

  const OPTIONS = [
    {
      label: isMuted ? "Unmute" : "Mute",
      icon: isMuted ? "notifications" : "notifications-off",
      color: "#6B7280",
      onPress: handleMuteChat,
    },
    {
      label: "Delete",
      icon: "trash-outline",
      color: "#EF4444",
      onPress: handleDeleteChat,
    },
    {
      label: "Block",
      icon: "ban-outline",
      color: "#EF4444",
      onPress: handleBlockUser,
    },
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className="flex-row items-center py-3 mb-1"
      >
        <View className="relative">
          <Image
            source={{
              uri: otherUser?.profilePic || "https://picsum.photos/200",
            }}
            className="rounded-2xl bg-gray-100 dark:bg-gray-800"
            style={{ width: 48, height: 48 }}
          />
          <View
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${
              isOnline ? "bg-[#10B981]" : "bg-gray-300 dark:bg-gray-600"
            } rounded-full border-2 border-bg dark:border-[#111112] z-10`}
          />
        </View>

        <View className="flex-1 ml-3 justify-center">
          <View className="flex-row justify-between items-center mb-0.5">
            <Text
              className={`text-secondary dark:text-gray-100 ${isUnread ? "font-heading" : "font-semibold"} text-[15px] tracking-tight flex-1 mr-3`}
              numberOfLines={1}
            >
              {otherUser?.userName || "User"}
            </Text>
            <View className="flex-row items-center">
              {isMuted && (
                <Ionicons
                  name="volume-mute"
                  size={12}
                  color="#9CA3AF"
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                className={`${isUnread ? "text-primary font-semibold" : "text-gray-400 font-medium"} text-[11px]`}
              >
                {time}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            {isTyping ? (
              <Text className="text-primary text-[13px] font-semibold leading-5 flex-1">
                Typing...
              </Text>
            ) : (
              <Text
                className={`${isUnread ? "text-secondary dark:text-gray-200 font-semibold" : "text-gray-400 dark:text-gray-500 font-body"} text-[13px] leading-5 flex-1`}
                numberOfLines={1}
              >
                {lastMsg || "No messages yet"}
              </Text>
            )}
            {isUnread && (
              <View className="bg-primary h-2 w-2 rounded-full ml-2" />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Options Menu Modal */}
      <Modal
        transparent
        visible={showOptions}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowOptions(false)}
        >
          <View className="flex-1 justify-end pb-3 px-2">
            <Pressable>
              <GlassContainer
                borderRadius={28}
                style={{
                  paddingTop: 12,
                  paddingBottom: 8,
                }}
              >
                {/* Header */}
                <View className="flex-row items-center px-5 mb-4">
                  <View
                    className="overflow-hidden"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 16,
                      backgroundColor: isDark ? "#2A2A2E" : "#F3F4F6",
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          otherUser?.profilePic || "https://picsum.photos/200",
                      }}
                      style={{ width: 44, height: 44 }}
                    />
                  </View>
                  <View className="ml-3.5 flex-1">
                    <Text className="text-secondary dark:text-gray-100 font-heading text-[16px] tracking-tight">
                      {otherUser?.userName || "User"}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <View
                        className="rounded-full mr-1.5"
                        style={{
                          width: 6,
                          height: 6,
                          backgroundColor: isOnline ? "#10B981" : "#9CA3AF",
                        }}
                      />
                      <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-medium">
                        {userStatus}
                      </Text>
                    </View>
                  </View>
                  <GlassButton
                    onPress={() => setShowOptions(false)}
                    size={34}
                    shape="circle"
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={isDark ? "#F3F4F6" : "#6B7280"}
                    />
                  </GlassButton>
                </View>

                {/* Divider */}
                <View className="h-px bg-gray-100 dark:bg-[#2A2A2E] mx-5 mb-1" />

                {/* Options */}
                {OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      option.onPress();
                    }}
                    activeOpacity={0.6}
                    className="flex-row items-center mx-3 px-3 py-3.5 rounded-2xl"
                  >
                    <View
                      className="items-center justify-center mr-3.5"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        backgroundColor:
                          option.color === "#EF4444"
                            ? isDark
                              ? "rgba(239,68,68,0.12)"
                              : "rgba(239,68,68,0.06)"
                            : isDark
                              ? "rgba(107,114,128,0.12)"
                              : "rgba(107,114,128,0.06)",
                      }}
                    >
                      <Ionicons
                        name={option.icon}
                        size={17}
                        color={option.color}
                      />
                    </View>
                    <Text
                      className="text-[15px] font-semibold flex-1"
                      style={{ color: option.color }}
                    >
                      {option.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={isDark ? "#4B5563" : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                ))}
              </GlassContainer>

              {/* Cancel Button */}
              <GlassContainer
                borderRadius={20}
                style={{
                  marginTop: 8,
                  paddingVertical: 15,
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowOptions(false)}
                  activeOpacity={0.7}
                  className="items-center w-full"
                >
                  <Text
                    className="font-semibold text-[15px]"
                    style={{ color: isDark ? "#FFAB99" : "#FF6B47" }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </GlassContainer>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Animated.View>
  );
});

export default ChatRow;
