import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Animated, FlatList, Text, TouchableOpacity, View } from "react-native";
import useFirestoreUser from "../../hook/useFireStoreUser";
import { isRoomUnseen } from "../../lib/chatSeen";
import Skeleton from "../ui/Skeleton";

const CATEGORY_COLORS = {
  Music: "#8B5CF6",
  Coffee: "#D97706",
  Art: "#EC4899",
  Books: "#6366F1",
  Tech: "#3B82F6",
  Food: "#EF4444",
  Fashion: "#F59E0B",
  Sports: "#10B981",
  "Local Events": "#14B8A6",
};

/**
 * Individual room item for the horizontal scroll list.
 * Features a category-colored icon, dynamic scale animation, and an unread badge.
 */
export function RoomHorizontalItem({ room, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const categoryColor = CATEGORY_COLORS[room?.category] || "#6B7280";
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 100,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  // Correctly pass the room document object to check for unread state
  const roomUnseen = isRoomUnseen(room, currentUserId);

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }] }}
      className="mr-5"
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className="items-center"
      >
        <View
          className="w-[74px] h-[74px] rounded-[26px] items-center justify-center border border-white"
          style={{ backgroundColor: `${categoryColor}15` }}
        >
          <View
            className="w-[60px] h-[60px] rounded-[21px] items-center justify-center"
            style={{
              backgroundColor: categoryColor,
            }}
          >
            <Text className="text-white text-xl font-display font-extrabold">
              {room?.title?.charAt(0).toUpperCase()}
            </Text>
          </View>

          {roomUnseen && (
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-white items-center justify-center" />
          )}
        </View>

        <Text
          className={`text-[11px] font-bold mt-2.5 text-center w-20 tracking-tight ${
            roomUnseen ? "text-primary" : "text-secondary opacity-60"
          } dark:text-white`}
          numberOfLines={1}
        >
          {room?.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Reusable horizontal list for active rooms.
 * Handles scrolling logic and empty state gracefully.
 */
export default function RoomHorizontalList({ rooms, onRoomPress, isLoading }) {
  if (!isLoading && (!rooms || rooms.length === 0)) return null;

  if (isLoading) {
    return (
      <View className="flex-row px-1 py-1">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="mr-5 items-center">
            <Skeleton width={74} height={74} borderRadius={26} />
            <Skeleton
              width={60}
              height={12}
              borderRadius={6}
              style={{ marginTop: 10 }}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RoomHorizontalItem room={item} onPress={() => onRoomPress?.(item)} />
      )}
      contentContainerClassName="px-1 py-1"
    />
  );
}
