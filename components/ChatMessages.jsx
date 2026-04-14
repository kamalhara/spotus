import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, FlatList, Text, View } from "react-native";

function MessageBubble({ item, index, messages, currentUserId }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isSentByMe = item.senderId === currentUserId;

  const getUserColor = (username) => {
    if (!username) return "#94A3B8";
    const colors = [
      "#4F46E5",
      "#6366F1",
      "#EC4899",
      "#8B5CF6",
      "#10B981",
      "#F59E0B",
      "#3B82F6",
      "#14B8A6",
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Group messages by user if consecutive
  const showAvatarAndName =
    !isSentByMe &&
    (index === 0 || messages[index - 1].senderId !== item.senderId);
  const addTopMargin =
    index === 0 || messages[index - 1].senderId !== item.senderId;

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className={`w-full flex-row ${isSentByMe ? "justify-end" : "justify-start"} ${addTopMargin ? "mt-5" : "mt-1"} px-3`}
    >
      {!isSentByMe && (
        <View className="w-8 mr-2.5 flex justify-end pb-5">
          {showAvatarAndName ? (
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: getUserColor(item.user) }}
            >
              <Text className="text-white text-[12px] font-black">
                {item.user ? item.user.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          ) : (
            <View className="w-8 h-8" />
          )}
        </View>
      )}

      <View
        className={`max-w-[75%] flex-col ${isSentByMe ? "items-end" : "items-start"}`}
      >
        {showAvatarAndName && (
          <Text className="text-muted text-[10px] font-bold tracking-[1.5px] mb-1.5 ml-1 uppercase">
            {item.user || "Unknown"}
          </Text>
        )}

        <View
          className={`px-4 py-3 ${
            isSentByMe
              ? "bg-primary rounded-2xl rounded-br-md"
              : "bg-white border border-border-light rounded-2xl rounded-bl-md"
          }`}
        >
          <Text
            className={`text-[15px] leading-[22px] font-medium ${isSentByMe ? "text-white" : "text-secondary"}`}
          >
            {item.text}
          </Text>
        </View>

        <Text
          className={`text-muted/60 text-[9px] mt-1.5 font-bold uppercase tracking-widest ${isSentByMe ? "mr-1" : "ml-1"}`}
        >
          {formatTime(item.createdAt)}
        </Text>
      </View>
    </Animated.View>
  );
}

function EmptyChat() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      className="flex-1 items-center justify-center px-10"
      style={{ opacity: fadeAnim }}
    >
      <View className="w-20 h-20 bg-surface-alt rounded-3xl items-center justify-center mb-6">
        <Ionicons name="chatbubbles-outline" size={36} color="#CBD5E1" />
      </View>
      <Text className="text-secondary text-xl font-black tracking-tight text-center mb-2">
        Start the conversation
      </Text>
      <Text className="text-muted text-sm font-medium text-center leading-5">
        Be the first to say something in this circle. Break the ice!
      </Text>
    </Animated.View>
  );
}

export default function ChatMessages({ messages, currentUserId }) {
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!messages?.length) return;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return <EmptyChat />;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={({ item, index }) => (
        <MessageBubble
          item={item}
          index={index}
          messages={messages}
          currentUserId={currentUserId}
        />
      )}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 4 }}
      onContentSizeChange={() =>
        flatListRef.current?.scrollToEnd({ animated: true })
      }
    />
  );
}
