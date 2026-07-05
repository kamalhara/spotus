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
      <View className="bg-surface-alt dark:bg-[#222226] rounded-xl px-4 py-3 flex-row items-center">
        <Ionicons
          name={icon}
          size={17}
          color="#9CA3AF"
          style={{ marginRight: 10 }}
        />
        <View className="flex-1">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {title}
          </Text>
          {description && (
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] mt-0.5">
              {description}
            </Text>
          )}
        </View>
        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction} activeOpacity={0.8}>
            <Text className="text-primary text-[13px] font-semibold">
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="items-center justify-center px-8 py-14">
      <View className="w-16 h-16 rounded-2xl items-center justify-center mb-5 border border-dashed border-gray-200 dark:border-gray-700">
        <Ionicons name={icon} size={26} color="#C0BDB8" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-lg font-heading tracking-tight text-center">
        {title}
      </Text>
      {description ? (
        <Text className="text-muted dark:text-gray-400 text-[14px] font-body leading-6 text-center mt-2 px-4">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          className="mt-5"
        >
          <View className="flex-row items-center">
            <Text className="text-primary text-[14px] font-semibold mr-1">
              {actionLabel}
            </Text>
            <Ionicons name={actionIcon} size={14} color="#FF6B47" />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
