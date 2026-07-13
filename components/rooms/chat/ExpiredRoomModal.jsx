import { Ionicons } from "@expo/vector-icons";
import { Animated, Modal, Text, View } from "react-native";
import CustomButton from "../../ui/CustomButton";
import GlassContainer from "../../ui/GlassContainer";

export default function ExpiredRoomModal({
  visible,
  opacity,
  isDark,
  onDismiss,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={{ flex: 1, opacity }}
        className="bg-black/60 items-center justify-center px-6"
      >
        <View className="w-full max-w-[340px] rounded-[32px] overflow-hidden">
          <GlassContainer
            intensity={isDark ? 30 : 60}
            tint={isDark ? "dark" : "light"}
            borderRadius={32}
            style={{ padding: 32, alignItems: "center" }}
            fallbackClassName="bg-white/90 dark:bg-[#1C1C20]/90"
          >
            <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6 border border-primary/20">
              <Ionicons name="time" size={40} color="#FF6B47" />
            </View>
            <Text className="text-secondary dark:text-white text-2xl font-display font-extrabold text-center mb-3">
              Room Expired
            </Text>
            <Text className="text-gray-500 dark:text-gray-300 text-sm text-center leading-6 mb-8 font-medium">
              This room&apos;s time is up. Its messages and content will be
              cleaned up automatically.
            </Text>
            <CustomButton title="Return to Home" onPress={onDismiss} />
          </GlassContainer>
        </View>
      </Animated.View>
    </Modal>
  );
}
