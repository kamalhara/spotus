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
  const [activeFilter] = useState("all");

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



  const unreadCount = chats.filter((chat) =>
    isChatUnseen(chat, currentUserId),
  ).length;

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

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
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
            className="flex-row items-center justify-between mt-3 mb-6"
            style={{ opacity: fadeIn }}
          >
            <View>
              <Text className="text-secondary dark:text-gray-100 text-[26px] font-display font-extrabold tracking-tight">
                Messages
              </Text>
              <Text className="text-muted dark:text-gray-500 text-[13px] font-semibold mt-1">
                {chats.length} DM{chats.length === 1 ? "" : "s"} ·{" "}
                {rooms.length}
                {""}
                room{rooms.length === 1 ? "" : "s"}
              </Text>
            </View>
          </Animated.View>

          {/* Search Bar */}
          <Animated.View
            style={{
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            }}
          >
            <GlassContainer
              borderRadius={30}
              isInteractive={true}
              fallbackClassName={`flex-row items-center bg-white dark:bg-[#1C1C20] px-4 py-3.5 mb-5 border ${
                searchFocused
                  ? "border-primary/40"
                  : "border-border-light dark:border-[#2C2C30]"
              }`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 20,
              }}
            >
              <Ionicons
                name="search"
                size={18}
                color={searchFocused ? "#FF6B47" : "#94A3B8"}
              />
              <TextInput
                placeholder="Search messages..."
                className="flex-1 ml-3 text-secondary dark:text-gray-100 text-[15px] font-medium"
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
            className="mb-5"
            style={{
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-secondary dark:text-gray-100 text-[17px] font-bold tracking-tight">
                Active Rooms
              </Text>
              {rooms.length > 0 && (
                <View className="ml-2 bg-primary-surface dark:bg-primary-surface px-2.5 py-1 rounded-full">
                  <Text className="text-primary text-[11px] font-display font-black">
                    {rooms.length}
                  </Text>
                </View>
              )}
            </View>
            {!roomsLoading && rooms.length === 0 ? (
              <View className="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-2xl px-4 py-3 flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-surface-alt items-center justify-center mr-3">
                  <Ionicons name="people-outline" size={17} color="#94A3B8" />
                </View>
                <Text className="text-gray-400 dark:text-gray-500 text-sm font-medium">
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
            {pendingReceivedChats.length > 0 && (
              <View className="mb-6">
                <Text className="text-secondary dark:text-gray-100 text-[17px] font-bold tracking-tight mb-4">
                  Message Requests
                </Text>
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

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-secondary dark:text-gray-100 text-[17px] font-bold tracking-tight">
                Recent
              </Text>
              {activeChats.length > 0 && (
                <Text className="text-muted dark:text-gray-500 text-[13px] font-medium">
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
                    title="No messages found"
                    description="Try a different name or clear the search field."
                  />
                }
              />
            ) : (
              <View className="flex-1 items-center justify-center pt-6">
                <View className="w-16 h-16 bg-white dark:bg-[#1C1C20] rounded-3xl items-center justify-center mb-5 border border-gray-100 dark:border-[#2C2C30]">
                  <Ionicons
                    name="chatbubble-outline"
                    size={30}
                    color="#FF6B47"
                  />
                </View>
                <Text className="text-secondary dark:text-gray-100 text-[17px] font-bold tracking-tight">
                  It&apos;s quiet in here...
                </Text>
                <Text className="text-muted text-sm mt-1.5 text-center px-10 leading-5">
                  Join a room and say hi to someone
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
