import { View } from"react-native";
import Skeleton from"../ui/Skeleton";

export default function ChatListSkeleton() {
 return (
 <View
 className="flex-row items-center px-4 py-3.5 border rounded-[24px] mb-4 bg-white dark:bg-[#1C1C20] border-border-light dark:border-[#2C2C30]"
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
 <Skeleton width="80%"height={16} borderRadius={8} />
 </View>
 </View>
 </View>
 );
}
