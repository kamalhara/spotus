import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function EmptyState({
  icon = "information-circle-outline",
  title,
  description,
  actionLabel,
  actionIcon = "arrow-forward",
  onAction,
  variant = "default",
}) {
  if (variant === "inline") {
    return (
      <View className="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-2xl px-4 py-3 flex-row items-center">
        <View className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center mr-3">
          <Ionicons name={icon} size={17} color="#9CA3AF" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
            {title}
          </Text>
          {description && (
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] mt-0.5">
              {description}
            </Text>
          )}
        </View>
        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction} activeOpacity={0.8} className="bg-primary/10 px-3 py-1.5 rounded-lg">
            <Text className="text-primary text-[12px] font-bold">{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="items-center justify-center px-8 py-12">
      <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-5">
        <Ionicons name={icon} size={32} color="#FF6B47" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-xl font-display font-extrabold tracking-tight text-center">
        {title}
      </Text>
      {description ? (
        <Text className="text-muted dark:text-gray-400 text-[15px] font-medium leading-6 text-center mt-2.5">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          className="mt-6 bg-primary px-5 py-3.5 rounded-full flex-row items-center"
        >
          <Text className="text-white text-[15px] font-bold mr-2">
            {actionLabel}
          </Text>
          <Ionicons name={actionIcon} size={16} color="white" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
