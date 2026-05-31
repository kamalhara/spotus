import { View } from "react-native";
import Skeleton from "../ui/Skeleton";

export default function RoomCardSkeleton() {
  return (
    <View className="rounded-[24px] p-5 mb-4 border bg-white dark:bg-[#1A1A22] border-border-light dark:border-[#2A2A36] overflow-hidden">
      <View className="flex-row justify-between items-center mb-3">
        <Skeleton width={80} height={24} borderRadius={8} />
      </View>
      <View className="mb-1.5">
        <Skeleton width="75%" height={24} borderRadius={10} />
      </View>
      <View className="flex-row items-center mb-4 mt-2">
        <Skeleton width={80} height={16} borderRadius={8} />
      </View>

      <View className="flex-row justify-between items-center pt-4 border-t border-border-light dark:border-[#2A2A36]">
        <View className="flex-row items-center">
          <View className="flex-row -space-x-2 mr-3">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1A1A22] items-center justify-center bg-skeleton"
              />
            ))}
          </View>
          <Skeleton width={60} height={16} borderRadius={8} />
        </View>
        <Skeleton width={60} height={32} borderRadius={16} />
      </View>
    </View>
  );
}
