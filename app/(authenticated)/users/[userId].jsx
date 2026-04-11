import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../../components/CustomButton";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { canSendDM, getRoomTrust } from "../../../lib/trust";

export default function UserProfile() {
  const { userId, roomId } = useLocalSearchParams();
  const router = useRouter();
  const { firestoreUser: viewer } = useFirestoreUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerRoomTrust, setViewerRoomTrust] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        // 1. Fetch Target User Profile
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({
            id: userSnap.id,
            ...userSnap.data(),
          });
        }

        // 2. Fetch Viewer's Trust in this Room context
        if (roomId && viewer?.id) {
          const roomTrust = await getRoomTrust(db, roomId, viewer.id);
          setViewerRoomTrust(roomTrust);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, roomId, viewer?.id]);

  const hasDMAccess = canSendDM(viewerRoomTrust);

  if (loading) {
    // ...
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-bg p-6">
        <Ionicons name="person-remove-outline" size={64} color="#D1D5DB" />
        <Text className="text-secondary text-xl font-bold mt-4">
          User not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-primary px-8 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="bg-bg flex-1" edges={["top"]}>
      {/* Navigation Header */}
      <View className="flex-row items-center justify-between px-6 py-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-gray-100 items-center justify-center shadow-sm shadow-slate-100"
        >
          <Ionicons name="chevron-back" size={20} color="#18181B" />
        </TouchableOpacity>
        <Text className="text-secondary font-bold text-lg">Profile</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center px-6 mt-6 mb-6">
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-4 border-white shadow-xl shadow-slate-200 overflow-hidden bg-gray-100">
              <Image
                source={user?.profilePic || "https://picsum.photos/200"}
                contentFit="cover"
                transition={500}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-[4px] border-bg" />
          </View>

          <Text className="text-secondary text-3xl font-black mt-5 tracking-tight">
            {user?.userName || "User"}
          </Text>
          <Text className="text-gray-400 text-base font-semibold text-center mt-1 px-4">
            {user?.bio || "No bio yet."}
          </Text>
        </View>

        <View>
          <View className="px-16 mb-8 flex flex-row">
            <CustomButton
              title={
                <View className="flex-row justify-center gap-2 items-center">
                  <Ionicons
                    name={hasDMAccess ? "send" : "lock-closed"}
                    size={20}
                    color="white"
                  />
                  <Text className="text-white font-bold text-lg ml-2">
                    {hasDMAccess ? "Send DM" : "Unlock DM"}
                  </Text>
                </View>
              }
              onPress={() => {
                if (!hasDMAccess) {
                  alert(
                    "You need 10 messages in this circle to unlock DMs. Keep interacting to build trust!",
                  );
                } else {
                  // Navigate to DM screen or open chat
                }
              }}
              variant={hasDMAccess ? "secondary" : "primary"}
            />
          </View>
          {!hasDMAccess && (
            <Text className="text-center text-gray-400 text-xs px-10 -mt-4 mb-8 font-medium">
              Maintain {10 - viewerRoomTrust} more room interaction to unlock.
            </Text>
          )}
        </View>

        {/* Stats Section */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shadow-slate-100 flex-row items-center justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-primary">
                {user?.roomsCreated ?? 0}
              </Text>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                Hosted
              </Text>
            </View>
            <View className="w-[1px] bg-gray-50 h-8" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-secondary">
                {user?.roomsJoined ?? 0}
              </Text>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                Joined
              </Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View className="px-6 gap-4">
          <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm shadow-slate-50">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-xl bg-orange-50 items-center justify-center mr-3">
                <Ionicons name="flash" size={16} color="#F97316" />
              </View>
              <Text className="text-secondary font-bold text-base">
                Activity
              </Text>
            </View>
            <Text className="text-gray-500 leading-5">
              This user is very active in &quot;Music&quot; and &quot;Tech&quot;
              rooms. Recently hosted a room called &quot;Late Night
              coding&quot;.
            </Text>
          </View>

          <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm shadow-slate-50">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
              </View>
              <Text className="text-secondary font-bold text-base">
                Verified Host
              </Text>
            </View>
            <Text className="text-gray-500 leading-5">
              Member since June 2023. Has successfully hosted over 10 rooms with
              positive feedback.
            </Text>
          </View>
        </View>

        <TouchableOpacity className="mt-8 mx-6 items-center justify-center py-4">
          <Text className="text-gray-400 font-bold text-sm tracking-wide">
            Block User
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
