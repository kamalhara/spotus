import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { FlatList, Image, Text, View } from "react-native";
import useTypingIndicator from "../hook/useTypingIndicator";
import TypingIndicator from "./TypingIndicator";

const COLORS = [
  "#4F46E5",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#14B8A6",
];

function getUserColor(username) {
  if (!username) return "#94A3B8";
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

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

export default function ChatMessages({ messages, currentUserId, chatDocId }) {
  const flatListRef = useRef(null);

  const isTyping = useTypingIndicator(chatDocId, currentUserId);

  // Auto-scroll to the bottom of the list when new messages or typing indicators appear
  useEffect(() => {
    if (!messages?.length) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages?.length, isTyping]);

  if (!messages || messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-10">
        <Ionicons name="chatbubble-outline" size={32} color="#D1D5DB" />
        <Text className="text-secondary text-base font-semibold mt-3">
          Start the conversation
        </Text>
        <Text className="text-gray-400 text-sm text-center mt-1">
          Be the first to say something.
        </Text>
      </View>
    );
  }

  const renderMessage = ({ item, index }) => {
    const isSentByMe = item.senderId === currentUserId;
    const showAvatarAndName =
      !isSentByMe &&
      (index === 0 || messages[index - 1].senderId !== item.senderId);
    const addTopMargin =
      index === 0 || messages[index - 1].senderId !== item.senderId;

    return (
      <View
        className={`w-full flex-row ${isSentByMe ? "justify-end" : "justify-start"} ${addTopMargin ? "mt-3" : "mt-0.5"} px-3`}
      >
        {!isSentByMe && (
          <View className="w-8 mr-2 flex justify-end pb-1">
            {showAvatarAndName ? (
              <View
                className="w-7 h-7 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: getUserColor(item.user) }}
              >
                <Text className="text-white text-[11px] font-bold">
                  {item.user ? item.user.charAt(0).toUpperCase() : "?"}
                </Text>
              </View>
            ) : (
              <View className="w-7 h-7" />
            )}
          </View>
        )}
        <View
          className={`max-w-[78%] flex-col ${isSentByMe ? "items-end" : "items-start"}`}
        >
          {showAvatarAndName && (
            <Text className="text-muted text-[10px] font-semibold mb-1 ml-1 uppercase tracking-wide">
              {item.user || "Unknown"}
            </Text>
          )}

          <View
            className={`px-3.5 py-2 min-w-[72px] shadow-sm ${
              isSentByMe
                ? "bg-primary rounded-2xl rounded-br-sm shadow-primary/20"
                : "bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-gray-200"
            }`}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-48 h-48 rounded-lg"
              />
            ) : (
              <Text
                className={`text-[15px] leading-[21px] ${isSentByMe ? "text-white" : "text-secondary"} pb-3.5`}
              >
                {item.text}
              </Text>
            )}

            <View className="absolute bottom-1.5 right-2.5 flex-row items-center">
              <Text
                className={`text-[9px] font-medium ${isSentByMe ? "text-white/60" : "text-gray-400"}`}
              >
                {formatTime(item.createdAt)}
              </Text>
              {isSentByMe && (
                <View className="ml-1">
                  <Ionicons
                    name={
                      item.seenBy?.length > 1 ? "checkmark-done" : "checkmark"
                    }
                    size={13}
                    color={
                      item.seenBy?.length > 1
                        ? "#93C5FD"
                        : "rgba(255,255,255,0.55)"
                    }
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="py-4 px-1"
      onContentSizeChange={() => {
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }}
      onLayout={() => {
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }}
      ListFooterComponent={
        isTyping ? <TypingIndicator /> : <View className="h-2" />
      }
    />
  );
}
