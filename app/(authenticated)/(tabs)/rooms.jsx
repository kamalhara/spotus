import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, Text, View } from "react-native";
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
      data: myCreatedRooms,
      isEmpty: myCreatedRooms.length === 0,
      emptyText: "You haven't created any rooms yet.",
    },
    {
      title: "Joined",
      data: myJoinedRooms,
      isEmpty: myJoinedRooms.length === 0,
      emptyText: "You haven't joined any other rooms yet.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] px-6">
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
          <View className="bg-[#FAFAFA]">
            <View className="flex flex-row justify-between mt-5 mb-5">
              <View className="flex flex-col">
                <Text className="text-secondary text-2xl font-bold">
                  {section.title}
                </Text>
              </View>
            </View>
            {section.isEmpty && (
              <Text className="text-gray-500 mb-8 text-center font-medium">
                {section.emptyText}
              </Text>
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
