import { forwardRef, useRef } from "react";
import { Animated, Text, TextInput, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import GlassContainer from "./GlassContainer";

const CustomInput = forwardRef(function CustomInput(
  {
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    icon,
    error,
    className = "",
    containerStyle,
    ...props
  },
  ref,
) {
  const { isDark } = useTheme();
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.01,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  const handleBlur = () => {
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? "#EF4444" : isDark ? "#2A2A36" : "#E2E8F0",
      error ? "#EF4444" : "#4F46E5",
    ],
  });

  return (
    <Animated.View
      className="flex flex-col w-full"
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      {label && (
        <Text
          className={`text-[11px] ml-1 tracking-[1.5px] text-muted font-bold mb-2.5 uppercase ${className}`}
        >
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          {
            borderWidth: 1.5,
            borderColor: animatedBorderColor,
            borderRadius: 30,
          },
          containerStyle,
        ]}
      >
        <GlassContainer
          borderRadius={28}
          isInteractive={true}
          fallbackClassName="bg-white dark:bg-[#1A1A22]"
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.03)"
              : "rgba(255, 255, 255, 0.4)",
          }}
        >
          {icon && <View className="mr-3 w-6 items-center">{icon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 text-secondary dark:text-gray-100 text-base font-medium h-full"
            placeholder={placeholder}
            placeholderTextColor={isDark ? "#4B5563" : "#CBD5E1"}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </GlassContainer>
      </Animated.View>
      {error ? (
        <View className="flex-row items-center mt-2 ml-1">
          <View className="w-4 h-4 bg-danger/10 rounded-full items-center justify-center mr-1.5">
            <Text className="text-danger text-[9px] font-bold">!</Text>
          </View>
          <Text className="text-danger text-sm font-medium">{error}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
});

export default CustomInput;
