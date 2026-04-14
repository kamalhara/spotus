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
import * as Progress from "react-native-progress";
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
  const trustProgress = Math.min(viewerRoomTrust / 10, 1);
  const trustPercentage = Math.min(viewerRoomTrust * 10, 100);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-muted mt-3 font-medium">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-bg p-6">
        <View className="w-20 h-20 bg-surface-alt rounded-3xl items-center justify-center mb-5">
          <Ionicons name="person-remove-outline" size={36} color="#CBD5E1" />
        </View>
        <Text className="text-secondary text-xl font-black mt-2">
          User not found
        </Text>
        <Text className="text-muted text-sm font-medium mt-2 text-center">
          This profile may have been removed or doesn't exist.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 bg-primary px-8 py-3.5 rounded-2xl"
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
          className="w-11 h-11 rounded-2xl bg-white border border-border-light items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#18181B" />
        </TouchableOpacity>
        <Text className="text-secondary font-bold text-lg">Profile</Text>
        <TouchableOpacity className="w-11 h-11 items-center justify-center">
          <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center px-6 mt-6 mb-6">
          <View className="relative">
            <View className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-xl shadow-slate-200 overflow-hidden bg-surface-alt">
              <Image
                source={user?.profilePic || "https://picsum.photos/200"}
                contentFit="cover"
                transition={500}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View className="absolute bottom-1 right-1 bg-success w-7 h-7 rounded-full border-[4px] border-bg" />
          </View>

          <Text className="text-secondary text-[28px] font-black mt-5 tracking-tight">
            {user?.userName || "User"}
          </Text>
          <Text className="text-muted text-sm font-medium text-center mt-1.5 px-6 leading-5">
            {user?.bio || "No bio yet."}
          </Text>
        </View>

        {/* DM Button */}
        <View className="px-8 mb-4">
          <CustomButton
            title={
              <View className="flex-row justify-center gap-2.5 items-center">
                <Ionicons
                  name={hasDMAccess ? "send" : "lock-closed"}
                  size={18}
                  color="white"
                />
                <Text className="text-white font-bold text-[16px]">
                  {hasDMAccess ? "Send Message" : "Unlock DM"}
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

        {/* Trust Progress for DM */}
        {!hasDMAccess && (
          <View className="px-8 mb-8">
            <View className="bg-white border border-border-light px-5 py-4 rounded-2xl">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="shield-checkmark" size={14} color="#F59E0B" />
                  <Text className="text-secondary text-[11px] font-bold uppercase tracking-[1.5px]">
                    DM Access
                  </Text>
                </View>
                <Text className="text-warning text-[11px] font-black">
                  {trustPercentage}%
                </Text>
              </View>
              <Progress.Bar
                progress={trustProgress}
                width={null}
                color="#F59E0B"
                unfilledColor="#F1F5F9"
                borderWidth={0}
                height={6}
                borderRadius={3}
                animated={true}
              />
              <Text className="text-muted text-[10px] font-bold uppercase tracking-[1.5px] mt-2.5">
                {10 - viewerRoomTrust} more interactions needed
              </Text>
            </View>
          </View>
        )}

        {/* Stats Section */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-3xl p-5 border border-border-light flex-row items-center justify-between">
            <View className="items-center flex-1">
              <Text className="text-[26px] font-black text-primary">
                {user?.roomsCreated ?? 0}
              </Text>
              <Text className="text-muted text-[9px] font-bold uppercase tracking-[1.5px] mt-1">
                Hosted
              </Text>
            </View>
            <View className="w-[1px] bg-border-light h-10" />
            <View className="items-center flex-1">
              <Text className="text-[26px] font-black text-secondary">
                {user?.roomsJoined ?? 0}
              </Text>
              <Text className="text-muted text-[9px] font-bold uppercase tracking-[1.5px] mt-1">
                Joined
              </Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View className="px-6 gap-4">
          <View className="bg-white p-5 rounded-3xl border border-border-light">
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-xl bg-warning/10 items-center justify-center mr-3">
                <Ionicons name="flash" size={16} color="#F59E0B" />
              </View>
              <Text className="text-secondary font-bold text-[15px]">
                Activity
              </Text>
            </View>
            <Text className="text-muted leading-[22px] text-[14px] font-medium">
              This user is very active in &quot;Music&quot; and &quot;Tech&quot;
              rooms. Recently hosted a room called &quot;Late Night
              coding&quot;.
            </Text>
          </View>

          <View className="bg-white p-5 rounded-3xl border border-border-light">
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={16} color="#4F46E5" />
              </View>
              <Text className="text-secondary font-bold text-[15px]">
                Verified Host
              </Text>
            </View>
            <Text className="text-muted leading-[22px] text-[14px] font-medium">
              Member since June 2023. Has successfully hosted over 10 rooms with
              positive feedback.
            </Text>
          </View>
        </View>

        <TouchableOpacity className="mt-10 mx-6 items-center justify-center py-4">
          <Text className="text-danger/60 font-bold text-sm tracking-wide">
            Block User
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
