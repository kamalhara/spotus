import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity } from "react-native";

export default function EmptyState({
  icon = "information-circle-outline",
  title,
  description,
  actionLabel,
  actionIcon = "arrow-forward",
  onAction,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 5,
      }),
    ]).start();
  }, [fadeAnim, iconScale]);

  return (
    <Animated.View
      className="items-center justify-center px-6 py-10"
      style={{ opacity: fadeAnim }}
    >
      <Animated.View
        className="w-16 h-16 rounded-2xl bg-surface-alt border border-border-light items-center justify-center mb-4"
        style={{ transform: [{ scale: iconScale }] }}
      >
        <Ionicons name={icon} size={28} color="#4F46E5" />
      </Animated.View>
      <Text className="text-secondary text-lg font-extrabold tracking-tight text-center">
        {title}
      </Text>
      {description ? (
        <Text className="text-gray-400 text-sm leading-5 text-center mt-2">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.75}
          className="mt-5 bg-primary px-4 py-3 rounded-2xl flex-row items-center"
        >
          <Text className="text-white text-sm font-bold mr-2">
            {actionLabel}
          </Text>
          <Ionicons name={actionIcon} size={16} color="white" />
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}
