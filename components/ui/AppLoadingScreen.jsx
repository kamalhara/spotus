import { Text, View } from "react-native";
import SpotUsLoader from "./SpotUsLoader";

export default function AppLoadingScreen({
  message = "Opening SpotUs…",
  detail = "Connecting you to your community",
}) {
  return (
    <View
      className="flex-1 items-center justify-center bg-bg px-8 dark:bg-[#111113]"
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <View className="relative items-center justify-center">
        <View className="absolute h-36 w-36 rounded-full bg-primary/5 dark:bg-primary/10" />
        <View className="absolute h-28 w-28 rounded-full border border-primary/10 dark:border-primary/20" />
        <SpotUsLoader
          size="hero"
          accessibilityLabel={message}
        />
      </View>

      <Text className="mt-10 text-center font-display text-xl tracking-tight text-secondary dark:text-gray-100">
        {message}
      </Text>
      <Text className="mt-2 text-center font-body text-sm text-muted dark:text-gray-500">
        {detail}
      </Text>
    </View>
  );
}
