import { Ionicons } from"@expo/vector-icons";
import { useRouter } from"expo-router";
import { Modal, Pressable, Text, TouchableOpacity, View } from"react-native";

export default function RoomOptionsModal({ showOptions, setShowOptions }) {
 const router = useRouter();

 const OPTIONS = [
 {
 label:"Report",
 onPress: () => {
 console.log("Report");
 setShowOptions(false);
 router.push("/feedback");
 },
 icon:"flag",
 color:"#EF4444",
 },
 {
 label:"Mute",
 onPress: () => {
 console.log("Mute");
 setShowOptions(false);
 },
 icon:"volume-mute",
 color:"#000000",
 },
 ];
 return (
 <Modal
 transparent
 visible={showOptions}
 animationType="fade"
 onRequestClose={() => setShowOptions(false)}
 >
 <Pressable
 className="flex-1 bg-black/30"
 onPress={() => setShowOptions(false)}
 >
 <View className="flex-1 justify-end pb-12 px-5">
 <Pressable>
 <View
 className="bg-white dark:bg-[#1A1A22] rounded-2xl overflow-hidden border border-border-light dark:border-[#2A2A36]"
 >
 {/* Options */}
 {OPTIONS.map((option, index) => (
 <TouchableOpacity
 key={option.label}
 onPress={() => {
 option.onPress();
 }}
 activeOpacity={0.6}
 className={`flex-row items-center px-5 py-3.5 ${
 index < OPTIONS.length - 1 ?"border-b border-gray-50 dark:border-[#2A2A36]":""
 }`}
 >
 <View
 className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
 style={{
 backgroundColor:
 option.color ==="#EF4444"?"rgba(239, 68, 68, 0.1)":"rgba(156, 163, 175, 0.1)",
 }}
 >
 <Ionicons
 name={option.icon}
 size={18}
 color={option.color}
 />
 </View>
 <Text
 className="text-[15px] font-semibold flex-1"
 style={{ color: option.color }}
 >
 {option.label}
 </Text>
 <Ionicons name="chevron-forward"size={16} color="#9CA3AF"/>
 </TouchableOpacity>
 ))}
 </View>

 {/* Cancel Button */}
 <TouchableOpacity
 onPress={() => setShowOptions(false)}
 activeOpacity={0.7}
 className="bg-white dark:bg-[#1A1A22] rounded-2xl mt-2 py-4 items-center border border-border-light dark:border-[#2A2A36]"
 >
 <Text className="text-secondary dark:text-gray-100 font-bold text-[15px]">Cancel</Text>
 </TouchableOpacity>
 </Pressable>
 </View>
 </Pressable>
 </Modal>
 );
}
