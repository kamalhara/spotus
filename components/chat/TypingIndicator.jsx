import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  // Initialize and loop the dots animation for the typing indicator
  useEffect(() => {
    // Fade in the indicator
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const createAnimation = (anim) => {
      return Animated.sequence([
        Animated.timing(anim, {
          toValue: -5,
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
  }, [dot1, dot2, dot3, fadeIn]);

  return (
    <Animated.View
      className="w-full flex-row justify-start mt-1 px-3"
      style={{ opacity: fadeIn }}
    >
      <View className="w-8 mr-2 flex justify-end pb-5">
        <View className="w-7 h-7" />
      </View>
      <View className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3.5 items-center justify-center flex-row mb-1 shadow-sm shadow-gray-100">
        <Animated.View
          style={{ transform: [{ translateY: dot1 }] }}
          className="w-2 h-2 bg-primary/40 rounded-full mx-[2.5px]"
        />
        <Animated.View
          style={{ transform: [{ translateY: dot2 }] }}
          className="w-2 h-2 bg-primary/60 rounded-full mx-[2.5px]"
        />
        <Animated.View
          style={{ transform: [{ translateY: dot3 }] }}
          className="w-2 h-2 bg-primary/80 rounded-full mx-[2.5px]"
        />
      </View>
    </Animated.View>
  );
}
