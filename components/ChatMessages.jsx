import { Ionicons } from "@expo/vector-icons";

import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useTypingIndicator from "../hook/useTypingIndicator";
import { toggleReaction } from "../lib/reactions";
import ReactionPicker from "./ReactionPicker";
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

function isSameDay(t1, t2) {
  if (!t1 || !t2) return false;
  const d1 = t1.toDate ? t1.toDate() : new Date(t1);
  const d2 = t2.toDate ? t2.toDate() : new Date(t2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function formatSeparatorDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
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

export default function ChatMessages({
  messages,
  currentUserId,
  chatDocId,
  uploadingImageUri,
  collectionName = "chats",
}) {
  const flatListRef = useRef(null);
  const [reactionPicker, setReactionPicker] = useState(null);

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
        <View className="w-16 h-16 bg-primary/5 rounded-3xl items-center justify-center mb-4">
          <Ionicons name="chatbubble-outline" size={28} color="#818CF8" />
        </View>
        <Text className="text-secondary text-base font-semibold mt-1">
          Start the conversation
        </Text>
        <Text className="text-gray-400 text-sm text-center mt-1.5 leading-5">
          Be the first to say something.
        </Text>
      </View>
    );
  }

  const ReactionDisplay = ({ reactions, isSentByMe }) => {
    if (!reactions || Object.keys(reactions).length === 0) return null;

    const emojiCounts = {};
    Object.values(reactions).forEach((emoji) => {
      if (emoji) {
        emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
      }
    });

    const uniqueEmojis = Object.keys(emojiCounts);
    const totalCount = Object.values(emojiCounts).reduce((a, b) => a + b, 0);

    return (
      <View
        className={`absolute -bottom-5 ${isSentByMe ? "right-1" : "left-0"} flex-row items-center bg-white border border-gray-100 rounded-full px-2 py-0.5 h-7`}
        style={{
          elevation: 4,
          zIndex: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        }}
      >
        <Text className="text-[13px] leading-tight">
          {uniqueEmojis.slice(0, 3).join("")}
          {totalCount > 1 ? (
            <Text className="text-[10px] text-gray-500 font-bold ml-1">
              {" "}
              {totalCount}
            </Text>
          ) : null}
        </Text>
      </View>
    );
  };

  const renderMessage = ({ item, index }) => {
    const isSentByMe = item.senderId === currentUserId;
    const prevItem = index > 0 ? messages[index - 1] : null;

    const showDateSeparator =
      !prevItem || !isSameDay(prevItem.createdAt, item.createdAt);

    const showAvatarAndName =
      !isSentByMe &&
      (!prevItem || prevItem.senderId !== item.senderId || showDateSeparator);

    const addTopMargin =
      !prevItem || prevItem.senderId !== item.senderId || showDateSeparator;

    const hasReactions =
      item.reactions &&
      Object.values(item.reactions).filter((r) => !!r).length > 0;

    return (
      <View className="w-full">
        {showDateSeparator && (
          <View className="items-center my-6 flex-row justify-center px-10">
            <View className="h-[1px] bg-gray-100 flex-1" />
            <View className="bg-white border border-gray-200 px-4 py-1.5 rounded-full mx-4 shadow-sm shadow-gray-100">
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {formatSeparatorDate(item.createdAt)}
              </Text>
            </View>
            <View className="h-[1px] bg-gray-100 flex-1" />
          </View>
        )}
        <View
          className={`w-full flex-row ${isSentByMe ? "justify-end" : "justify-start"} ${addTopMargin ? "mt-3" : "mt-0.5"} ${hasReactions ? "mb-5" : ""} px-3`}
        >
          {!isSentByMe && (
            <View className="w-8 mr-2 flex justify-end pb-1">
              {showAvatarAndName ? (
                <View
                  className="w-7 h-7 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: getUserColor(item.user),
                    shadowColor: getUserColor(item.user),
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                  }}
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

            <TouchableOpacity
              activeOpacity={0.7}
              onLongPress={(event) => {
                const { pageX, pageY } = event.nativeEvent;
                const currentReaction = item.reactions?.[currentUserId] || null;
                setReactionPicker({
                  messageId: item.id,
                  x: pageX,
                  y: pageY,
                  currentReaction,
                });
              }}
              className={`min-w-[72px] ${
                item.imageUrl ? "" : "px-3.5 py-2"
              } ${
                isSentByMe
                  ? "rounded-2xl rounded-br-sm overflow-hidden"
                  : "bg-white border border-gray-100 rounded-2xl rounded-bl-sm"
              }`}
              style={
                !isSentByMe
                  ? {
                      shadowColor: "#94A3B8",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.06,
                      shadowRadius: 4,
                      elevation: 1,
                    }
                  : isSentByMe && !item.imageUrl
                    ? {
                        shadowColor: "#4F46E5",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 3,
                      }
                    : {}
              }
            >
              {/* Solid background for sent messages */}
              {isSentByMe && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "#4F46E5",
                    borderRadius: 16,
                    borderBottomRightRadius: 4,
                  }}
                />
              )}

              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  className={`w-56 h-56 ${
                    isSentByMe
                      ? "rounded-2xl rounded-br-sm"
                      : "rounded-2xl rounded-bl-sm"
                  }`}
                />
              ) : (
                <Text
                  className={`text-[15px] leading-[21px] ${isSentByMe ? "text-white" : "text-secondary"} pb-3.5`}
                >
                  {item.text}
                </Text>
              )}

              <View
                className={`${
                  item.imageUrl
                    ? "absolute bottom-2 right-2 bg-black/30 px-2 py-0.5 rounded-full border border-white/10"
                    : "absolute bottom-1.5 right-2.5"
                } flex-row items-center`}
              >
                <Text
                  className={`text-[9px] font-medium ${
                    item.imageUrl
                      ? "text-white"
                      : isSentByMe
                        ? "text-white/60"
                        : "text-gray-400"
                  }`}
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
                          : item.imageUrl
                            ? "rgba(255,255,255,0.8)"
                            : "rgba(255,255,255,0.55)"
                      }
                    />
                  </View>
                )}
              </View>
              <ReactionDisplay
                reactions={item.reactions}
                isSentByMe={isSentByMe}
              />
            </TouchableOpacity>
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
      initialNumToRender={10}
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
        <View>
          {uploadingImageUri && (
            <View className="w-full flex-row justify-end mt-2 px-3 mb-2">
              <View className="max-w-[78%] items-end">
                <View className="rounded-2xl rounded-br-sm overflow-hidden border border-primary/20 shadow-sm bg-primary/10">
                    <View className="relative">
                      <Image
                        source={{ uri: uploadingImageUri }}
                        className="w-56 h-56 opacity-50"
                      />
                      <View className="absolute inset-0 items-center justify-center bg-black/10">
                        <View className="bg-white/90 p-3 rounded-2xl items-center shadow-xl">
                          <ActivityIndicator color="#4F46E5" size="small" />
                          <Text className="text-[10px] font-bold text-primary mt-2 tracking-widest">
                            SENDING...
                          </Text>
                        </View>
                      </View>
                    </View>
                </View>
              </View>
            </View>
          )}
          {isTyping ? <TypingIndicator /> : <View className="h-2" />}
        </View>
      }
      ListHeaderComponent={
        <ReactionPicker
          isVisible={!!reactionPicker}
          onClose={() => setReactionPicker(null)}
          onSelect={(emoji) => {
            if (reactionPicker?.messageId) {
              const currentReaction = reactionPicker.currentReaction;

              // Toggle: if same emoji, remove it
              const newEmoji = currentReaction === emoji ? "" : emoji;

              toggleReaction(
                collectionName,
                chatDocId,
                reactionPicker.messageId,
                currentUserId,
                newEmoji,
              );
            }
          }}
          position={{ x: reactionPicker?.x, y: reactionPicker?.y }}
          currentReaction={reactionPicker?.currentReaction}
        />
      }
    />
  );
}
