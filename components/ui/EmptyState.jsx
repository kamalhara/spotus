import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function EmptyState({
  icon = "information-circle-outline",
  title,
  description,
  actionLabel,
  actionIcon = "arrow-forward",
  onAction,
}) {
  return (
    <View className="items-center justify-center px-6 py-10">
      <View className="w-16 h-16 rounded-2xl bg-surface-alt border border-border-light items-center justify-center mb-4">
        <Ionicons name={icon} size={28} color="#4F46E5" />
      </View>
      <Text className="text-secondary text-lg font-extrabold tracking-tight text-center">
        {title}
      </Text>
      {description ? (
        <Text className="text-gray-400 text-sm leading-5 text-center mt-2">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.75}
          className="mt-5 bg-primary px-4 py-3 rounded-2xl flex-row items-center"
        >
          <Text className="text-white text-sm font-bold mr-2">
            {actionLabel}
          </Text>
          <Ionicons name={actionIcon} size={16} color="white" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
