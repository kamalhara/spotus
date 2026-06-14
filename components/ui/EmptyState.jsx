import { Ionicons } from"@expo/vector-icons";
import { Text, TouchableOpacity, View } from"react-native";

export default function EmptyState({
 icon ="information-circle-outline",
 title,
 description,
 actionLabel,
 actionIcon ="arrow-forward",
 onAction,
}) {
 return (
 <View className="items-center justify-center px-8 py-12">
 <View className="w-20 h-20 rounded-full bg-primary-surface dark:bg-primary-surface items-center justify-center mb-5">
 <Ionicons name={icon} size={32} color="#4F46E5"/>
 </View>
 <Text className="text-secondary dark:text-gray-100 text-xl font-display font-extrabold tracking-tight text-center">
 {title}
 </Text>
 {description ? (
 <Text className="text-muted dark:text-gray-400 text-[15px] font-medium leading-6 text-center mt-2.5">
 {description}
 </Text>
 ) : null}
 {actionLabel && onAction ? (
 <TouchableOpacity
 onPress={onAction}
 activeOpacity={0.8}
 className="mt-6 bg-primary px-5 py-3.5 rounded-full flex-row items-center"
 >
 <Text className="text-white text-[15px] font-bold mr-2">
 {actionLabel}
 </Text>
 <Ionicons name={actionIcon} size={16} color="white"/>
 </TouchableOpacity>
 ) : null}
 </View>
 );
}
