import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useFirestoreUser from "../../hook/useFireStoreUser";

export default function Home() {
  const { signOut } = useAuth();
  const { firestoreUser, loading } = useFirestoreUser();
  const router = useRouter();
  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }
  if (!firestoreUser) {
    return <Redirect href="/welcome" />;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="bg-bg flex-1 px-8">
      <View className="flex-row justify-between items-center mt-4">
        <View>
          <Text className="text-gray-500 text-lg">Good Morning,</Text>
          <Text className="text-secondary text-2xl font-bold">
            {firestoreUser?.userName || "User"}
          </Text>
        </View>
        <Image
          source={{ uri: firestoreUser?.profilePic }}
          className="w-12 h-12 rounded-full"
        />
      </View>

      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400 text-center text-lg">
          Your Home screen is ready!{"\n"}
          Start building your amazing features here.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-50 py-4 rounded-2xl mb-10 border border-red-100"
      >
        <Text className="text-red-500 text-center font-bold text-lg">
          Sign Out
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
