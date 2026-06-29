import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { getGlobalRooms } from "../../lib/getGlobalRooms";
import FallbackRoomCard from "./FallbackRoomCard";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function FallbackRoomsSection({ onRoomPress }) {
  const [globalRooms, setGlobalRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadRooms() {
      const rooms = await getGlobalRooms();
      if (mounted) {
        setGlobalRooms(rooms);
        setLoading(false);
      }
    }
    loadRooms();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View className="py-10 items-center justify-center">
        <ActivityIndicator size="small" color="#FF6B47" />
      </View>
    );
  }

  if (globalRooms.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn.duration(500)} className="mt-4 mb-10">
      <View className="mb-4">
        <Text className="text-secondary dark:text-gray-100 text-xl font-display font-extrabold tracking-tight mb-1">
          🌍 Popular Spaces
        </Text>
        <Text className="text-muted text-[13px] font-medium leading-5 pr-4">
          Your area is quiet right now. Explore these public spaces.
        </Text>
      </View>

      <View>
        {globalRooms.map((room, index) => (
          <Animated.View 
            key={room.id}
            entering={FadeInDown.delay(index * 100).duration(400).springify()}
          >
            <FallbackRoomCard room={room} onPress={onRoomPress} />
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}
