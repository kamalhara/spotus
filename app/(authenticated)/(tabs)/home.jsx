import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useFocusEffect, useRouter } from "expo-router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useCallback, useRef, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RoomCard from "../../../components/RoomCard";
import RoomJoinSheet from "../../../components/RoomJoinSheet";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";

export default function Home() {
  const [distance, setDistance] = useState(5);
  const router = useRouter();
  const { firestoreUser } = useFirestoreUser();

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

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
        const data = await getRooms();
        setRooms(data);
      };

      loadRooms();
    }, []),
  );

  return (
    <>
      <SafeAreaView className="bg-[#FAFAFA] h-screen px-6">
        <View className="flex flex-row justify-between items-center my-2">
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Image
              source={{
                uri: firestoreUser?.profilePic || "https://picsum.photos/200",
              }}
              className="w-11 h-11 rounded-full border border-gray-200"
            />
          </TouchableOpacity>
          <Text className="text-secondary tracking-tighter text-2xl font-black">
            Spot Us
          </Text>
          <TouchableOpacity className="w-11 h-11 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm shadow-slate-100">
            <Ionicons name="notifications-outline" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <View className="flex flex-row justify-between mt-5">
          <View className="flex flex-col">
            <Text className="text-primary text-lg font-semibold">
              Discovery
            </Text>
            <Text className="text-secondary text-2xl font-bold">
              Nearby Rooms
            </Text>
          </View>
          <View className="flex flex-col justify-end">
            <View>
              <Text className="text-gray-500 text-sm font-semibold ">
                Within {distance.toFixed(1)} miles
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 bg-white shadow-sm shadow-slate-200 rounded-3xl px-5 py-5 border border-slate-100">
          <Text className="text-gray-500 text-sm font-semibold mb-2 ml-1">
            Search Radius
          </Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={25}
            step={1}
            value={distance}
            onValueChange={setDistance}
            minimumTrackTintColor="#4F46E5"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#4F46E5"
          />
          <View className="flex flex-row justify-between">
            <Text className="text-gray-500 text-sm font-semibold ">1 mile</Text>
            <Text className="text-gray-500 text-sm font-semibold ">
              25 miles
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/rooms/create-rooms")}
          className="mt-10 bg-primary py-4 px-6 rounded-[20px] flex-row justify-center items-center shadow-lg shadow-indigo-200 active:opacity-90"
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">
            Create a Room
          </Text>
        </TouchableOpacity>

        <View className="mt-8">
          <View className="flex flex-row justify-between items-center ">
            <View>
              <Text className="text-primary text-lg font-semibold">Rooms</Text>
              <Text className="text-secondary text-2xl font-bold">
                Nearby Rooms
              </Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm font-semibold  ">
                {rooms?.length} Rooms
              </Text>
            </View>
          </View>
        </View>
        <FlatList
          data={rooms}
          renderItem={({ item }) =>
            !item.participants?.includes(firestoreUser?.id) && (
              <RoomCard
                room={item}
                onPress={() => handlePresentModalPress(item)}
              />
            )
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
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
