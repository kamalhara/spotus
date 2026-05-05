import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

export default function SettingsSection({
  title,
  children,
  className = "",
  delay = 0,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        speed: 16,
        bounciness: 3,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {title ? (
        <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
          {title}
        </Text>
      ) : null}
      {children}
    </Animated.View>
  );
}
