import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function TypingIndicator({ isDirectMessage }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const animateDot = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -5,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.delay(500 - delay),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, [dot1, dot2, dot3, fadeIn]);

  return (
    <Animated.View
      className="w-full flex-row justify-start mt-2 mb-2 px-3"
      style={{ opacity: fadeIn }}
    >
      {!isDirectMessage && (
        <View className="w-10 mr-2 flex justify-end pb-1">
          <View className="w-9 h-9" />
        </View>
      )}
      <View
        className="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-2xl rounded-bl-sm px-4 py-3 items-center justify-center flex-row"
        style={{
          shadowColor: "#94A3B8",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        <Animated.View
          style={{ transform: [{ translateY: dot1 }] }}
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-[3px]"
        />
        <Animated.View
          style={{ transform: [{ translateY: dot2 }] }}
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-[3px]"
        />
        <Animated.View
          style={{ transform: [{ translateY: dot3 }] }}
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-[3px]"
        />
      </View>
    </Animated.View>
  );
}
