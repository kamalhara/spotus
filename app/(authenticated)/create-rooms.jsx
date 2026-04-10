import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateRooms() {
  return (
    <SafeAreaView className="bg-bg h-screen px-4">
      <View>
        <View className="flex flex-row items-center gap-2">
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-secondary text-xl font-semibold">
            Create a Room
          </Text>
        </View>

        <View className="flex flex-col gap-2 mt-10">
          <Text className="text-secondary text-3xl font-bold">New Space</Text>
          <Text className="text-gray-500">
            Define the vibe and invite others to join your curated discovery
            circle
          </Text>
        </View>

        <View className="flex flex-col gap-2 mt-10">
          <Text className="text-secondary text-sm tracking-widest font-semibold">
            Room Title
          </Text>
          <TextInput
            placeholder="Name"
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
