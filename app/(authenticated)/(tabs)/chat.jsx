import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatRow from "../../../components/ChatList";
import RoomHorizontalItem from "../../../components/RoomHorizontalList";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";

export default function Chat() {
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch rooms user is in
  useEffect(() => {
    if (!currentUserId) return;
    const q = query(
      collection(db, "rooms"),
      where("participants", "array-contains", currentUserId),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUserId]);

  // Fetch DM chats & resolve other user's profile
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUserId),
    );

    const unsub = onSnapshot(q, async (snap) => {
      const chatDocs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const enriched = await Promise.all(
        chatDocs.map(async (chat) => {
          const otherUserId = chat.participants?.find(
            (id) => id !== currentUserId,
          );

          if (!otherUserId) return { ...chat, otherUser: null };

          const userSnap = await getDoc(doc(db, "users", otherUserId));

          return {
            ...chat,
            otherUser: userSnap.exists()
              ? { id: userSnap.id, ...userSnap.data() }
              : null,
          };
        }),
      );

      setChats(enriched);
    });

    return unsub;
  }, [currentUserId]);

  return (
    <SafeAreaView className="flex-1 bg-bg px-6" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-3 mb-6">
        <Text className="text-secondary text-[28px] font-extrabold tracking-tight">
          Messages
        </Text>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm shadow-gray-100">
          <Ionicons name="create-outline" size={20} color="#18181B" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 mb-6 shadow-sm shadow-gray-100">
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          placeholder="Search messages..."
          className="flex-1 ml-3 text-secondary text-[15px]"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Rooms horizontal scroll */}
      {rooms.length > 0 && (
        <View className="mb-6">
          <Text className="text-secondary text-base font-bold mb-4">
            Active Rooms
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {rooms.map((room) => (
              <RoomHorizontalItem
                key={room.id}
                room={room}
                onPress={() => router.push(`/rooms/${room.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Chat list */}
      <View className="flex-1 mt-2">
        <Text className="text-secondary text-base font-bold mb-3">Recent</Text>
        
        {chats.length > 0 ? (
          <FlatList
            data={chats.filter(c => c.otherUser?.userName?.toLowerCase().includes(search.toLowerCase()) || search === "")}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatRow
                chat={item}
                onPress={() =>
                  router.push({
                    pathname: `/dm/${item.otherUser?.id}`,
                    params: {
                      userName: item.otherUser?.userName,
                      profilePic: item.otherUser?.profilePic,
                    },
                  })
                }
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center pt-6">
            <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center mb-5 border border-gray-100 shadow-sm shadow-gray-200">
              <Ionicons name="chatbubble-outline" size={30} color="#4F46E5" />
            </View>
            <Text className="text-secondary text-[17px] font-bold tracking-tight">
              No conversations yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1.5 text-center px-10 leading-5">
              Build trust in rooms to unlock direct messages with other members.
            </Text>
            
            <View className="mt-6 bg-white rounded-2xl px-4 py-3.5 flex-row items-center border border-gray-100 shadow-sm shadow-gray-100">
              <View className="w-7 h-7 bg-indigo-50 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color="#4F46E5"
                />
              </View>
              <Text className="text-gray-500 text-[13px] font-medium flex-1">
                10 room messages = DM access
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
