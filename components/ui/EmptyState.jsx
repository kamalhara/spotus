import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

export default function EmptyState({
  icon = "information-circle-outline",
  title,
  description,
  actionLabel,
  actionIcon = "arrow-forward",
  onAction,
  variant = "default",
  accentColor = "#FF6B47",
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant !== "default") return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim, variant]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  if (variant === "inline") {
    return (
      <View
        className="rounded-xl px-4 py-3.5 flex-row items-center overflow-hidden"
        style={{ backgroundColor: `${accentColor}08` }}
      >
        <View
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
          style={{ backgroundColor: accentColor, opacity: 0.4 }}
        />
        <View
          className="w-8 h-8 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Ionicons name={icon} size={16} color={accentColor} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
            {title}
          </Text>
          {description && (
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] mt-0.5 font-body">
              {description}
            </Text>
          )}
        </View>
        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction} activeOpacity={0.8}>
            <Text className="text-primary text-[13px] font-semibold">
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="items-center justify-center px-8 py-14">
      <Animated.View
        style={{ transform: [{ translateY }] }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-5"
          style={{
            backgroundColor: `${accentColor}12`,
          }}
        >
          <Ionicons name={icon} size={26} color={accentColor} style={{ opacity: 0.7 }} />
        </View>
      </Animated.View>
      <Text className="text-secondary dark:text-gray-100 text-lg font-heading tracking-tight text-center">
        {title}
      </Text>
      {description ? (
        <Text className="text-muted dark:text-gray-400 text-[14px] font-body leading-6 text-center mt-2 px-4">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          className="mt-5"
        >
          <View className="flex-row items-center">
            <Text className="text-primary text-[14px] font-semibold mr-1">
              {actionLabel}
            </Text>
            <Ionicons name={actionIcon} size={14} color="#FF6B47" />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
