import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-6">
      <View className="my-3">
        <Text className="text-secondary text-2xl font-bold">Messages</Text>
      </View>

      <View className="flex-1 items-center justify-center -mt-10">
        <Ionicons name="chatbubble-outline" size={44} color="#D1D5DB" />
        <Text className="text-secondary text-base font-semibold mt-4">
          No messages yet
        </Text>
        <Text className="text-gray-400 text-sm mt-1 text-center px-10 leading-5">
          Build trust in rooms to unlock direct messages with other members.
        </Text>

        {/* Small trust hint */}
        <View className="mt-6 bg-white rounded-2xl px-4 py-3.5 flex-row items-center border border-gray-100">
          <Ionicons name="shield-checkmark-outline" size={16} color="#4F46E5" />
          <Text className="text-gray-500 text-xs ml-2.5 flex-1">
            10 room messages = DM access
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
