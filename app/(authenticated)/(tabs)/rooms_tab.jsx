import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RoomCard from "../../../components/rooms/RoomCard";
import RoomCardSkeleton from "../../../components/rooms/RoomCardSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";

export default function RoomsScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { firestoreUser } = useFirestoreUser();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadRooms = async () => {
        // Fetch new rooms silently on tab focus without showing skeleton loading effect
        const data = await getRooms(firestoreUser?.id);
        setRooms(data);
        setLoading(false);
      };

      if (firestoreUser?.id) {
        loadRooms();
      }
    }, [firestoreUser?.id]),
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
      count: loading ? 0 : myCreatedRooms.length,
      data: loading ? [1, 2] : myCreatedRooms,
      isEmpty: !loading && myCreatedRooms.length === 0,
      emptyIcon: "add-circle-outline",
      emptyText: "No rooms created yet",
      emptyAction: "Create room",
      emptyRoute: "/rooms/create-rooms",
    },
    {
      title: "Joined",
      count: loading ? 0 : myJoinedRooms.length,
      data: loading ? [1, 2, 3] : myJoinedRooms,
      isEmpty: !loading && myJoinedRooms.length === 0,
      emptyIcon: "compass-outline",
      emptyText: "No joined rooms yet",
      emptyAction: "Explore rooms",
      emptyRoute: "/home",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111112] px-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-3 mb-5">
        <Text className="text-secondary dark:text-gray-100 text-[24px] font-heading tracking-tight">
          My Rooms
        </Text>
        {/* Spacer — button is now the shared FloatingGlassButton */}
        <View style={{ width: 44 }} />
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
              currentUserId={firestoreUser?.id}
            />
          )
        }
        renderSectionHeader={({ section }) => (
          <View className="bg-bg dark:bg-[#111112] pt-5 pb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-secondary dark:text-gray-100 text-[17px] font-heading tracking-tight">
                {section.title}
              </Text>
              {section.count > 0 && (
                <Text className="text-muted text-[13px] font-medium">
                  {section.count}
                </Text>
              )}
            </View>
            {section.isEmpty && (
              <View className="mt-3">
                <EmptyState
                  variant="inline"
                  icon={section.emptyIcon}
                  title={section.emptyText}
                  description={
                    section.title === "Created by me"
                      ? "Name a topic, set a duration, and invite people nearby."
                      : "Browse nearby rooms from Home or enter an invite code."
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
