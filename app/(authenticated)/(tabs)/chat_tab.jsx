import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatRow from "../../../components/chat/ChatList";
import ChatListSkeleton from "../../../components/chat/ChatListSkeleton";
import RoomHorizontalList from "../../../components/rooms/RoomHorizontalList";
import EmptyState from "../../../components/ui/EmptyState";
import GlassContainer from "../../../components/ui/GlassContainer";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { isChatUnseen } from "../../../lib/chatSeen";
import { useChats } from "../../../context/ChatContext";

export default function Chat() {
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const { chats, loading: chatsLoading } = useChats();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const activeFilter = "all";

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
  useEffect(() => {
    if (!currentUserId) return;
    setRoomsLoading(true);
    const q = query(
      collection(db, "rooms"),
      where("participants", "array-contains", currentUserId),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const blocked = firestoreUser?.blockedUsers || [];
      setRooms(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((r) => !blocked.includes(r.createdBy)),
      );
      setRoomsLoading(false);
    });
    return unsub;
  }, [currentUserId, firestoreUser?.blockedUsers]);

  const activeChats = chats.filter(
    (c) =>
      c.status === "accepted" ||
      !c.status ||
      (c.status === "pending" && c.senderId === currentUserId),
  );

  const pendingReceivedChats = chats.filter(
    (c) => c.status === "pending" && c.senderId !== currentUserId,
  );

  const filteredChats = activeChats.filter((chat) => {
    const matchesSearch =
      search === "" ||
      chat.otherUser?.userName?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || isChatUnseen(chat, currentUserId);

    return matchesSearch && matchesFilter;
  });

  const filteredRooms = rooms.filter((room) => {
    return search === "" || room.title?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111112]" edges={["top"]}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setSearchFocused(false);
        }}
        accessible={false}
      >
        <View className="flex-1 px-6">
          {/* Header */}
          <Animated.View
            className="flex-row items-center justify-between mt-3 mb-5"
            style={{ opacity: fadeIn }}
          >
            <View>
              <Text className="text-secondary dark:text-gray-100 text-[24px] font-heading tracking-tight">
                Messages
              </Text>
              <Text className="text-muted dark:text-gray-500 text-[12px] font-body mt-0.5">
                {chats.length} DM{chats.length === 1 ? "" : "s"} ·{" "}
                {rooms.length}
                {""}
                room{rooms.length === 1 ? "" : "s"}
              </Text>
            </View>
          </Animated.View>

          {/* Search Bar — thinner */}
          <Animated.View
            style={{
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            }}
          >
            <GlassContainer
              borderRadius={14}
              isInteractive={true}
              fallbackClassName={`flex-row items-center bg-white dark:bg-[#1A1A1E] px-3.5 py-3 mb-4 border ${
                searchFocused
                  ? "border-primary/30"
                  : "border-border-light dark:border-[#2A2A2E]"
              }`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <Ionicons
                name="search"
                size={16}
                color={searchFocused ? "#FF6B47" : "#94A3B8"}
              />
              <TextInput
                placeholder="Search messages..."
                className="flex-1 ml-2.5 text-secondary dark:text-gray-100 text-[14px] font-medium"
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </GlassContainer>
          </Animated.View>

          {/* Rooms horizontal scroll */}
          <Animated.View
            className="mb-4"
            style={{
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-secondary dark:text-gray-100 text-[16px] font-heading tracking-tight">
                Active Rooms
              </Text>
              {rooms.length > 0 && (
                <Text className="text-muted text-[12px] font-medium">
                  {rooms.length}
                </Text>
              )}
            </View>
            {!roomsLoading && filteredRooms.length === 0 ? (
              <EmptyState 
                variant="inline"
                icon={search ? "search-outline" : "people-outline"}
                title={search ? "No rooms found" : "No active rooms"}
              />
            ) : (
              <RoomHorizontalList
                rooms={filteredRooms}
                isLoading={roomsLoading}
                onRoomPress={(room) => router.push(`/rooms/${room.id}`)}
              />
            )}
          </Animated.View>

          {/* Chat list */}
          <View className="flex-1 mt-1">
            {pendingReceivedChats.length > 0 && (
              <View className="mb-5">
                <View className="flex-row items-center mb-3">
                  <Text className="text-secondary dark:text-gray-100 text-[16px] font-heading tracking-tight">
                    Message Requests
                  </Text>
                  <View
                    className="ml-2 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                  >
                    <Text className="text-red-500 text-[11px] font-bold">
                      {pendingReceivedChats.length}
                    </Text>
                  </View>
                </View>
                {pendingReceivedChats.map((item) => (
                  <ChatRow
                    key={item.id}
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
                ))}
              </View>
            )}

            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-secondary dark:text-gray-100 text-[16px] font-heading tracking-tight">
                Recent
              </Text>
              {activeChats.length > 0 && (
                <Text className="text-muted dark:text-gray-500 text-[12px] font-body">
                  {activeChats.length} conversations
                </Text>
              )}
            </View>

            {chatsLoading ? (
              <FlatList
                data={[1, 2, 3, 4]}
                keyExtractor={(item) => `skel-${item}`}
                renderItem={() => <ChatListSkeleton />}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={() => {
                  Keyboard.dismiss();
                  setSearchFocused(false);
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            ) : activeChats.length > 0 ? (
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
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={() => {
                  Keyboard.dismiss();
                  setSearchFocused(false);
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                  <EmptyState
                    icon="search-outline"
                    title="No matches"
                    description="Try a different name or clear the search."
                  />
                }
              />
            ) : (
              <View className="flex-1 items-center justify-center pt-6">
                <EmptyState
                  icon="chatbubble-outline"
                  title="No conversations yet"
                  description="Join a room, find someone interesting, and start a conversation"
                />
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
