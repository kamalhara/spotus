import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { createRoom } from "../../../lib/createRoom";

export default function CreateRooms() {
  const router = useRouter();

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
  const { firestoreUser: user } = useFirestoreUser();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const handleCreateRoom = async () => {
    if (!title || !selectedCategory) return alert("Please fill all the fields");
    if (!user) return alert("User not loaded");
    try {
      await createRoom(title, selectedCategory, isEnabled, user.id);
      router.push("/(tabs)/rooms");
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-bg flex-1 px-4">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          >
            <View className="flex flex-row items-center gap-2 py-4">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text className="text-secondary text-xl font-semibold">Back</Text>
            </View>

            <View className="flex flex-col gap-2 mt-8">
              <Text className="text-secondary text-3xl font-bold">
                Create a Room
              </Text>
              <Text className="text-gray-500 leading-5">
                Define the vibe and invite others to join your curated discovery
                circle
              </Text>
            </View>

            <View className="flex flex-col gap-2 mt-8">
              <CustomInput
                label="Room Title"
                placeholder="e.g. Saturday coffee and vinyl"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="flex-1 mt-8">
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
                <View className="flex flex-row items-center gap-4 bg-white p-4 rounded-xl  shadow-sm shadow-slate-200">
                  <View className="bg-[#E2DFFF] p-3 rounded-full">
                    <Ionicons name="people-sharp" size={24} color="#4F46E5" />
                  </View>
                  <View className="flex-1">
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
                    ios_backgroundColor="#767577"
                    value={isEnabled}
                  />
                </View>
              </View>

              <View className="flex-1 justify-end mt-12">
                <CustomButton title="Create Room" onPress={handleCreateRoom} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
