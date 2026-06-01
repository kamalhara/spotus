import { Ionicons } from"@expo/vector-icons";

import { useFocusEffect, useRouter } from"expo-router";
import { useCallback, useState } from"react";
import { SectionList, Text, TouchableOpacity, View } from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import RoomCard from"../../../components/rooms/RoomCard";
import RoomCardSkeleton from"../../../components/rooms/RoomCardSkeleton";
import EmptyState from"../../../components/ui/EmptyState";
import useFirestoreUser from"../../../hook/useFireStoreUser";
import { getRooms } from"../../../lib/getRoom";

export default function RoomsScreen() {
 const [rooms, setRooms] = useState([]);
 const [loading, setLoading] = useState(true);
 const { firestoreUser } = useFirestoreUser();
 const router = useRouter();

 useFocusEffect(
 useCallback(() => {
 const loadRooms = async () => {
 setLoading(true);
 const data = await getRooms();
 setRooms(data);
 setLoading(false);
 };
 loadRooms();
 }, []),
 );

 const myCreatedRooms = rooms.filter((r) => r.createdBy === firestoreUser?.id);
 const myJoinedRooms = rooms.filter(
 (r) =>
 r.participants?.includes(firestoreUser?.id) &&
 r.createdBy !== firestoreUser?.id,
 );

 const sections = [
 {
 title:"Created by me",
 count: loading ? 0 : myCreatedRooms.length,
 data: loading ? [1, 2] : myCreatedRooms,
 isEmpty: !loading && myCreatedRooms.length === 0,
 emptyIcon:"add-circle-outline",
 emptyText:"You haven't created any rooms yet.",
 emptyAction:"Create room",
 emptyRoute:"/rooms/create-rooms",
 },
 {
 title:"Joined",
 count: loading ? 0 : myJoinedRooms.length,
 data: loading ? [1, 2, 3] : myJoinedRooms,
 isEmpty: !loading && myJoinedRooms.length === 0,
 emptyIcon:"compass-outline",
 emptyText:"You haven't joined any rooms.",
 emptyAction:"Explore rooms",
 emptyRoute:"/home",
 },
 ];

 return (
 <SafeAreaView className="flex-1 bg-bg dark:bg-[#0F0F13] px-6">
 {/* Header */}
 <View className="flex-row items-center justify-between mt-3 mb-5">
 <Text className="text-secondary dark:text-gray-100 text-[26px] font-extrabold tracking-tight">
 My Rooms
 </Text>
 <TouchableOpacity
 onPress={() => router.push("/rooms/create-rooms")}
 className="w-10 h-10 bg-primary rounded-full items-center justify-center"
 >
 <Ionicons name="add"size={20} color="white"/>
 </TouchableOpacity>
 </View>

 <SectionList
 sections={sections}
 keyExtractor={(item, index) =>
 loading ? `skel-${item}-${index}` : item.id
 }
 renderItem={({ item }) =>
 loading ? (
 <RoomCardSkeleton />
 ) : (
 <RoomCard
 room={item}
 onPress={() => router.push(`/rooms/${item.id}`)}
 variant="joined"
 />
 )
 }
 renderSectionHeader={({ section }) => (
 <View className="bg-bg dark:bg-[#0F0F13] pt-6 pb-4">
 <View className="flex-row items-center gap-2">
 <Text className="text-secondary dark:text-gray-100 text-[18px] font-extrabold">
 {section.title}
 </Text>
 <View
 className={`px-2.5 py-1 rounded-full ${section.count > 0 ?"bg-primary-surface dark:bg-primary-surface":"bg-gray-100 dark:bg-gray-800"}`}
 >
 <Text
 className={`text-[12px] font-black ${section.count > 0 ?"text-primary":"text-gray-500 dark:text-gray-400"}`}
 >
 {section.count}
 </Text>
 </View>
 </View>
 {section.isEmpty && (
 <View className="bg-white dark:bg-[#1A1A22] rounded-2xl border border-gray-100 dark:border-[#2A2A36] mt-3">
 <EmptyState
 icon={section.emptyIcon}
 title={section.emptyText}
 description={
 section.title ==="Created by me"
 ?"Start a room around a topic people can join."
 :"Find active rooms from the Home tab."
 }
 actionLabel={section.emptyAction}
 onAction={() => router.push(section.emptyRoute)}
 />
 </View>
 )}
 </View>
 )}
 contentContainerStyle={{ paddingBottom: 100 }}
 showsVerticalScrollIndicator={false}
 stickySectionHeadersEnabled={false}
 />
 </SafeAreaView>
 );
}
