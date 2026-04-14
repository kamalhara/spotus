import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RoomCard from "../../../components/RoomCard";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";

function EmptySection({ text, icon, actionText, onAction }) {
  return (
    <View className="items-center justify-center py-12 px-4 mb-4">
      <View className="w-16 h-16 bg-surface-alt rounded-2xl items-center justify-center mb-4">
        <Ionicons name={icon} size={28} color="#CBD5E1" />
      </View>
      <Text className="text-muted text-sm font-semibold text-center mb-3">
        {text}
      </Text>
      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="bg-primary/10 px-5 py-2.5 rounded-xl"
        >
          <Text className="text-primary font-bold text-sm">{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

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
      data: myCreatedRooms,
      isEmpty: myCreatedRooms.length === 0,
      emptyText: "You haven't created any rooms yet.",
      emptyIcon: "add-circle-outline",
      emptyAction: "Create a Room",
      emptyOnAction: () => router.push("/rooms/create-rooms"),
    },
    {
      title: "Joined",
      data: myJoinedRooms,
      isEmpty: myJoinedRooms.length === 0,
      emptyText: "You haven't joined any rooms yet.",
      emptyIcon: "compass-outline",
      emptyAction: "Discover Rooms",
      emptyOnAction: () => router.push("/home"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg px-6">
      {/* Page Header */}
      <View className="flex-row items-center justify-between mt-2 mb-2">
        <View>
          <Text className="text-muted text-[10px] font-bold uppercase tracking-[2px]">
            Your Circles
          </Text>
          <Text className="text-secondary text-[28px] font-black tracking-tight mt-1">
            My Rooms
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/rooms/create-rooms")}
          className="w-12 h-12 bg-primary rounded-2xl items-center justify-center shadow-md shadow-indigo-200"
        >
          <Ionicons name="add" size={22} color="white" />
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
          <View className="bg-bg pt-6 pb-4">
            <View className="flex flex-row items-center gap-2.5">
              <Text className="text-secondary text-xl font-black tracking-tight">
                {section.title}
              </Text>
              <View className="bg-surface-alt px-2.5 py-1 rounded-lg">
                <Text className="text-muted text-[11px] font-black">
                  {section.data.length}
                </Text>
              </View>
            </View>
            {section.isEmpty && (
              <EmptySection
                text={section.emptyText}
                icon={section.emptyIcon}
                actionText={section.emptyAction}
                onAction={section.emptyOnAction}
              />
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
