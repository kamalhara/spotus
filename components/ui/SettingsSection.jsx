import { Text, View } from "react-native";

export default function SettingsSection({ title, children, className = "" }) {
  return (
    <View
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}
    >
      {title ? (
        <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-5 pt-4 pb-2">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
