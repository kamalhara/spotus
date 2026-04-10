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
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="flex flex-col w-full">
      {label && (
        <Text className="uppercase text-sm tracking-widest text-gray-500 font-semibold mb-1">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-gray-200 rounded-lg px-3 py-4 border-2 ${
          error ? "border-red-500" : isFocused ? "border-primary" : "border-transparent"
        }`}
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
