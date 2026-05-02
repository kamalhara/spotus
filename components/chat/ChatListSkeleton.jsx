import { View } from "react-native";
import Skeleton from "../ui/Skeleton";

export default function ChatListSkeleton() {
  return (
    <View
      className="flex-row items-center p-4 border rounded-3xl mb-3 bg-white border-gray-100"
      style={{
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="relative">
        <Skeleton width={60} height={60} borderRadius={22} />
      </View>

      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <Skeleton width={120} height={20} borderRadius={10} />
          <Skeleton width={30} height={14} borderRadius={7} />
        </View>

        <View className="flex-row items-center">
          <Skeleton width="80%" height={16} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}
