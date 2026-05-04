import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";
import Skeleton from "../../../components/ui/Skeleton";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";
import { canSendDM, getRoomTrust } from "../../../lib/trust";

const dateFormater = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

export default function UserProfile() {
  const { userId, roomId } = useLocalSearchParams();
  const router = useRouter();
  const { firestoreUser: viewer } = useFirestoreUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerRoomTrust, setViewerRoomTrust] = useState(0);

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms();
        if (data) setRooms(data);
      } catch (error) {
        console.error("Failed to load rooms", error);
      }
    };
    loadRooms();
  }, []);

  const [vouchStatus, setVouchStatus] = useState(false);
  const hostedRooms = rooms.filter((r) => r.createdBy === userId).length;
  const joinedRooms = rooms.filter(
    (r) => r.participants?.includes(userId) && r.createdBy !== userId,
  ).length;

  // Fetch the viewed user's profile and check trust context for DM access
  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({ id: userSnap.id, ...userSnap.data() });
        }

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
  const trustColor =
    viewerRoomTrust < 3
      ? "#EF4444"
      : viewerRoomTrust < 7
        ? "#F59E0B"
        : "#10B981";

  const handleMessage = () => {
    if (!hasDMAccess) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "DMs locked",
        `Send ${10 - viewerRoomTrust} more messages in the room to unlock.`,
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: `/dm/${user.id}`,
      params: { userName: user?.userName, profilePic: user?.profilePic },
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("", "", [
      { text: "Report", style: "destructive" },
      { text: "Block", style: "destructive" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleVouch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVouchStatus(!vouchStatus);
  };

  const handleShare = async () => {
    try {
      const url = `https://spotus.app/user/${userId}`;

      await Share.share({
        message: `Check out ${user?.userName}'s profile on SpotUs 👀\n${url}`,
      });
    } catch (error) {
      console.log("SpotUs share error:", error);
    }
  };

  const handleBlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      `Block ${user?.userName}?`,
      "You won't see each other anymore.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block", style: "destructive" },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-bg flex-1" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-2">
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
        <View className="items-center mt-6 mb-6 px-6">
          <Skeleton width={110} height={110} borderRadius={55} />
          <Skeleton
            width={150}
            height={28}
            borderRadius={14}
            style={{ marginTop: 16 }}
          />
          <Skeleton
            width={200}
            height={20}
            borderRadius={10}
            style={{ marginTop: 8 }}
          />
        </View>
        <View className="flex-row px-6 gap-2.5 mb-6">
          <Skeleton width="50%" height={48} borderRadius={16} />
          <Skeleton width="25%" height={48} borderRadius={16} />
          <Skeleton width="15%" height={48} borderRadius={16} />
        </View>
        <View className="px-6 mb-6">
          <Skeleton width="100%" height={80} borderRadius={16} />
        </View>
        <View className="px-6 mb-4">
          <View className="flex-row mb-4">
            <Skeleton
              width={32}
              height={32}
              borderRadius={12}
              style={{ marginRight: 12 }}
            />
            <View className="flex-1">
              <Skeleton
                width={120}
                height={20}
                borderRadius={10}
                style={{ marginBottom: 4 }}
              />
              <Skeleton width="100%" height={16} borderRadius={8} />
              <Skeleton
                width="80%"
                height={16}
                borderRadius={8}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
        <TouchableOpacity
          onPress={handleBack}
          className="mx-6 mt-4 w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-100"
        >
          <Ionicons name="chevron-back" size={20} color="#18181B" />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-10 -mt-10">
          <Ionicons name="person-outline" size={48} color="#D1D5DB" />
          <Text className="text-secondary text-lg font-bold mt-4">
            User not found
          </Text>
          <Text className="text-gray-400 text-sm mt-1 text-center">
            This profile doesn&apos;t exist anymore.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-bg flex-1" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-100 z-10"
        >
          <Ionicons name="chevron-back" size={20} color="#18181B" />
        </TouchableOpacity>

        <Text className="absolute w-full text-center text-secondary font-semibold text-base z-0 pointer-events-none">
          Profile
        </Text>

        <TouchableOpacity
          onPress={handleOptions}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-100 z-10"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Avatar + Name */}
        <View className="items-center mt-6 mb-6 px-6">
          <View className="relative">
            <View
              className="w-[110px] h-[110px] rounded-full overflow-hidden bg-gray-100 border-4 border-white"
              style={{
                shadowColor: "#4F46E5",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <Image
                source={user?.profilePic || "https://picsum.photos/200"}
                contentFit="cover"
                transition={300}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 bg-green-400 rounded-full border-[4px] border-bg" />
          </View>

          <Text className="text-secondary text-[24px] font-extrabold mt-4 tracking-tight">
            {user?.userName || "User"}
          </Text>
          {user?.bio ? (
            <Text className="text-gray-400 text-sm text-center mt-1.5 px-6 leading-5">
              {user.bio}
            </Text>
          ) : null}

          {(user?.globalReputation ?? 0) > 0 && (
            <View className="mt-3 flex-row items-center bg-green-50 px-3.5 py-1.5 rounded-full">
              <Ionicons name="star" size={12} color="#10B981" />
              <Text className="text-green-600 text-xs font-semibold ml-1.5">
                {user.globalReputation} rep
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons — varied sizes give visual interest */}
        <View className="flex-row px-6 gap-2.5 mb-6">
          <TouchableOpacity
            onPress={handleMessage}
            activeOpacity={0.8}
            className={`flex-[2] py-3.5 rounded-2xl flex-row items-center justify-center ${
              hasDMAccess ? "bg-primary" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name={hasDMAccess ? "send" : "lock-closed-outline"}
              size={16}
              color={hasDMAccess ? "white" : "#9CA3AF"}
            />
            <Text
              className={`font-semibold text-sm ml-2 ${
                hasDMAccess ? "text-white" : "text-gray-400"
              }`}
            >
              {hasDMAccess ? "Message" : "Locked"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleVouch}
            activeOpacity={0.8}
            className={`flex-1 py-3.5 rounded-2xl flex-row items-center justify-center ${vouchStatus ? "bg-pink-100" : "bg-pink-50"} border border-pink-100`}
          >
            <Ionicons
              name={vouchStatus ? "heart" : "heart-outline"}
              size={16}
              color={vouchStatus ? "#EC4899" : "#EC4899"}
            />
            <Text className="text-pink-500 font-semibold text-sm ml-1.5">
              {vouchStatus ? "Vouched" : "Vouch"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            className="py-3.5 px-4 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center"
          >
            <Ionicons name="share-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Trust progress */}
        {!hasDMAccess && (
          <View className="px-6 mb-6">
            <View className="bg-white rounded-2xl px-4 py-4 border border-gray-100">
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="text-gray-500 text-xs font-medium">
                  Room trust
                </Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: trustColor }}
                >
                  {viewerRoomTrust}/10
                </Text>
              </View>
              <Progress.Bar
                progress={trustProgress}
                width={null}
                color={trustColor}
                unfilledColor="#F3F4F6"
                borderWidth={0}
                height={5}
                borderRadius={3}
                animated={true}
              />
              <Text className="text-gray-400 text-[11px] mt-2">
                {10 - viewerRoomTrust} more messages to unlock DMs
              </Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View
          className="flex-row mx-6 bg-white rounded-2xl border border-gray-100 py-5 mb-6"
          style={{
            shadowColor: "#94A3B8",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View className="flex-1 items-center">
            <Text className="text-[22px] font-extrabold text-primary">
              {hostedRooms}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Hosted</Text>
          </View>
          <View className="w-px bg-gray-100" />
          <View className="flex-1 items-center">
            <Text className="text-[22px] font-extrabold text-secondary">
              {joinedRooms}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Joined</Text>
          </View>
          <View className="w-px bg-gray-100" />
          <View className="flex-1 items-center">
            <Text className="text-[22px] font-extrabold text-green-500">
              {user?.globalReputation ?? 0}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Rep</Text>
          </View>
        </View>

        {/* About — mixed visual approach */}
        <View className="px-6 mb-4">
          <Text className="text-secondary text-lg font-bold mb-4">About</Text>

          <View className="flex-row mb-4">
            <View className="w-8 h-8 rounded-xl bg-amber-50 items-center justify-center mr-3 mt-0.5">
              <Ionicons name="flash" size={14} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-secondary text-sm font-semibold">
                Activity
              </Text>
              <Text className="text-gray-400 text-sm leading-5 mt-0.5">
                Active in Music and Tech rooms. Recently hosted &quot;Late Night
                coding&quot;.
              </Text>
            </View>
          </View>

          <View className="flex-row mb-4">
            <View className="w-8 h-8 rounded-xl bg-indigo-50 items-center justify-center mr-3 mt-0.5">
              <Ionicons name="shield-checkmark" size={14} color="#4F46E5" />
            </View>
            <View className="flex-1">
              <Text className="text-secondary text-sm font-semibold">
                Verified Host
              </Text>
              <Text className="text-gray-400 text-sm leading-5 mt-0.5">
                Member since{" "}
                {user?.createdAt?.seconds
                  ? dateFormater(user.createdAt.seconds)
                  : "recently"}
                . Hosted {hostedRooms} room{hostedRooms !== 1 ? "s" : ""} with
                positive feedback.
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="w-8 h-8 rounded-xl bg-green-50 items-center justify-center mr-3 mt-0.5">
              <Ionicons name="heart" size={14} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-secondary text-sm font-semibold">
                Interests
              </Text>
              <View className="flex-row flex-wrap gap-1.5 mt-1.5">
                {user?.interests?.map((tag) => (
                  <View
                    key={tag}
                    className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
                  >
                    <Text className="text-gray-600 text-xs font-semibold">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Block */}
        <TouchableOpacity
          className="mt-6 py-4 items-center"
          onPress={handleBlock}
        >
          <Text className="text-gray-300 text-sm">Block this user</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
