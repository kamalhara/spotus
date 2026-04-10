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
import { Ionicons } from "@expo/vector-icons";
import useFirestoreUser from "../../../hook/useFireStoreUser";

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
    <SafeAreaView className="bg-[#FAFAFA] flex-1 px-6">
      {/* Header Profile Section */}
      <View className="items-center mt-6 mb-8">
        <View className="relative">
          <Image
            source={{ uri: firestoreUser?.profilePic || "https://picsum.photos/200" }}
            className="w-28 h-28 rounded-full border-4 border-white shadow-lg shadow-gray-200"
          />
          <View className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-[3px] border-white"></View>
        </View>
        <Text className="text-secondary text-3xl font-black mt-4 tracking-tight">
          {firestoreUser?.userName || "Spot Us User"}
        </Text>
        <Text className="text-gray-500 text-base mt-1 font-medium">
          {firestoreUser?.email || "No email linked"}
        </Text>
      </View>

      {/* Stats and Action Blocks */}
      <View className="flex-1">
        <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm shadow-slate-100 mb-6 flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-black text-primary">0</Text>
            <Text className="text-gray-500 text-xs font-semibold mt-1 uppercase tracking-wider">Rooms Created</Text>
          </View>
          <View className="w-[1px] bg-gray-100 h-full"></View>
          <View className="items-center">
            <Text className="text-2xl font-black text-primary">12</Text>
            <Text className="text-gray-500 text-xs font-semibold mt-1 uppercase tracking-wider">Rooms Joined</Text>
          </View>
        </View>

        <TouchableOpacity className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm shadow-slate-50 flex-row items-center justify-between mb-3 active:opacity-70">
          <View className="flex-row items-center">
             <View className="bg-indigo-50 w-11 h-11 rounded-full items-center justify-center mr-4">
               <Ionicons name="settings-outline" size={20} color="#4F46E5" />
             </View>
             <Text className="text-secondary font-bold text-base">Account Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm shadow-slate-50 flex-row items-center justify-between active:opacity-70">
          <View className="flex-row items-center">
             <View className="bg-indigo-50 w-11 h-11 rounded-full items-center justify-center mr-4">
               <Ionicons name="notifications-outline" size={20} color="#4F46E5" />
             </View>
             <Text className="text-secondary font-bold text-base">Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-50 py-4 rounded-[20px] mb-8 border border-red-100 shadow-sm shadow-red-100 active:opacity-80"
      >
        <Text className="text-red-500 text-center font-bold text-lg tracking-wide">
          Sign Out
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
