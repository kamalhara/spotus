import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RoomCard from "../../../components/RoomCard";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";

export default function RoomsScreen() {
  const [rooms, setRooms] = useState([]);
  const { firestoreUser } = useFirestoreUser();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadRooms = async () => {
        const data = await getRooms();
        setRooms(data);
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
      title: "Created by me",
      count: myCreatedRooms.length,
      data: myCreatedRooms,
      isEmpty: myCreatedRooms.length === 0,
      emptyIcon: "add-circle-outline",
      emptyText: "You haven't created any rooms yet.",
    },
    {
      title: "Joined",
      count: myJoinedRooms.length,
      data: myJoinedRooms,
      isEmpty: myJoinedRooms.length === 0,
      emptyIcon: "compass-outline",
      emptyText: "You haven't joined any rooms.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg px-6">
      {/* Header */}
      <View className="flex-row items-center justify-between my-3">
        <Text className="text-secondary text-2xl font-extrabold tracking-tight">
          My Rooms
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/rooms/create-rooms")}
          className="w-10 h-10 bg-primary rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onPress={() => router.push(`/rooms/${item.id}`)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View className="bg-bg pt-5 pb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-secondary text-lg font-bold">
                {section.title}
              </Text>
              <View
                className={`px-2 py-0.5 rounded-md ${section.count > 0 ? "bg-primary" : "bg-gray-100"}`}
              >
                <Text
                  className={`text-xs font-semibold ${section.count > 0 ? "text-white" : "text-gray-400"}`}
                >
                  {section.count}
                </Text>
              </View>
            </View>
            {section.isEmpty && (
              <View className="items-center py-10">
                <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mb-3 border border-gray-100 shadow-sm shadow-gray-100">
                  <Ionicons name={section.emptyIcon} size={28} color="#D1D5DB" />
                </View>
                <Text className="text-gray-400 text-sm mt-1">
                  {section.emptyText}
                </Text>
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
