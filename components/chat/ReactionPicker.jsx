import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

const REACTIONS = ["👍", "❤️", "😂", "😲", "😢", "🙏"];

export default function ReactionPicker({
  isVisible,
  onClose,
  onSelect,
  position,
  currentReaction,
  message,
  onCopy,
  onEdit,
  onDeleteForMe,
  onUnsend,
}) {
  if (!isVisible) return null;

  const isSentByMe = message?.isSentByMe;

  // Determine Unsend availability
  let canUnsend = false;
  if (isSentByMe && message?.createdAt) {
    const messageTime = message.createdAt.toMillis
      ? message.createdAt.toMillis()
      : new Date(message.createdAt).getTime();
    const now = Date.now();
    const diffSeconds = (now - messageTime) / 1000;

    const isSeen = message.seenBy?.length > 1; // Assuming seenBy includes sender
    const timeLimit = isSeen ? 30 : 5 * 60; // 30 seconds if seen, 5 mins if unseen

    if (diffSeconds < timeLimit) {
      canUnsend = true;
    }
  }

  const canEdit = canUnsend;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={onClose}>
        <View
          style={{
            position: "absolute",
            top: position?.y ? position.y - 60 : "40%",
            left: position?.x
              ? Math.max(10, Math.min(position.x - 100, 150))
              : "15%",
          }}
        >
          {/* Reaction Row */}
          <Animated.View
            entering={ZoomIn.duration(150)}
            className="flex-row bg-white/95 border border-gray-100 px-3 py-2 rounded-full shadow-2xl items-center"
            style={{ elevation: 10, shadowColor: "#000" }}
          >
            {REACTIONS.map((emoji) => (
              <Animated.View key={emoji} entering={ZoomIn.duration(150)}>
                <Pressable
                  className="px-2 items-center"
                  onPress={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                >
                  <Animated.Text className="text-2xl">{emoji}</Animated.Text>
                  {currentReaction === emoji && (
                    <View className="w-1 h-1 bg-primary rounded-full mt-0.5" />
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Options Menu */}
          <Animated.View
            entering={ZoomIn.duration(150).delay(50)}
            className="bg-white/95 border border-gray-100 rounded-2xl shadow-2xl mt-2 overflow-hidden"
            style={{ elevation: 10, shadowColor: "#000", minWidth: 160 }}
          >
            {message && !message.imageUrl && (
              <TouchableOpacity
                onPress={() => {
                  onCopy?.();
                  onClose();
                }}
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-3 border-b border-gray-50"
              >
                <Ionicons name="copy-outline" size={18} color="#4B5563" />
                <Text className="text-[15px] font-semibold ml-3 text-gray-700">
                  Copy
                </Text>
              </TouchableOpacity>
            )}

            {isSentByMe && !message.imageUrl && canEdit && (
              <TouchableOpacity
                onPress={() => {
                  onEdit?.();
                  onClose();
                }}
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-3 border-b border-gray-50"
              >
                <Ionicons name="pencil-outline" size={18} color="#2563EB" />
                <Text className="text-[15px] font-semibold ml-3 text-gray-700">
                  Edit
                </Text>
              </TouchableOpacity>
            )}

            {isSentByMe && canUnsend && (
              <TouchableOpacity
                onPress={() => {
                  onUnsend?.();
                  onClose();
                }}
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-3 border-b border-gray-50"
              >
                <Ionicons name="arrow-undo-outline" size={18} color="#EF4444" />
                <Text className="text-[15px] font-semibold ml-3 text-red-500">
                  Unsend
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                onDeleteForMe?.();
                onClose();
              }}
              activeOpacity={0.7}
              className="flex-row items-center px-4 py-3"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="text-[15px] font-semibold ml-3 text-red-500">
                Delete for me
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}
