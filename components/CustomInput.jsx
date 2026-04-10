import { useState } from "react";
import { Text, TextInput, View } from "react-native";

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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="flex flex-col w-full">
      {label && (
        <Text
          className={`text-xs ml-1 tracking-wider text-gray-500 font-bold mb-2 ${className}`}
        >
          {label}
        </Text>
      )}
      <View
        className="flex-row items-center bg-white rounded-2xl px-4 py-4 border"
        style={{ borderColor: error ? "#ef4444" : isFocused ? "#4F46E5" : "#e5e7eb" }}
      >
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          className="flex-1 text-secondary text-base"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error ? (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
