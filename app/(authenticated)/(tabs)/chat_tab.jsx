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
import { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatRow from "../../../components/chat/ChatList";
import ChatListSkeleton from "../../../components/chat/ChatListSkeleton";
import RoomHorizontalList from "../../../components/rooms/RoomHorizontalList";
import EmptyState from "../../../components/ui/EmptyState";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { isChatUnseen } from "../../../lib/chatSeen";

export default function Chat() {
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Entrance animation
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, slideUp]);

  // Fetch rooms user is in
  // Fetch all rooms where the current user is a participant
  useEffect(() => {
    if (!currentUserId) return;
    setRoomsLoading(true);
    const q = query(
      collection(db, "rooms"),
      where("participants", "array-contains", currentUserId),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setRoomsLoading(false);
    });
    return unsub;
  }, [currentUserId]);

  // Fetch DM chats & resolve other user's profile
  // Fetch direct message threads and enrich them with participant profile data
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
      setChatsLoading(false);
    });

    return unsub;
  }, [currentUserId]);

  const unreadCount = chats.filter((chat) =>
    isChatUnseen(chat, currentUserId),
  ).length;

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      search === "" ||
      chat.otherUser?.userName?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || isChatUnseen(chat, currentUserId);

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView className="flex-1 bg-bg px-6" edges={["top"]}>
      {/* Header */}
      <Animated.View
        className="flex-row items-center justify-between mt-3 mb-5"
        style={{ opacity: fadeIn }}
      >
        <View>
          <Text className="text-secondary text-[28px] font-extrabold tracking-tight">
            Messages
          </Text>
          <Text className="text-gray-400 text-xs font-semibold mt-0.5">
            {chats.length} DM{chats.length === 1 ? "" : "s"} · {rooms.length}{" "}
            room{rooms.length === 1 ? "" : "s"}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View className="bg-primary px-3 py-1.5 rounded-xl">
            <Text className="text-white text-xs font-bold">
              {unreadCount} new
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={{
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        }}
      >
        <View
          className={`flex-row items-center bg-white rounded-2xl px-4 py-3 mb-4 border ${
            searchFocused ? "border-primary/40" : "border-gray-100"
          }`}
        >
          <Ionicons
            name="search"
            size={18}
            color={searchFocused ? "#4F46E5" : "#9CA3AF"}
          />
          <TextInput
            placeholder="Search messages..."
            className="flex-1 ml-3 text-secondary text-[15px]"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>
      </Animated.View>

      {/* Rooms horizontal scroll */}
      <Animated.View
        className="mb-5"
        style={{
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-secondary text-base font-bold">
            Active Rooms
          </Text>
          {rooms.length > 0 && (
            <View className="ml-2 bg-primary px-2 py-0.5 rounded-md">
              <Text className="text-white text-[10px] font-bold">
                {rooms.length}
              </Text>
            </View>
          )}
        </View>
        {!roomsLoading && rooms.length === 0 ? (
          <View className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex-row items-center">
            <View className="w-9 h-9 rounded-xl bg-surface-alt items-center justify-center mr-3">
              <Ionicons name="people-outline" size={17} color="#94A3B8" />
            </View>
            <Text className="text-gray-400 text-sm font-medium">
              No active rooms
            </Text>
          </View>
        ) : (
          <RoomHorizontalList
            rooms={rooms}
            isLoading={roomsLoading}
            onRoomPress={(room) => router.push(`/rooms/${room.id}`)}
          />
        )}
      </Animated.View>

      {/* Chat list */}
      <View className="flex-1 mt-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-secondary text-base font-bold">Recent</Text>
          {chats.length > 0 && (
            <Text className="text-gray-300 text-xs font-semibold">
              {chats.length} conversations
            </Text>
          )}
        </View>

        {chatsLoading ? (
          <FlatList
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => `skel-${item}`}
            renderItem={() => <ChatListSkeleton />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : chats.length > 0 ? (
          <FlatList
            data={filteredChats}
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
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title="No messages found"
                description="Try a different name or clear the search field."
              />
            }
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
                <Ionicons name="shield-checkmark" size={14} color="#4F46E5" />
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
