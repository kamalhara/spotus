import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export default function NearbyPulse({
  roomsCount = 0,
  peopleCount = 0,
  radius = 5,
}) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(null);
  const isActive = roomsCount > 0;

  useEffect(() => {
    if (isActive) {
      // Start pulsing when rooms are nearby
      pulseAnim.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseScale, {
              toValue: 2.2,
              duration: 1400,
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
              duration: 1400,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.7,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      pulseAnim.current.start();
    } else {
      // Stop and reset when no rooms
      pulseAnim.current?.stop();
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
    }

    return () => pulseAnim.current?.stop();
  }, [isActive, pulseScale, pulseOpacity]);

  const dotColor = isActive ? "#22C55E" : "#9CA3AF";

  return (
    <View className="flex-row items-center py-2.5 px-1">
      <View className="relative w-3.5 h-3.5 mr-2.5 items-center justify-center">
        {isActive && (
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
        )}
        <View
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      </View>

      {isActive ? (
        <>
          <Text className="text-secondary dark:text-gray-200 text-[13px] font-semibold">
            {peopleCount} chatting
          </Text>
          <Text className="text-gray-300 dark:text-gray-600 mx-1.5">·</Text>
          <Text className="text-gray-400 dark:text-gray-500 text-[13px] font-body">
            {roomsCount} {roomsCount === 1 ? "room" : "rooms"} within {radius}km
          </Text>
        </>
      ) : (
        <Text className="text-muted text-[13px] font-body">
          All quiet within {radius}km
        </Text>
      )}
    </View>
  );
}
