import { Ionicons } from"@expo/vector-icons";
import { useRef } from"react";
import { Animated, Text, TouchableOpacity, View } from"react-native";

const CATEGORY_ICONS = {
 Music:"musical-notes",
 Coffee:"cafe",
 Art:"color-palette",
 Books:"book",
 Tech:"code-slash",
 Food:"restaurant",
 Fashion:"shirt",
 Sports:"football",
"Local Events":"calendar",
};

const CATEGORY_COLORS = {
 Music:"#8B5CF6",
 Coffee:"#D97706",
 Art:"#EC4899",
 Books:"#6366F1",
 Tech:"#3B82F6",
 Food:"#EF4444",
 Fashion:"#F59E0B",
 Sports:"#10B981",
"Local Events":"#14B8A6",
};

const AVATAR_COLORS = [
"#6366F1",
"#EC4899",
"#10B981",
"#F59E0B",
"#3B82F6",
"#8B5CF6",
];

export default function RoomCard({
 room,
 onPress,
 variant ="discovery",
 currentUserId,
}) {
 const scaleAnim = useRef(new Animated.Value(1)).current;
 const isOwner = room.createdBy === currentUserId;
 const isDiscovery = variant ==="discovery";
 const categoryIcon = CATEGORY_ICONS[room.category] ||"grid";
 const categoryColor = CATEGORY_COLORS[room.category] ||"#6B7280";

 const buttonText = isDiscovery ?"Join":"Enter";

 const handlePressIn = () => {
 Animated.spring(scaleAnim, {
 toValue: 0.98,
 useNativeDriver: true,
 speed: 50,
 }).start();
 };

 const handlePressOut = () => {
 Animated.spring(scaleAnim, {
 toValue: 1,
 useNativeDriver: true,
 speed: 50,
 }).start();
 };

 return (
 <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
 <TouchableOpacity
 onPress={() => onPress?.(room)}
 onPressIn={handlePressIn}
 onPressOut={handlePressOut}
 activeOpacity={0.95}
 className={`rounded-[24px] p-5 mb-4 border overflow-hidden ${
 isDiscovery
 ?"bg-white dark:bg-[#1A1A22] border-border-light dark:border-[#2A2A36]"
 : isOwner
 ?"bg-primary-surface dark:bg-primary-surface border-primary/20"
 :"bg-white dark:bg-[#1A1A22] border-border-light dark:border-[#2A2A36]"
 }`}
 >
 {/* Category accent stripe */}
 <View
 className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
 style={{ backgroundColor: categoryColor }}
 />
 {/* Category — colored per type */}
 <View className="flex-row justify-between items-center mb-3">
 <View
 className="flex-row items-center px-3 py-1.5 rounded-lg"
 style={{ backgroundColor: `${categoryColor}10` }}
 >
 <Ionicons
 name={categoryIcon}
 size={11}
 color={categoryColor}
 style={{ marginRight: 5 }}
 />
 <Text
 className="font-semibold text-[11px]"
 style={{ color: categoryColor }}
 >
 {room.category}
 </Text>
 </View>
 </View>

 {/* Title */}
 <Text className="text-secondary dark:text-gray-100 text-[19px] font-extrabold tracking-tight mb-1.5 leading-6">
 {room.title}
 </Text>
 <View className="flex-row items-center mb-4">
 <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"/>
 <Text className="text-gray-400 text-xs">Active now</Text>
 </View>

 {/* Footer */}
 <View className="flex-row justify-between items-center pt-4 mt-1 border-t border-border-light dark:border-[#2A2A36]">
 <View className="flex-row items-center">
 <View className="flex-row -space-x-2 mr-3">
 {[0, 1, 2].map((i) => (
 <View
 key={i}
 className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1A1A22] items-center justify-center"
 style={{ backgroundColor: AVATAR_COLORS[i] }}
 >
 <Text className="text-white text-[9px] font-black">
 {String.fromCharCode(65 + i)}
 </Text>
 </View>
 ))}
 </View>
 <Text className="text-muted dark:text-gray-500 text-[13px] font-semibold">
 {room.participants?.length || 1}
 {room.participants?.length > 3 ?"+":""} members
 </Text>
 </View>
 <TouchableOpacity
 onPress={() => onPress?.(room)}
 className="bg-primary px-5 py-2.5 rounded-full"
 >
 <Text className="text-white font-bold text-[13px]">{buttonText}</Text>
 </TouchableOpacity>
 </View>
 </TouchableOpacity>
 </Animated.View>
 );
}
