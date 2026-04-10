import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function CustomButton({
  title,
  onPress,
  disabled,
  loading = false,
  type = "primary", // can be "primary", "outline", or "ghost"
  className = "",
  icon,
}) {
  const getButtonStyles = () => {
    switch (type) {
      case "outline":
        return "bg-transparent border border-gray-200";
      case "ghost":
        return "bg-transparent";
      default:
        return "bg-primary shadow-md shadow-indigo-200";
    }
  };

  const getTextStyles = () => {
    switch (type) {
      case "outline":
      case "ghost":
        return "text-primary";
      default:
        return "text-white";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`px-10 py-4 rounded-2xl w-full flex-row justify-center items-center ${getButtonStyles()} ${
        disabled || loading ? "opacity-70" : "active:opacity-80"
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={type === "primary" ? "white" : "#4F46E5"} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-bold text-lg text-center ${getTextStyles()}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
