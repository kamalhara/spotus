import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatId() {
  const { chatId, userName, profilePic } = useLocalSearchParams();

  return (
    <SafeAreaView>
      <View className="flex-row items-center">
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Image
            source={{ uri: profilePic || "https://picsum.photos/200" }}
            className="w-16 h-16 rounded-full border-2 border-white shadow-sm shadow-slate-200"
          />
          <Text>{userName}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
