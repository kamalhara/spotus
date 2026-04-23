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

const CATEGORIES = [
  { label: "Music", icon: "musical-notes", color: "#8B5CF6" },
  { label: "Coffee", icon: "cafe", color: "#D97706" },
  { label: "Art", icon: "color-palette", color: "#EC4899" },
  { label: "Books", icon: "book", color: "#6366F1" },
  { label: "Tech", icon: "code-slash", color: "#3B82F6" },
  { label: "Food", icon: "restaurant", color: "#EF4444" },
  { label: "Fashion", icon: "shirt", color: "#F59E0B" },
  { label: "Sports", icon: "football", color: "#10B981" },
  { label: "Local Events", icon: "calendar", color: "#14B8A6" },
];

const MAX_TITLE = 60;

export default function CreateRooms() {
  const router = useRouter();
  const { firestoreUser: user } = useFirestoreUser();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const handleCreateRoom = async () => {
    if (!title || !selectedCategory) return alert("Please fill all the fields");
    if (!user) return alert("User not loaded");
    try {
      await createRoom(title, selectedCategory, isEnabled, user.id);
      router.push("/(tabs)/rooms_tab");
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-bg flex-1 px-5">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          >
            {/* Header */}
            <View className="flex-row items-center py-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-100 mr-3"
                style={{ shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
              >
                <Ionicons name="arrow-back" size={20} color="#18181B" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View className="mt-4 mb-8">
              <Text className="text-secondary text-[28px] font-extrabold tracking-tight leading-[34px]">
                Create a Room
              </Text>
              <Text className="text-gray-400 text-sm leading-5 mt-2">
                Define the vibe and invite others to your circle.
              </Text>
            </View>

            {/* Room Title Input */}
            <View className="mb-1">
              <CustomInput
                label="Room Title"
                placeholder="e.g. Saturday coffee and vinyl"
                value={title}
                onChangeText={(text) => {
                  if (text.length <= MAX_TITLE) setTitle(text);
                }}
              />
              <Text className="text-gray-300 text-xs self-end mt-1.5 mr-1">
                {title.length}/{MAX_TITLE}
              </Text>
            </View>

            {/* Categories — each with its own color */}
            <View className="mt-5">
              <Text className="text-gray-500 text-sm font-medium mb-3 ml-1">
                Category
              </Text>

              <View className="flex-row flex-wrap gap-2.5">
                {CATEGORIES.map(({ label, icon, color }) => {
                  const selected = selectedCategory === label;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => setSelectedCategory(label)}
                      className={`px-3.5 py-2.5 rounded-xl flex-row items-center gap-2 border ${
                        selected
                          ? "border-transparent"
                          : "bg-white border-gray-100"
                      }`}
                      style={selected ? { backgroundColor: `${color}15`, borderColor: `${color}30` } : {}}
                    >
                      <Ionicons
                        name={selected ? "checkmark" : icon}
                        size={14}
                        color={selected ? color : "#9CA3AF"}
                      />
                      <Text
                        className={`text-sm font-medium ${!selected ? "text-secondary" : ""}`}
                        style={selected ? { color } : {}}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Age Similarity */}
            <View className="mt-8">
              <View
                className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100"
                style={{ shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
              >
                <View className="bg-indigo-50 p-3 rounded-xl mr-3.5">
                  <Ionicons name="people-sharp" size={20} color="#4F46E5" />
                </View>
                <View className="flex-1">
                  <Text className="text-secondary text-[15px] font-semibold">
                    Age Similarity
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    Show only to my age bracket
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
                  onValueChange={() => setIsEnabled((p) => !p)}
                  ios_backgroundColor="#E5E7EB"
                  value={isEnabled}
                />
              </View>
            </View>

            {/* Create Button */}
            <View className="flex-1 justify-end mt-10">
              <CustomButton title="Create Room" onPress={handleCreateRoom} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
