import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg px-6">
      {/* Header */}
      <View className="mt-2 mb-6">
        <Text className="text-muted text-[10px] font-bold uppercase tracking-[2px]">
          Messages
        </Text>
        <Text className="text-secondary text-[28px] font-black tracking-tight mt-1">
          Direct Chats
        </Text>
      </View>

      {/* Empty State */}
      <Animated.View
        className="flex-1 items-center justify-center px-8"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="w-24 h-24 bg-surface-alt rounded-4xl items-center justify-center mb-6">
          <Ionicons name="chatbubbles-outline" size={44} color="#CBD5E1" />
        </View>
        <Text className="text-secondary text-xl font-black tracking-tight text-center mb-2.5">
          No conversations yet
        </Text>
        <Text className="text-muted text-sm font-medium text-center leading-[22px] px-4">
          Start building trust in rooms to unlock direct messaging with other
          members.
        </Text>

        <View className="mt-8 bg-white border border-border-light rounded-2xl px-5 py-4 flex-row items-center">
          <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-3.5">
            <Ionicons name="shield-checkmark" size={18} color="#4F46E5" />
          </View>
          <View className="flex-1">
            <Text className="text-secondary text-sm font-bold">
              Trust-based access
            </Text>
            <Text className="text-muted text-xs font-medium mt-0.5 leading-4">
              Send 10 messages in a room to unlock DMs with its members.
            </Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
