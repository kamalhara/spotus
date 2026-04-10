import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Switch, Text, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";

export default function CreateRooms() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    "Music",
    "Coffee",
    "Art",
    "Books",
    "Tech",
    "Food",
    "Fashion",
    "Sports",
    "Local Events",
  ];

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-bg h-screen px-4">
      <View>
        <View className="flex flex-row items-center gap-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-secondary text-xl font-semibold">Back</Text>
        </View>

        <View className="flex flex-col gap-2 mt-10">
          <Text className="text-secondary text-3xl font-bold">
            Create a Room
          </Text>
          <Text className="text-gray-500">
            Define the vibe and invite others to join your curated discovery
            circle
          </Text>
        </View>

        <View className="flex flex-col gap-2 mt-10">
          <CustomInput
            label="Room Name"
            className="text-secondary"
            placeholder="e.g. Saturday coffee and vinyl"
          />
        </View>

        <View className="mt-10">
          <Text className="text-secondary text-sm tracking-widest font-semibold">
            Focus Category
          </Text>

          <View className="flex flex-row flex-wrap gap-3 mt-4">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === category
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mt-10">
            <View className="flex flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-slate-200 shadow-sm">
              <View className="bg-[#E2DFFF] p-2.5 rounded-full">
                <Ionicons name="people-sharp" size={28} color="#4F46E5" />
              </View>
              <View>
                <Text className="text-secondary text-lg font-semibold">
                  Age Similarity
                </Text>
                <Text className="text-gray-500 text-xs font-semibold">
                  Show only to users of my age bracket
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#4F46E5" }}
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
