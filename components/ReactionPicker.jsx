import { Modal, Pressable, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

const REACTIONS = ["👍", "❤️", "😂", "😲", "😢", "🙏"];

export default function ReactionPicker({
  isVisible,
  onClose,
  onSelect,
  position,
  currentReaction,
}) {
  if (!isVisible) return null;

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
        </View>
      </Pressable>
    </Modal>
  );
}
