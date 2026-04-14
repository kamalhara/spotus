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

const CATEGORY_DATA = [
  { label: "Music", icon: "musical-notes" },
  { label: "Coffee", icon: "cafe" },
  { label: "Art", icon: "color-palette" },
  { label: "Books", icon: "book" },
  { label: "Tech", icon: "code-slash" },
  { label: "Food", icon: "restaurant" },
  { label: "Fashion", icon: "shirt" },
  { label: "Sports", icon: "football" },
  { label: "Local Events", icon: "calendar" },
];

const MAX_TITLE_LENGTH = 60;

export default function CreateRooms() {
  const router = useRouter();

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
            <View className="flex flex-row items-center py-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-11 h-11 bg-white rounded-2xl items-center justify-center border border-border-light mr-3"
              >
                <Ionicons name="arrow-back" size={20} color="#18181B" />
              </TouchableOpacity>
              <Text className="text-secondary text-lg font-bold">Back</Text>
            </View>

            {/* Title Section */}
            <View className="flex flex-col gap-2 mt-6">
              <Text className="text-secondary text-[30px] font-black tracking-tight leading-[36px]">
                Create a Room
              </Text>
              <Text className="text-muted text-[15px] leading-[22px] font-medium">
                Define the vibe and invite others to join your curated discovery
                circle.
              </Text>
            </View>

            {/* Room Title Input */}
            <View className="flex flex-col gap-1.5 mt-8">
              <CustomInput
                label="Room Title"
                placeholder="e.g. Saturday coffee and vinyl"
                value={title}
                onChangeText={(text) => {
                  if (text.length <= MAX_TITLE_LENGTH) setTitle(text);
                }}
              />
              <Text className="text-muted text-xs font-semibold self-end mr-1 mt-1">
                {title.length}/{MAX_TITLE_LENGTH}
              </Text>
            </View>

            {/* Category Selection */}
            <View className="flex-1 mt-6">
              <Text className="text-muted text-[10px] tracking-[2px] font-bold uppercase ml-1 mb-4">
                Focus Category
              </Text>

              <View className="flex flex-row flex-wrap gap-3">
                {CATEGORY_DATA.map(({ label, icon }) => (
                  <TouchableOpacity
                    key={label}
                    onPress={() => setSelectedCategory(label)}
                    className={`px-4 py-2.5 rounded-xl border flex-row items-center gap-2 ${
                      selectedCategory === label
                        ? "bg-primary border-primary"
                        : "bg-white border-border"
                    }`}
                  >
                    {selectedCategory === label && (
                      <Ionicons name="checkmark-circle" size={14} color="white" />
                    )}
                    <Ionicons
                      name={icon}
                      size={14}
                      color={selectedCategory === label ? "white" : "#94A3B8"}
                    />
                    <Text
                      className={`font-bold text-sm ${
                        selectedCategory === label
                          ? "text-white"
                          : "text-secondary"
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Age Similarity Card */}
              <View className="mt-10">
                <View className="flex flex-row items-center gap-4 bg-white p-5 rounded-2xl border border-border-light">
                  <View className="bg-primary/10 p-3.5 rounded-2xl">
                    <Ionicons name="people-sharp" size={22} color="#4F46E5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-secondary text-[16px] font-bold">
                      Age Similarity
                    </Text>
                    <Text className="text-muted text-xs font-medium mt-0.5">
                      Show only to users of my age bracket
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#E2E8F0", true: "#4F46E5" }}
                    onValueChange={toggleSwitch}
                    ios_backgroundColor="#E2E8F0"
                    value={isEnabled}
                  />
                </View>
              </View>

              {/* Create Button */}
              <View className="flex-1 justify-end mt-12">
                <CustomButton
                  title="Create Room"
                  size="lg"
                  onPress={handleCreateRoom}
                  icon={<Ionicons name="rocket" size={20} color="white" />}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
