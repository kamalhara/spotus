import { Ionicons } from"@expo/vector-icons";
import * as Haptics from"expo-haptics";
import { Text, TouchableOpacity, View } from"react-native";

export default function SettingsRow({
 icon,
 title,
 description,
 color ="#FF6B47",
 rightText,
 rightComponent,
 onPress,
 isLast = false,
}) {
 const RowComponent = onPress ? TouchableOpacity : View;

 return (
 <RowComponent
 onPress={() => {
 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
 onPress?.();
 }}
 activeOpacity={0.7}
 className={`px-5 py-4 flex-row items-center justify-between ${
 !isLast ?"border-b border-gray-50 dark:border-gray-800":""
 }`}
 >
 <View className="flex-row items-center flex-1">
 <View
 className="w-10 h-10 rounded-2xl items-center justify-center mr-3.5"
 style={{ backgroundColor: `${color}12` }}
 >
 <Ionicons name={icon} size={18} color={color} />
 </View>
 <View className="flex-1">
 <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold">{title}</Text>
 {description ? (
 <Text
 className="text-gray-400 dark:text-gray-500 text-xs leading-4 mt-0.5"
 numberOfLines={2}
 >
 {description}
 </Text>
 ) : null}
 </View>
 </View>

 {rightComponent ? (
 rightComponent
 ) : rightText ? (
 <Text className="text-gray-400 text-xs font-bold ml-3">
 {rightText}
 </Text>
 ) : onPress ? (
 <Ionicons name="chevron-forward"size={16} color="#CBD5E1"/>
 ) : null}
 </RowComponent>
 );
}
