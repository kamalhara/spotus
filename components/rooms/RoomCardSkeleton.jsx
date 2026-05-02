import { View } from "react-native";
import Skeleton from "../ui/Skeleton";

export default function RoomCardSkeleton() {
  return (
    <View
      className="rounded-2xl p-5 mb-3 border bg-white border-gray-100 overflow-hidden"
      style={{
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Skeleton width={80} height={24} borderRadius={8} />
      </View>
      <View className="mb-1">
        <Skeleton width="70%" height={24} borderRadius={10} />
      </View>
      <View className="flex-row items-center mb-4 mt-2">
        <Skeleton width={80} height={16} borderRadius={8} />
      </View>

      <View className="flex-row justify-between items-center pt-3.5 border-t border-gray-50">
        <View className="flex-row items-center">
          <View className="flex-row -space-x-2 mr-2.5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white items-center justify-center bg-gray-100"
              />
            ))}
          </View>
          <Skeleton width={60} height={16} borderRadius={8} />
        </View>
        <Skeleton width={60} height={32} borderRadius={12} />
      </View>
    </View>
  );
}
