import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Initialize and loop the dots animation for the typing indicator
  useEffect(() => {
    const createAnimation = (anim) => {
      return Animated.sequence([
        Animated.timing(anim, {
          toValue: -4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    };

    Animated.loop(
      Animated.stagger(150, [
        createAnimation(dot1),
        createAnimation(dot2),
        createAnimation(dot3),
      ]),
    ).start();
  }, [dot1, dot2, dot3]);

  return (
    <View className="w-full flex-row justify-start mt-1 px-3">
      <View className="w-8 mr-2 flex justify-end pb-5">
        <View className="w-7 h-7" />
      </View>
      <View className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-3 py-3.5 items-center justify-center flex-row mb-1">
        <Animated.View
          style={{ transform: [{ translateY: dot1 }] }}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full mx-[2px]"
        />
        <Animated.View
          style={{ transform: [{ translateY: dot2 }] }}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full mx-[2px]"
        />
        <Animated.View
          style={{ transform: [{ translateY: dot3 }] }}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full mx-[2px]"
        />
      </View>
    </View>
  );
}
