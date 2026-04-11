import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function RoomCard({ room, onPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(room)}
      activeOpacity={0.8}
      className="bg-white rounded-2xl p-5 border border-gray-100 mt-4 shadow-sm shadow-slate-200"
    >
      <View className="flex flex-row justify-between items-center mb-3">
        <View className="bg-gray-100 px-3 py-1.5 rounded-full">
          <Text className="text-gray-600 font-bold tracking-wider uppercase text-[10px]">
            {room.category}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
      </View>

      <View className="mb-4">
        <Text className="text-secondary text-xl font-black tracking-tight mb-1">
          {room.title}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="flash" size={12} color="#4F46E5" />
          <Text className="text-gray-400 text-xs font-semibold ml-1">
            Active now in your area
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
        <View className="flex-row items-center">
          <View className="flex-row -space-x-2 mr-2">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 items-center justify-center"
              >
                <Ionicons name="person" size={10} color="white" />
              </View>
            ))}
          </View>
          <Text className="text-gray-500 font-bold text-[11px] uppercase tracking-tighter">
            {room.participants?.length || 1} members
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onPress?.(room)}
          className="bg-primary px-5 py-2 rounded-full flex-row items-center gap-1"
        >
          <Text className="text-white font-bold text-xs">Join</Text>
          <Ionicons name="arrow-forward" size={12} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
