import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RoomCard from "../../../components/rooms/RoomCard";
import RoomCardSkeleton from "../../../components/rooms/RoomCardSkeleton";
import RoomJoinSheet from "../../../components/rooms/RoomJoinSheet";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

function EmptyRooms() {
  return (
    <View className="items-center justify-center py-16 px-6">
      <View className="w-20 h-20 bg-surface-alt rounded-3xl items-center justify-center mb-5">
        <Ionicons name="compass-outline" size={36} color="#CBD5E1" />
      </View>
      <Text className="text-secondary text-lg font-black tracking-tight text-center mb-2">
        No rooms nearby
      </Text>
      <Text className="text-muted text-sm font-medium text-center leading-5">
        Try expanding your search radius or create the first room in your area.
      </Text>
    </View>
  );
}

export default function Home() {
  const [distance, setDistance] = useState(5);
  const router = useRouter();
  const { firestoreUser } = useFirestoreUser();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Entrance animations
  const fadeInHeader = useRef(new Animated.Value(0)).current;
  const fadeInContent = useRef(new Animated.Value(0)).current;
  const slideUpContent = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeInHeader, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeInContent, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpContent, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeInHeader, fadeInContent, slideUpContent]);

  // Sheet Ref
  const bottomSheetModalRef = useRef(null);

  const handlePresentModalPress = useCallback((room) => {
    setSelectedRoom(room);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleJoinRoom = async () => {
    const roomRef = doc(db, "rooms", selectedRoom.id);
    await updateDoc(roomRef, {
      participants: arrayUnion(firestoreUser?.id),
    });
    bottomSheetModalRef.current?.dismiss();
    router.push(`/rooms/${selectedRoom.id}`);
  };

  useFocusEffect(
    useCallback(() => {
      const loadRooms = async () => {
        setLoading(true);
        const data = await getRooms();
        setRooms(data);
        setLoading(false);
      };

      loadRooms();
    }, []),
  );

  const nearbyRooms = rooms.filter(
    (r) => !r.participants?.includes(firestoreUser?.id),
  );

  const firstName = firestoreUser?.userName?.split(" ")[0] || "there";

  const handleCreateRoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/rooms/create-rooms");
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/profile");
  };

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <>
      <SafeAreaView className="bg-bg h-screen px-6">
        {/* Header */}
        <Animated.View
          className="flex flex-row justify-between items-center my-3"
          style={{ opacity: fadeInHeader }}
        >
          <TouchableOpacity
            onPress={handleProfilePress}
            className="flex-row items-center"
          >
            <Image
              source={{
                uri: firestoreUser?.profilePic || "https://picsum.photos/200",
              }}
              className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm shadow-slate-200"
            />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-secondary tracking-tighter text-[22px] font-black">
              Spot Us
            </Text>
            <View className="w-2 h-2 rounded-full bg-primary ml-1 -mt-2" />
          </View>
          <TouchableOpacity
            onPress={handleNotificationPress}
            className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-border-light shadow-sm shadow-gray-100"
          >
            <Ionicons name="notifications-outline" size={20} color="#18181B" />
          </TouchableOpacity>
        </Animated.View>

        {/* Greeting + Distance */}
        <Animated.View
          className="mt-5 mb-1"
          style={{
            opacity: fadeInContent,
            transform: [{ translateY: slideUpContent }],
          }}
        >
          <Text className="text-muted text-sm font-bold uppercase tracking-[1.5px]">
            {getGreeting()}
          </Text>
          <Text className="text-secondary text-[28px] font-black tracking-tight mt-1">
            {firstName} 👋
          </Text>
        </Animated.View>

        {/* Slider Card — elevated */}
        <Animated.View
          className="mt-6"
          style={{
            opacity: fadeInContent,
            transform: [{ translateY: slideUpContent }],
          }}
        >
          <View className="bg-white rounded-3xl px-5 py-5 border border-border-light shadow-sm shadow-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-7 h-7 bg-primary/10 rounded-lg items-center justify-center mr-2.5">
                  <Ionicons name="locate" size={14} color="#4F46E5" />
                </View>
                <Text className="text-secondary text-sm font-bold">
                  Search Radius
                </Text>
              </View>
              <View className="bg-primary px-3 py-1.5 rounded-xl">
                <Text className="text-white text-sm font-black">
                  {distance} mi
                </Text>
              </View>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={25}
              step={1}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor="#4F46E5"
              maximumTrackTintColor="#E2E8F0"
              thumbTintColor="#4F46E5"
            />
            <View className="flex flex-row justify-between mt-1">
              <Text className="text-muted text-xs font-semibold">1 mile</Text>
              <Text className="text-muted text-xs font-semibold">25 miles</Text>
            </View>
          </View>
        </Animated.View>

        {/* Create Room CTA */}
        <Animated.View
          className="mt-7"
          style={{
            opacity: fadeInContent,
            transform: [{ translateY: slideUpContent }],
          }}
        >
          <TouchableOpacity
            onPress={handleCreateRoom}
            activeOpacity={0.9}
            className="bg-primary py-5 px-6 rounded-3xl flex-row items-center"
          >
            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="add" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-lg tracking-tight">
                Create a Room
              </Text>
              <Text className="text-white/70 text-xs font-semibold mt-0.5">
                Start a room nearby
              </Text>
            </View>
            <View className="w-8 h-8 bg-white/15 rounded-xl items-center justify-center">
              <Ionicons
                name="chevron-forward"
                size={16}
                color="rgba(255,255,255,0.8)"
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Nearby Rooms Section */}
        <View className="mt-8 mb-2">
          <View className="flex flex-row justify-between items-center">
            <View className="flex-row items-center gap-2.5">
              <Text className="text-secondary text-xl font-black tracking-tight">
                Nearby Rooms
              </Text>
              {nearbyRooms.length > 0 && (
                <View className="bg-primary px-2.5 py-1 rounded-lg">
                  <Text className="text-white text-[11px] font-black">
                    {nearbyRooms.length}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <FlatList
          data={loading ? [1, 2, 3] : nearbyRooms}
          renderItem={({ item }) =>
            loading ? (
              <RoomCardSkeleton />
            ) : (
              <RoomCard
                room={item}
                onPress={() => handlePresentModalPress(item)}
              />
            )
          }
          keyExtractor={(item, index) => (loading ? `skel-${index}` : item.id)}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={loading ? null : <EmptyRooms />}
        />
      </SafeAreaView>

      <RoomJoinSheet
        ref={bottomSheetModalRef}
        room={selectedRoom}
        onConfirm={handleJoinRoom}
      />
    </>
  );
}
