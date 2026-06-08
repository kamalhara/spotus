import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function ScreenHeader({
  title,
  subtitle,
  rightIcon,
  rightLabel,
  onRightPress,
  showBack = true,
}) {
  const router = useRouter();
  const { isDark } = useTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="px-5 pt-2 pb-4">
      <View className="flex-row items-center justify-between min-h-[48px]">
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.75}
              className="w-11 h-11 rounded-full bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36] items-center justify-center mr-3"
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color={isDark ? "white" : "#18181B"}
              />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text
              className="text-secondary dark:text-gray-100 text-xl font-extrabold tracking-tight"
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                className="text-gray-400 dark:text-gray-500 text-xs font-medium mt-0.5"
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {rightIcon || rightLabel ? (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRightPress?.();
            }}
            activeOpacity={0.75}
            className="min-w-11 h-11 rounded-2xl bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36] items-center justify-center px-3"
          >
            {rightIcon ? (
              <Ionicons
                name={rightIcon}
                size={19}
                color={isDark ? "#818CF8" : "#4F46E5"}
              />
            ) : (
              <Text className="text-primary dark:text-primary-light text-sm font-bold">
                {rightLabel}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View className="w-11" />
        )}
      </View>
    </View>
  );
}
