import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { joinRoomByCode } from "../../../lib/joinRoom";
import SpotUsLoader from "../../../components/ui/SpotUsLoader";

export default function JoinRoomScreen() {
  const router = useRouter();
  const { inviteCode } = useLocalSearchParams();
  const { getToken } = useAuth();
  const { firestoreUser: user, loading: userLoading } = useFirestoreUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait until user state is fully loaded
    if (userLoading) return;

    if (!user?.id) {
      setError("You must be logged in to join an event.");
      setLoading(false);
      return;
    }

    if (!inviteCode) {
      setError("No invite code provided.");
      setLoading(false);
      return;
    }

    const joinRoom = async () => {
      try {
        const token = await getToken();
        const roomId = await joinRoomByCode(inviteCode, user.id, token);
        router.replace(`/(authenticated)/rooms/${roomId}`);
      } catch (err) {
        setError(err.message || "Failed to join event.");
        setLoading(false);
      }
    };

    joinRoom();
  }, [userLoading, user?.id, inviteCode, router]);

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113] justify-center items-center px-6">
      {loading ? (
        <View className="items-center">
          <SpotUsLoader size="large" />
          <Text className="text-secondary dark:text-gray-100 font-bold mt-4">
            Joining Event...
          </Text>
        </View>
      ) : (
        <View className="items-center w-full">
          <View className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-4">
            <Ionicons name="warning" size={32} color="#EF4444" />
          </View>
          <Text className="text-secondary dark:text-gray-100 text-xl font-display font-black text-center mb-2">
            Oops!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">
            {error || "Something went wrong while trying to join the event."}
          </Text>

          <TouchableOpacity
            onPress={() => router.replace("/(authenticated)/(tabs)/home")}
            className="w-full bg-primary py-4 rounded-[18px] items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-[16px]">Return Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
