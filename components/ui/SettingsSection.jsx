import { Text, View } from "react-native";

export default function SettingsSection({ title, children, className = "" }) {
  return (
    <View
      className={`bg-white dark:bg-[#1A1A22] rounded-2xl border border-gray-100 dark:border-[#2A2A36] overflow-hidden ${className}`}
    >
      {title ? (
        <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
