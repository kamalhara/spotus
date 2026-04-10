import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function RoomCard({ room }) {
  return (
    <View className="bg-white rounded-2xl p-5 border border-gray-100 mt-4 shadow-sm shadow-slate-200">
      <View className="flex flex-row justify-between items-center mb-3">
        <View className="bg-gray-100 px-3 py-1.5 rounded-full">
          <Text className="text-gray-600 font-bold tracking-wider uppercase text-[10px]">
            {room.category}
          </Text>
        </View>
        <View className="flex flex-row items-center bg-[#EEF2FF] px-2.5 py-1.5 rounded-full">
          <Ionicons name="location" size={12} color="#4F46E5" />
          <Text className="text-primary font-bold text-xs ml-1">
            0.5 miles away
          </Text>
        </View>
      </View>

      <Text className="font-bold text-xl text-secondary mb-1" numberOfLines={1}>
        {room.title}
      </Text>

      <View className="flex flex-row justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <View className="flex flex-row items-center">
          <View className="bg-gray-100 p-1.5 rounded-full">
            <Ionicons name="people" size={14} color="#6B7280" />
          </View>
          <Text className="text-gray-500 font-medium text-xs ml-2">
            {room.participants?.length || 1} members
          </Text>
        </View>
        <TouchableOpacity className="bg-primary px-5 py-2 rounded-full flex-row items-center gap-1">
          <Text className="text-white font-bold text-xs">Enter</Text>
          <Ionicons name="arrow-forward" size={12} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
