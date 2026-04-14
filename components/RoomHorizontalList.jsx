import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

const CATEGORY_COLORS = {
  Music: "#8B5CF6",
  Coffee: "#D97706",
  Art: "#EC4899",
  Books: "#6366F1",
  Tech: "#3B82F6",
  Food: "#EF4444",
  Fashion: "#F59E0B",
  Sports: "#10B981",
  "Local Events": "#14B8A6",
};

export default function RoomHorizontalItem({ room, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const categoryColor = CATEGORY_COLORS[room?.category] || "#6B7280";

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="mr-4">
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className="items-center"
      >
        <View
          className="w-20 h-20 rounded-3xl items-center justify-center border border-white shadow-sm shadow-gray-200"
          style={{ backgroundColor: `${categoryColor}15` }}
        >
          <View
            className="w-16 h-16 rounded-[22px] items-center justify-center shadow-sm"
            style={{ backgroundColor: categoryColor, shadowColor: categoryColor }}
          >
            <Text className="text-white text-xl font-extrabold">
              {room?.title?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white items-center justify-center shadow-sm shadow-green-200" />
        </View>
        <Text
          className="text-secondary text-xs font-bold mt-2.5 text-center w-20 tracking-tight"
          numberOfLines={1}
        >
          {room?.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
