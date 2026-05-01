import { useRef } from "react";
import { Animated, Text, TextInput, View } from "react-native";

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  icon,
  error,
  className = "",
  ...props
}) {
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
    outputRange: [error ? "#EF4444" : "#E2E8F0", error ? "#EF4444" : "#4F46E5"],
  });

  const animatedBgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", "#FAFAFF"],
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
        className="flex-row items-center rounded-2xl px-4 py-[17px]"
        style={{
          borderWidth: 1.5,
          borderColor: animatedBorderColor,
          backgroundColor: animatedBgColor,
        }}
      >
        {icon && (
          <View className="mr-3 w-6 items-center">{icon}</View>
        )}
        <TextInput
          className="flex-1 text-secondary text-base font-medium"
          placeholder={placeholder}
          placeholderTextColor="#CBD5E1"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {error ? (
        <View className="flex-row items-center mt-2 ml-1">
          <View className="w-4 h-4 bg-danger/10 rounded-full items-center justify-center mr-1.5">
            <Text className="text-danger text-[9px] font-bold">!</Text>
          </View>
          <Text className="text-danger text-sm font-medium">
            {error}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
