import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useRef, useState } from "react";
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
import useFirestoreUser from "../../hook/useFireStoreUser";
import usePresenceStatus from "../../hook/usePresenceStatus";
import useTypingIndicator from "../../hook/useTypingIndicator";
import { isChatUnseen } from "../../lib/chatSeen";

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();

  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

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

  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  const isTyping = useTypingIndicator(chat.id, currentUserId);
  const userStatus = usePresenceStatus(otherUser?.lastSeen);

  const isUnread = isChatUnseen(chat, currentUserId);
  const isOnline = userStatus === "Active now";
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
            await deleteDoc(doc(db, "chats", chat.id));
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
        className={`flex-row items-center px-4 py-4 border rounded-[24px] mb-3 ${
          isUnread
            ? "border-primary/20 bg-primary/5 dark:bg-primary/10"
            : "border-gray-100 dark:border-[#2A2A36] bg-white dark:bg-[#1A1A22]"
        }`}
      >
        <View className="relative">
          <Image
            source={{
              uri: otherUser?.profilePic || "https://picsum.photos/200",
            }}
            className="rounded-[20px] bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#1A1A22]"
            style={{ width: 58, height: 58 }}
          />
          <View
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${
              isOnline ? "bg-[#10B981]" : "bg-gray-300"
            } rounded-full border-[2.5px] border-white dark:border-[#1A1A22] z-10`}
          />
        </View>

        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row justify-between items-center mb-1">
            <Text
              className={`text-secondary dark:text-gray-100 ${isUnread ? "font-black" : "font-bold"} text-[16px] tracking-tight flex-1 mr-3`}
              numberOfLines={1}
            >
              {otherUser?.userName || "User"}
            </Text>
            <View className="flex-row items-center">
              {isMuted && (
                <Ionicons
                  name="volume-mute"
                  size={14}
                  color="#9CA3AF"
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                className={`${isUnread ? "text-primary font-bold" : "text-gray-400 font-semibold"} text-[12px]`}
              >
                {time}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            {isTyping ? (
              <Text className="text-primary text-[14px] font-bold leading-5 flex-1">
                Typing...
              </Text>
            ) : (
              <Text
                className={`${isUnread ? "text-secondary dark:text-gray-100 font-bold" : "text-gray-500 dark:text-gray-400 font-medium"} text-[14px] leading-5 flex-1`}
                numberOfLines={1}
              >
                {lastMsg || "No messages yet"}
              </Text>
            )}
            {isUnread && (
              <View className="bg-primary h-5 min-w-[20px] rounded-full px-1.5 items-center justify-center ml-2">
                <Text className="text-white text-[11px] font-black">
                  {chat?.unreadCount || ""}
                </Text>
              </View>
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
          className="flex-1 bg-black/30"
          onPress={() => setShowOptions(false)}
        >
          <View className="flex-1 justify-end pb-12 px-5">
            <Pressable>
              <View
                className="bg-white dark:bg-[#1A1A22] rounded-2xl overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 20,
                }}
              >
                {/* Header */}
                <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
                  <Image
                    source={{
                      uri: otherUser?.profilePic || "https://picsum.photos/200",
                    }}
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-secondary dark:text-gray-100 font-bold text-[15px]">
                      {otherUser?.userName || "User"}
                    </Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                      {userStatus}
                    </Text>
                  </View>
                </View>

                {/* Options */}
                {OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      option.onPress();
                    }}
                    activeOpacity={0.6}
                    className={`flex-row items-center px-5 py-3.5 ${
                      index < OPTIONS.length - 1
                        ? "border-b border-gray-50 dark:border-gray-800"
                        : ""
                    }`}
                  >
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
                      style={{
                        backgroundColor:
                          option.color === "#EF4444" ? "#FEF2F2" : "#F3F4F6",
                      }}
                    >
                      <Ionicons
                        name={option.icon}
                        size={18}
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
                      size={16}
                      color="#D1D5DB"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setShowOptions(false)}
                activeOpacity={0.7}
                className="bg-white dark:bg-[#1A1A22] rounded-2xl mt-2 py-4 items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-primary font-bold text-[15px]">
                  Cancel
                </Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Animated.View>
  );
}
