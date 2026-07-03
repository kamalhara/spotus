import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export default function NearbyPulse({
  roomsCount = 0,
  peopleCount = 0,
  radius = 5,
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [pulseAnim, opacityAnim]);

  if (roomsCount === 0) return null;

  return (
    <View className="flex-row items-center justify-between px-5 py-3 mx-5 mb-4 rounded-2xl bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] shadow-sm">
      <View className="flex-row items-center">
        <View className="relative w-3 h-3 mr-3 items-center justify-center">
          <View className="absolute w-full h-full bg-green-400 rounded-full" />
          <View className="w-2 h-2 bg-green-500 rounded-full" />
        </View>
        <View>
          <Text className="text-secondary dark:text-white font-display font-bold text-[14px]">
            {peopleCount} people chatting
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
            in {roomsCount} {roomsCount === 1 ? "room" : "rooms"} within{" "}
            {radius}km
          </Text>
        </View>
      </View>
      <View className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#252528] items-center justify-center">
        <Ionicons name="flash" size={14} color="#FF6B47" />
      </View>
    </View>
  );
}
