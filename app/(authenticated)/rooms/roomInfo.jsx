import { Ionicons } from"@expo/vector-icons";
import { useLocalSearchParams, useRouter } from"expo-router";
import {
 arrayRemove,
 collection,
 doc,
 getDoc,
 getDocs,
 updateDoc,
} from"firebase/firestore";
import { useEffect, useState } from"react";
import { Image, ScrollView, Text, TouchableOpacity, View } from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import RoomOptionsModal from"../../../components/rooms/roomOptionsModal";
import { db } from"../../../config/firebase.config";
import useFirestoreUser from"../../../hook/useFireStoreUser";

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

const roomRules = [
 {
 title:"Be respectful",
 description:"Constructive critique only. Keep it professional and kind.",
 icon:"chatbubble",
 },
 {
 title:"No Spam or Self-Promotion",
 description:"Share links only when they are relevant to the discussion.",
 icon:"remove-circle",
 },
 {
 title:"Share your work",
 description:
"We are here to learn. Don't be shy about posting work in progress.",
 icon:"color-palette",
 },
];
export default function RoomInfo() {
 const router = useRouter();
 const { roomId } = useLocalSearchParams();
 const { firestoreUser: user } = useFirestoreUser();
 const currentUserId = user?.id;

 const [room, setRoom] = useState(null);
 const [members, setMembers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isMembersExpanded, setIsMembersExpanded] = useState(false);
 const [showRoomTitle, setShowRoomTitle] = useState(false);
 const [showOptions, setShowOptions] = useState(false);

 const maxVisibleMembers = 3;
 const visibleMembers = isMembersExpanded
 ? members
 : members.slice(0, maxVisibleMembers);
 const hasMoreMembers = members.length > maxVisibleMembers;

 useEffect(() => {
 if (!roomId) return;
 const fetchRoomAndMembers = async () => {
 try {
 const snap = await getDoc(doc(db,"rooms", roomId));
 if (snap.exists()) {
 const roomData = { id: snap.id, ...snap.data() };
 setRoom(roomData);

 if (roomData.participants?.length) {
 const profiles = [];
 for (const uid of roomData.participants) {
 const userDoc = await getDoc(doc(db,"users", uid));
 if (userDoc.exists()) {
 profiles.push({ id: userDoc.id, ...userDoc.data() });
 }
 }
 const trustSnap = await getDocs(
 collection(db,"rooms", roomId,"trust"),
 );
 const trustMap = {};
 trustSnap.forEach((d) => {
 trustMap[d.id] = d.data().messagesCount || 0;
 });
 setMembers(
 profiles.map((p) => ({ ...p, trustScore: trustMap[p.id] || 0 })),
 );
 }
 }
 } catch (error) {
 console.error("Error fetching room info:", error);
 } finally {
 setLoading(false);
 }
 };
 fetchRoomAndMembers();
 }, [roomId]);

 const handleProfilePress = (id) => {
 if (id === currentUserId) {
 router.push("/profile");
 } else {
 router.push({
 pathname: `/users/${id}`,
 params: { roomId },
 });
 }
 };
 const handleLeaveRoom = async () => {
 if (!roomId || !currentUserId) return;

 try {
 const roomRef = doc(db,"rooms", roomId);

 await updateDoc(roomRef, {
 participants: arrayRemove(currentUserId),
 });

 setShowOptions(false);
 router.replace("/home");
 } catch (err) {
 console.error("Leave room error:", err);
 }
 };
 const categoryIcon = CATEGORY_ICONS[room?.category] ||"grid";

 return (
 <SafeAreaView className="flex-1 bg-bg dark:bg-[#0F0F13] px-5">
 <View className="flex-row justify-between items-center py-4">
 <TouchableOpacity
 onPress={() => router.back()}
 className="h-10 w-10 rounded-full bg-white dark:bg-[#1A1A22] items-center justify-center border border-gray-100 dark:border-[#2A2A36]"
 style={{
 shadowColor:"#94A3B8",
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.04,
 shadowRadius: 4,
 elevation: 1,
 }}
 >
 <Ionicons name="arrow-back"size={20} color="#18181B"className="dark:text-gray-100"/>
 </TouchableOpacity>
 <Text
 className="text-secondary dark:text-gray-100 text-xl font-bold"
 numberOfLines={1}
 style={{ maxWidth: 200 }}
 >
 {showRoomTitle ? room?.title :"Room Info"}
 </Text>
 <TouchableOpacity
 onPress={() => setShowOptions(true)}
 className="h-10 w-10 rounded-full items-center justify-center"
 >
 <Ionicons name="ellipsis-vertical"size={20} color="#18181B"className="dark:text-gray-100"/>
 </TouchableOpacity>
 </View>

 <ScrollView
 showsVerticalScrollIndicator={false}
 contentContainerStyle={{ paddingBottom: 40 }}
 onScroll={(e) => {
 const offsetY = e.nativeEvent.contentOffset.y;
 if (offsetY > 60 && !showRoomTitle) setShowRoomTitle(true);
 if (offsetY <= 60 && showRoomTitle) setShowRoomTitle(false);
 }}
 scrollEventThrottle={16}
 >
 {loading ? (
 <View className="py-8 items-center">
 <Text className="text-muted font-bold text-sm">Loading...</Text>
 </View>
 ) : (
 <>
 {/* Header section */}
 <View className="mb-6 mt-4">
 <View className="flex-row items-center justify-between mb-3">
 <View className="bg-surface-alt dark:bg-[#23232E] self-start px-3.5 py-2 rounded-xl flex-row items-center">
 <Ionicons
 name={categoryIcon}
 size={12}
 color="#4F46E5"
 style={{ marginRight: 6 }}
 />
 <Text className="text-primary font-black text-[10px] uppercase tracking-[1.5px]">
 {room?.category ||"Discovery Circle"}
 </Text>
 </View>
 <View className="flex-row items-center">
 <Ionicons name="location-sharp"size={12} color="#4F46E5"/>
 <Text className="text-primary font-black text-[10px]">
 {room?.location ||"0.4km away"}
 </Text>
 </View>
 </View>

 <Text className="text-secondary dark:text-gray-100 text-3xl font-black leading-tight tracking-tighter">
 {room?.title}
 </Text>
 </View>

 {/* Room Description */}
 <View className="mb-8 pb-8 border-b border-border-light dark:border-gray-800">
 <Text className="text-muted text-[10px] font-bold uppercase tracking-[2px] mb-2.5">
 Description
 </Text>
 <Text className="text-slate-500 leading-[22px] font-medium text-[14px]">
 {room?.description || `A local room for ${room?.category ||"nearby"} discussions and plans with members in your area.`}
 </Text>
 </View>

 {/* Members Section */}
 <View>
 <View className="flex-row justify-between items-center mb-5">
 <Text className="text-secondary dark:text-gray-100 text-xl font-black tracking-tight">
 Members
 </Text>
 <View className="bg-surface-alt dark:bg-[#23232E] px-3.5 py-1.5 rounded-xl">
 <Text className="text-muted font-black text-[10px] uppercase tracking-[1.5px]">
 {room?.participants?.length || 0} Total
 </Text>
 </View>
 </View>

 <View className="flex flex-col gap-3">
 {members && members.length > 0 ? (
 <>
 {visibleMembers.map((member) => (
 <TouchableOpacity
 activeOpacity={0.7}
 onPress={() => handleProfilePress(member.id)}
 key={member.id}
 className="flex-row items-center justify-between bg-white dark:bg-[#23232E] p-3.5 rounded-2xl border border-gray-50 dark:border-[#2A2A36]"
 style={{
 shadowColor:"#94A3B8",
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.04,
 shadowRadius: 4,
 elevation: 1,
 }}
 >
 <View className="flex-row items-center flex-1">
 <Image
 source={{
 uri:
 member.profilePic ||
"https://picsum.photos/200",
 }}
 className="w-11 h-11 rounded-xl mr-3.5 border-2 border-gray-50 dark:border-gray-700"
 />
 <View>
 <Text className="text-secondary dark:text-gray-100 font-black text-sm tracking-tight">
 {member.userName ||"Unknown Member"}
 </Text>
 <View className="flex-row items-center mt-2 gap-2">
 {member.trustScore > 0 && (
 <View className="bg-success/10 px-2.5 py-1 rounded-lg flex-row items-center">
 <Ionicons
 name="checkmark-circle"
 size={10}
 color="#10B981"
 />
 <Text className="text-success font-black text-[8px] uppercase tracking-widest ml-1">
 Trust{""}
 {Math.min(member.trustScore * 10, 100)}%
 </Text>
 </View>
 )}
 {member.id === room?.createdBy && (
 <View className="bg-warning/10 px-2.5 py-1 rounded-lg flex-row items-center">
 <Ionicons
 name="star"
 size={10}
 color="#F59E0B"
 />
 <Text className="text-warning font-black text-[8px] uppercase tracking-widest ml-1">
 Creator
 </Text>
 </View>
 )}
 </View>
 </View>
 </View>
 {member.id === currentUserId && (
 <View className="bg-primary/10 px-2.5 py-1.5 rounded-xl">
 <Text className="text-primary font-black text-[9px] uppercase tracking-widest">
 You
 </Text>
 </View>
 )}
 </TouchableOpacity>
 ))}
 {hasMoreMembers && (
 <TouchableOpacity
 onPress={() => setIsMembersExpanded(!isMembersExpanded)}
 className="flex-row items-center justify-center py-3 mt-2 bg-white dark:bg-[#23232E] rounded-2xl border border-gray-50 dark:border-[#2A2A36]"
 style={{
 shadowColor:"#94A3B8",
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.04,
 shadowRadius: 4,
 elevation: 1,
 }}
 >
 <Text className="text-primary font-bold text-sm mr-1">
 {isMembersExpanded
 ?"Show Less"
 : `Show ${members.length - maxVisibleMembers} More`}
 </Text>
 <Ionicons
 name={
 isMembersExpanded ?"chevron-up":"chevron-down"
 }
 size={16}
 color="#4F46E5"
 />
 </TouchableOpacity>
 )}
 </>
 ) : (
 <View className="py-8 items-center">
 <View className="w-14 h-14 bg-surface-alt dark:bg-[#23232E] rounded-2xl items-center justify-center mb-3">
 <Ionicons
 name="people-outline"
 size={24}
 color="#CBD5E1"
 />
 </View>
 <Text className="text-muted font-bold text-sm">
 No members found
 </Text>
 </View>
 )}
 </View>
 </View>
 </>
 )}

 {/* Room Rules Section */}
 <View className="bg-bg dark:bg-[#0F0F13] my-10 px-4">
 <Text className="text-secondary dark:text-gray-100 text-xl font-black tracking-tight mb-4">
 Room Rules
 </Text>

 <View
 className="bg-white dark:bg-[#1A1A22] rounded-3xl p-5 border border-gray-100 dark:border-[#2A2A36]"
 style={{
 shadowColor:"#94A3B8",
 shadowOffset: { width: 0, height: 4 },
 shadowOpacity: 0.05,
 shadowRadius: 12,
 elevation: 2,
 }}
 >
 {roomRules.map((rule, index) => (
 <View
 key={rule.title}
 className={`flex flex-row items-start ${index !== roomRules.length - 1 ?"mb-5 pb-5 border-b border-gray-50 dark:border-[#2A2A36]":""}`}
 >
 <View className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mr-4">
 <Ionicons name={rule.icon} size={20} color="#4B5563"/>
 </View>
 <View className="flex-1">
 <Text className="text-secondary dark:text-gray-100 font-bold text-base mb-1">
 {rule.title}
 </Text>
 <Text className="text-muted font-medium text-sm leading-5">
 {rule.description}
 </Text>
 </View>
 </View>
 ))}
 </View>
 </View>
 <TouchableOpacity
 onPress={handleLeaveRoom}
 activeOpacity={0.7}
 className="mx-6 mt-7 bg-red-50 dark:bg-red-900/20 py-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex-row items-center justify-center gap-2"
 >
 <Ionicons name="log-out-outline"size={18} color="#EF4444"/>
 <Text className="text-red-500 font-semibold text-[15px]">
 Leave Room
 </Text>
 </TouchableOpacity>
 </ScrollView>
 {showOptions && (
 <RoomOptionsModal
 showOptions={showOptions}
 setShowOptions={setShowOptions}
 />
 )}
 </SafeAreaView>
 );
}
