import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import GlassContainer from "./GlassContainer";
import SpotUsLoader from "./SpotUsLoader";

export default function CustomButton({
  title,
  onPress,
  disabled,
  loading = false,
  type = "primary", // "primary", "outline", or "ghost"
  size = "md", // "sm", "md", "lg"
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
      toValue: 0.95,
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
          return "bg-gray-200 dark:bg-gray-800";
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
          return "text-gray-400 dark:text-gray-500";
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
        return "px-6 py-[18px] rounded-2xl";
      default:
        return "px-5 py-[16px] rounded-2xl";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-[17px]";
      default:
        return "text-[15px]";
    }
  };

  const getShadowStyle = () => {
    if (disabled || loading || type !== "primary") return {};
    return {
      shadowColor: "#FF6B47",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 4,
    };
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <GlassContainer>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.85}
          className={`w-full flex-row justify-center items-center ${getSizeStyles()} ${getButtonStyles()} ${className}`}
          style={getShadowStyle()}
        >
          {loading ? (
            <SpotUsLoader
              size="medium"
              accessibilityLabel={`${title} in progress`}
            />
          ) : (
            <View className="flex-row items-center justify-center">
              {icon && <View className="mr-2.5">{icon}</View>}
              <Text
                className={`font-heading text-center tracking-tight ${getTextSize()} ${getTextStyles()}`}
              >
                {title}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </GlassContainer>
    </Animated.View>
  );
}
