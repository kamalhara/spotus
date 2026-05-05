import * as Haptics from "expo-haptics";
import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomButton({
  title,
  onPress,
  disabled,
  loading = false,
  type = "primary", // can be "primary", "outline", or "ghost"
  size = "md", // can be "sm", "md", "lg"
  className = "",
  icon,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!disabled && !loading) {
      if (type === "primary") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.();
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const getButtonStyles = () => {
    if (disabled || loading) {
      switch (type) {
        case "outline":
          return "bg-transparent border border-gray-100";
        case "ghost":
          return "bg-transparent";
        default:
          return "bg-muted/60";
      }
    }
    switch (type) {
      case "outline":
        return "bg-transparent border-[1.5px] border-primary/20";
      case "ghost":
        return "bg-transparent";
      default:
        return "bg-primary";
    }
  };

  const getTextStyles = () => {
    if (disabled || loading) {
      switch (type) {
        case "outline":
        case "ghost":
          return "text-muted";
        default:
          return "text-white/80";
      }
    }
    switch (type) {
      case "outline":
      case "ghost":
        return "text-primary";
      default:
        return "text-white";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-4 py-3 rounded-xl";
      case "lg":
        return "px-6 py-[20px] rounded-[20px]";
      default:
        return "px-5 py-[18px] rounded-[18px]";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-[16px]";
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.85}
        className={`w-full flex-row justify-center items-center ${getSizeStyles()} ${getButtonStyles()} ${className}`}
      >
        {loading ? (
          <ActivityIndicator
            color={type === "primary" ? "white" : "#4F46E5"}
            size="small"
          />
        ) : (
          <View className="flex-row items-center justify-center">
            {icon && <View className="mr-2.5">{icon}</View>}
            <Text
              className={`font-bold text-center tracking-tight ${getTextSize()} ${getTextStyles()}`}
            >
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
