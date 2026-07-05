import { Ionicons } from "@expo/vector-icons";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { forwardRef, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
    showPasswordToggle = false,
    ...props
  },
  ref,
) {
  const { isDark } = useTheme();
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const hasGlass =
    Platform.OS === "ios" && GlassView && isLiquidGlassAvailable();

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
      error ? "#EF4444" : isDark ? "#2A2A2E" : "#E2E2DE",
      error ? "#EF4444" : "#FF6B47",
    ],
  });

  return (
    <Animated.View
      className="flex flex-col w-full"
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      {label && (
        <Text
          className={`text-[13px] ml-0.5 text-muted font-semibold mb-2 ${className}`}
        >
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          {
            borderWidth: 1,
            borderColor: animatedBorderColor,
            borderRadius: 14,
          },
          containerStyle,
        ]}
      >
        {hasGlass ? (
          <GlassContainer
            borderRadius={13}
            isInteractive={true}
            fallbackClassName="bg-white dark:bg-[#1A1A1E]"
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 13,
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.03)"
                : "rgba(255, 255, 255, 0.4)",
            }}
          >
            {icon && (
              <View className="mr-2.5 w-5 items-center opacity-50">{icon}</View>
            )}
            <TextInput
              ref={ref}
              className="flex-1 text-secondary dark:text-gray-100 text-[15px] font-medium h-full"
              placeholder={placeholder}
              placeholderTextColor={isDark ? "#4B5563" : "#C0BDB8"}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={isSecure}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
            {showPasswordToggle && (
              <TouchableOpacity
                onPress={() => setIsSecure(!isSecure)}
              >
                <Ionicons
                  name={isSecure ? "eye-off" : "eye"}
                  size={20}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </TouchableOpacity>
            )}
          </GlassContainer>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 13,
              backgroundColor: isDark ? "#1A1A1E" : "#FEFEFE",
              borderRadius: 13,
            }}
          >
            {icon && (
              <View className="mr-2.5 w-5 items-center opacity-50">{icon}</View>
            )}
            <TextInput
              ref={ref}
              className="flex-1 text-secondary dark:text-gray-100 text-[15px] font-medium"
              placeholder={placeholder}
              placeholderTextColor={isDark ? "#4B5563" : "#C0BDB8"}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={isSecure}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
            {showPasswordToggle && (
              <TouchableOpacity
                onPress={() => setIsSecure(!isSecure)}
              >
                <Ionicons
                  name={isSecure ? "eye-off" : "eye"}
                  size={20}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
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
