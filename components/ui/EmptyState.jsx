import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function EmptyState({
  icon = "information-circle-outline",
  title,
  description,
  eyebrow,
  actionLabel,
  actionIcon = "arrow-forward",
  onAction,
  variant = "default",
  accentColor = "#FF6B47",
}) {
  if (variant === "inline") {
    return (
      <View className="border-t border-border dark:border-[#2A2A2E] py-4 flex-row items-start">
        <View
          className="w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5"
          style={{ backgroundColor: `${accentColor}12` }}
        >
          <Ionicons name={icon} size={14} color={accentColor} />
        </View>
        <View className="flex-1">
          <Text className="text-secondary dark:text-gray-100 text-[14px] font-semibold">
            {title}
          </Text>
          {description && (
            <Text className="text-muted dark:text-gray-400 text-[12px] leading-[18px] mt-1 font-body pr-2">
              {description}
            </Text>
          )}
        </View>
        {actionLabel && onAction && (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.75}
            className="flex-row items-center ml-2 pt-1"
          >
            <Text className="text-primary text-[12px] font-semibold mr-1">
              {actionLabel}
            </Text>
            <Ionicons name={actionIcon} size={12} color={accentColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="items-start justify-center px-2 py-12">
      <View className="flex-row items-center mb-4">
        <View
          className="w-7 h-7 rounded-full items-center justify-center mr-2.5"
          style={{ backgroundColor: `${accentColor}12` }}
        >
          <Ionicons name={icon} size={14} color={accentColor} />
        </View>
        <Text className="text-muted dark:text-gray-400 text-[11px] font-semibold tracking-[1.4px] uppercase">
          {eyebrow || "Nothing here yet"}
        </Text>
      </View>
      <Text className="text-secondary dark:text-gray-100 text-[23px] leading-7 font-display tracking-tight max-w-[320px]">
        {title}
      </Text>
      {description ? (
        <Text className="text-muted dark:text-gray-400 text-[14px] font-body leading-6 mt-2 max-w-[330px]">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          className="mt-6 bg-primary h-11 px-4 rounded-full flex-row items-center justify-center"
        >
          <View className="flex-row items-center">
            <Text className="text-white text-[14px] font-semibold mr-2">
              {actionLabel}
            </Text>
            <Ionicons name={actionIcon} size={14} color="white" />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
