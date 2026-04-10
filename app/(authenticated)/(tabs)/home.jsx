import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [distance, setDistance] = useState(5);
  const router = useRouter();

  return (
    <SafeAreaView className="bg-bg h-screen px-4">
      <View className="flex flex-row justify-between items-center">
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-primary text-2xl font-bold">Spot Us</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-between mt-5">
        <View className="flex flex-col">
          <Text className="text-primary text-lg font-semibold">Discovery</Text>
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

      <View className="mt-4 bg-gray-100 rounded-lg px-2 py-4 border border-gray-200">
        <Text className="text-gray-500 text-sm font-semibold ">
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
          <Text className="text-gray-500 text-sm font-semibold ">25 miles</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/create-rooms")}
        className="mt-8 bg-primary py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md active:opacity-90"
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text className="text-white font-bold text-lg ml-2">Create a Room</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
