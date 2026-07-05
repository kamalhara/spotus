import { Ionicons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useChatActions } from "../../hook/useChatActions";
import { toggleReaction } from "../../lib/reactions";
import ImageViewer from "../ui/ImageViewer";
import ReactionPicker from "./ReactionPicker";
import TypingIndicator from "./TypingIndicator";
import SpotUsLoader from "../../components/ui/SpotUsLoader";

const COLORS = [
  "#FF6B47",
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
  onReply,
  onEditMessage,
  isHost,
  onKickUser,
  onPinMessage,
  isTyping = false,
  onLoadMore,
  isLoadingMore = false,
}) {
  const flatListRef = useRef(null);
  const router = useRouter();
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(messages?.length ?? 0);
  const [reactionPicker, setReactionPicker] = useState(null);
  const [viewerImage, setViewerImage] = useState(null);
  const swipeableRefs = useRef({});
  const { onCopy, onDeleteForMe, onUnsend } = useChatActions(
    collectionName,
    chatDocId,
    currentUserId,
  );

  const handleMessageLongPress = (event, item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { pageX, pageY } = event.nativeEvent;
    const currentReaction = item.reactions?.[currentUserId] || null;

    setReactionPicker({
      messageId: item.id,
      message: { ...item, isSentByMe: item.senderId === currentUserId },
      x: pageX,
      y: pageY,
      currentReaction,
    });
  };

  const handleScrollToMessage = (messageId) => {
    const index = messages.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      try {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (error) {
        console.warn("Could not scroll to message:", error);
      }
    }
  };

  const scrollToEndIfNearBottom = useCallback((animated = true) => {
    if (!isNearBottomRef.current) return;
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const count = messages?.length ?? 0;
    if (count > prevMessageCountRef.current) {
      const lastMessage = messages[count - 1];
      if (lastMessage?.senderId === currentUserId) {
        isNearBottomRef.current = true;
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        scrollToEndIfNearBottom(true);
      }
    }
    prevMessageCountRef.current = count;
  }, [messages, currentUserId, scrollToEndIfNearBottom]);

  const renderLeftActions = useCallback((progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 40, 80],
      outputRange: [0, 0.8, 1],
      extrapolate: "clamp",
    });
    const opacity = dragX.interpolate({
      inputRange: [0, 30, 60],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: 60,
          transform: [{ scale }],
          opacity,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#EEF2FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-undo" size={18} color="#FF6B47" />
        </View>
      </Animated.View>
    );
  }, []);

  if (!messages || messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-10">
        <View className="w-16 h-16 bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-2xl items-center justify-center mb-4">
          <Ionicons name="chatbubble-outline" size={28} color="#FF6B47" />
        </View>
        <Text className="text-secondary dark:text-gray-100 text-base font-bold mt-1">
          No messages yet
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-1.5 leading-5">
          Send a message to start the chat.
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
        className={`flex-row items-center bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-full px-2 py-0.5 h-7 ${isSentByMe ? "mr-1" : "ml-1"}`}
        style={{
          zIndex: 20,
          marginTop: -8,
        }}
      >
        <Text className="text-[13px] leading-tight">
          {uniqueEmojis.slice(0, 3).join("")}
          {totalCount > 1 ? (
            <Text className="text-[10px] text-gray-500 font-bold ml-1">
              {""}
              {totalCount}
            </Text>
          ) : null}
        </Text>
      </View>
    );
  };

  const isDirectMessage = collectionName === "chats";

  const isEmojiOnly = (text) => {
    if (!text) return false;
    const noSpaces = text.replace(/\s+/g, "");
    if (noSpaces.length === 0 || noSpaces.length > 6) return false;
    const emojiRegex =
      /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}]+$/u;
    return emojiRegex.test(noSpaces);
  };

  const renderMessage = ({ item, index }) => {
    const isSentByMe = item.senderId === currentUserId;
    const prevItem = index > 0 ? messages[index - 1] : null;

    const showDateSeparator =
      !prevItem || !isSameDay(prevItem.createdAt, item.createdAt);

    const showAvatarAndName =
      !isDirectMessage &&
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
          <View className="items-center my-5 flex-row justify-center px-10">
            <View className="h-[1px] bg-gray-100 dark:bg-[#2C2C30] flex-1" />
            <View className="bg-surface-alt dark:bg-[#242428] border border-gray-100 dark:border-[#2C2C30] px-3 py-1 rounded-full mx-3">
              <Text className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {formatSeparatorDate(item.createdAt)}
              </Text>
            </View>
            <View className="h-[1px] bg-gray-100 dark:bg-[#2C2C30] flex-1" />
          </View>
        )}
        <View
          className={`w-full flex-row ${isSentByMe ? "justify-end" : "justify-start"} ${addTopMargin ? "mt-3" : "mt-2"} px-2`}
        >
          {!isSentByMe && !isDirectMessage && (
            <View className="w-10 mr-2 flex justify-end pb-1">
              {showAvatarAndName ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: `/users/${item.senderId}`,
                      params: { roomId: chatDocId },
                    });
                  }}
                >
                  {item.profilePic ? (
                    <Image
                      source={{ uri: item.profilePic }}
                      className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800"
                    />
                  ) : (
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{
                        backgroundColor: getUserColor(item.user),
                      }}
                    >
                      <Text className="text-white text-[13px] font-bold">
                        {item.user ? item.user.charAt(0).toUpperCase() : "?"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <View className="w-9 h-9" />
              )}
            </View>
          )}
          <View
            className={`max-w-[80%] flex-col ${isSentByMe ? "items-end" : "items-start"}`}
          >
            {showAvatarAndName && (
              <Text className="text-muted text-[10px] font-semibold mb-1 ml-1 uppercase tracking-wide">
                {item.user || "Unknown"}
              </Text>
            )}

            <Swipeable
              ref={(ref) => {
                if (ref) swipeableRefs.current[item.id] = ref;
              }}
              renderLeftActions={renderLeftActions}
              friction={2}
              leftThreshold={40}
              overshootLeft={false}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onReply?.(item);
                  swipeableRefs.current[item.id]?.close();
                }
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onLongPress={(event) => {
                  handleMessageLongPress(event, item);
                }}
                className={`min-w-[76px] ${item.imageUrl ? "" : "px-3.5 pt-2.5 pb-5"} ${
                  isSentByMe
                    ? item.imageUrl
                      ? "rounded-2xl rounded-br-md overflow-hidden"
                      : "bg-primary rounded-2xl rounded-br-md"
                    : "bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-2xl rounded-bl-sm"
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
                    : {}
                }
              >
                {/* Reply Preview */}
                {item.replyTo && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleScrollToMessage(item.replyTo.id)}
                    style={{
                      borderLeftWidth: 3,
                      borderLeftColor: isSentByMe
                        ? "rgba(255,255,255,0.4)"
                        : "#FF6B47",
                      backgroundColor: isSentByMe
                        ? "rgba(255,255,255,0.12)"
                        : "#F5F3FF",
                      borderRadius: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      marginBottom: 4,
                      marginTop: item.imageUrl ? 8 : 0,
                      marginHorizontal: item.imageUrl ? 8 : 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: isSentByMe ? "rgba(255,255,255,0.7)" : "#FF6B47",
                        marginBottom: 2,
                      }}
                    >
                      {item.replyTo.user || "Unknown"}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12,
                        color: isSentByMe
                          ? "rgba(255,255,255,0.55)"
                          : "#6B7280",
                      }}
                    >
                      {item.replyTo.imageUrl ? "📷 Photo" : item.replyTo.text}
                    </Text>
                  </TouchableOpacity>
                )}

                {item.imageUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setViewerImage({
                        uri: item.imageUrl,
                        sender: item.user || "Unknown",
                        timestamp: item.createdAt,
                      });
                    }}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      className={`w-56 h-56 ${
                        isSentByMe
                          ? "rounded-2xl rounded-br-sm"
                          : "rounded-2xl rounded-bl-sm"
                      }`}
                    />
                  </TouchableOpacity>
                ) : isEmojiOnly(item.text) ? (
                  <Text style={{ fontSize: 48, lineHeight: 56 }}>
                    {item.text}
                  </Text>
                ) : (
                  <Text
                    className={`text-[15px] leading-[21px] ${isSentByMe ? "text-white" : "text-secondary dark:text-gray-100"}`}
                  >
                    {item.text}
                  </Text>
                )}

                <View
                  className={`${
                    item.imageUrl
                      ? "absolute bottom-2 right-2 bg-black/30 px-2 py-0.5 rounded-full border border-white/10"
                      : isEmojiOnly(item.text)
                        ? "absolute bottom-1.5 right-2.5 bg-white/80 dark:bg-black/80 px-1.5 py-0.5 rounded-full"
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
                    {item.isEdited && <Text className="italic">Edited • </Text>}
                    {formatTime(item.createdAt)}
                  </Text>
                  {isSentByMe && (
                    <View className="ml-1">
                      <Ionicons
                        name={
                          item.seenBy?.length > 1
                            ? "checkmark-done"
                            : "checkmark"
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
              </TouchableOpacity>
              {/* Reaction pills — outside bubble to avoid overflow clipping */}
              {hasReactions && (
                <View
                  style={{
                    alignItems: isSentByMe ? "flex-end" : "flex-start",
                    marginTop: -2,
                  }}
                >
                  <ReactionDisplay
                    reactions={item.reactions}
                    isSentByMe={isSentByMe}
                  />
                </View>
              )}
            </Swipeable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={11}
        onRefresh={onLoadMore}
        refreshing={isLoadingMore}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.5,
            });
          });
        }}
        contentContainerClassName="py-4 px-1"
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } =
            e.nativeEvent;
          const distanceFromBottom =
            contentSize.height - layoutMeasurement.height - contentOffset.y;
          isNearBottomRef.current = distanceFromBottom < 120;
        }}
        scrollEventThrottle={16}
        onContentSizeChange={() => {
          scrollToEndIfNearBottom(true);
        }}
        onLayout={() => {
          scrollToEndIfNearBottom(false);
        }}
        ListFooterComponent={
          <View>
            {uploadingImageUri && (
              <View className="w-full flex-row justify-end mt-2 px-3 mb-2">
                <View className="max-w-[78%] items-end">
                  <View className="rounded-2xl rounded-br-md overflow-hidden border border-primary/20 bg-primary/10">
                    <View className="relative">
                      <Image
                        source={{ uri: uploadingImageUri }}
                        className="w-56 h-56 opacity-50"
                      />
                      <View className="absolute inset-0 items-center justify-center bg-black/10">
                        <View className="bg-white/90 dark:bg-[#1C1C20]/90 p-3 rounded-2xl items-center">
                          <SpotUsLoader size="small" />
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
            {isTyping ? (
              <TypingIndicator isDirectMessage={isDirectMessage} />
            ) : (
              <View className="h-2" />
            )}
          </View>
        }
      />
      <ReactionPicker
        isVisible={!!reactionPicker}
        onClose={() => setReactionPicker(null)}
        onSelect={(emoji) => {
          if (reactionPicker?.messageId) {
            const currentReaction = reactionPicker.currentReaction;
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
        message={reactionPicker?.message}
        onCopy={() => {
          onCopy(reactionPicker?.message);
          setReactionPicker(null);
        }}
        onEdit={() => {
          onEditMessage?.(reactionPicker?.message);
          setReactionPicker(null);
        }}
        onDeleteForMe={() => {
          onDeleteForMe(reactionPicker?.message);
          setReactionPicker(null);
        }}
        onUnsend={(message) => {
          onUnsend(message);
          setReactionPicker(null);
        }}
        isHost={isHost}
        onKick={(kickUserId) => {
          onKickUser?.(kickUserId);
          setReactionPicker(null);
        }}
        onPin={(message) => {
          onPinMessage?.(message);
          setReactionPicker(null);
        }}
      />
      <ImageViewer
        visible={!!viewerImage}
        imageUrl={viewerImage?.uri}
        senderName={viewerImage?.sender}
        timestamp={
          viewerImage?.timestamp
            ? (() => {
                const d = viewerImage.timestamp.toDate
                  ? viewerImage.timestamp.toDate()
                  : new Date(viewerImage.timestamp);
                return d.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });
              })()
            : undefined
        }
        onClose={() => setViewerImage(null)}
      />
    </View>
  );
}
