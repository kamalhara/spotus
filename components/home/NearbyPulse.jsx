import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export default function NearbyPulse({
  roomsCount = 0,
  peopleCount = 0,
  radius = 5,
}) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 2,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [pulseScale, pulseOpacity]);

  if (roomsCount === 0) return null;

  return (
    <View className="flex-row items-center py-2 px-1">
      <View className="relative w-3 h-3 mr-2.5 items-center justify-center">
        <Animated.View
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#22C55E",
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          }}
        />
        <View className="w-2 h-2 bg-green-500 rounded-full" />
      </View>
      <Text className="text-secondary dark:text-gray-200 text-[13px] font-medium">
        {peopleCount} chatting
      </Text>
      <Text className="text-gray-300 dark:text-gray-600 mx-1.5">·</Text>
      <Text className="text-gray-400 dark:text-gray-500 text-[13px] font-body">
        {roomsCount} {roomsCount === 1 ? "room" : "rooms"} within {radius}km
      </Text>
    </View>
  );
}
