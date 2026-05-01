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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatRow from "../../../components/chat/ChatList";
import RoomHorizontalList from "../../../components/rooms/RoomHorizontalList";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";

export default function Chat() {
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
    });

    return unsub;
  }, [currentUserId]);

  return (
    <SafeAreaView className="flex-1 bg-bg px-6" edges={["top"]}>
      {/* Header */}
      <Animated.View
        className="flex-row items-center justify-between mt-3 mb-6"
        style={{ opacity: fadeIn }}
      >
        <Text className="text-secondary text-[28px] font-extrabold tracking-tight">
          Messages
        </Text>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm shadow-gray-100">
          <Ionicons name="create-outline" size={20} color="#18181B" />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar — with focus glow */}
      <Animated.View
        style={{
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        }}
      >
        <View
          className={`flex-row items-center bg-white rounded-2xl px-4 py-3 mb-6 ${
            searchFocused
              ? "border-primary/30 border-[1.5px]"
              : "border border-gray-100"
          }`}
          style={
            searchFocused
              ? {
                  shadowColor: "#4F46E5",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }
              : {
                  shadowColor: "#94A3B8",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }
          }
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
        className="mb-6"
        style={{
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        }}
      >
        <View className="flex-row items-center mb-4">
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
        <RoomHorizontalList
          rooms={rooms}
          onRoomPress={(room) => router.push(`/rooms/${room.id}`)}
        />
      </Animated.View>

      {/* Chat list */}
      <View className="flex-1 mt-2">
        <View className="flex-row items-center mb-3">
          <Text className="text-secondary text-base font-bold">Recent</Text>
          {chats.length > 0 && (
            <Text className="text-gray-300 text-xs font-semibold ml-2">
              {chats.length} conversations
            </Text>
          )}
        </View>

        {chats.length > 0 ? (
          <FlatList
            data={chats.filter(
              (c) =>
                c.otherUser?.userName
                  ?.toLowerCase()
                  .includes(search.toLowerCase()) || search === "",
            )}
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
