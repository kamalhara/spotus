import { Ionicons } from "@expo/vector-icons";
import { CATEGORY_ICONS } from "../../../constants/categories";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useModal } from "../../../context/ModalContext";
import ReportSheet from "../../../components/modals/ReportSheet";

import { SafeAreaView } from "react-native-safe-area-context";
import GlassButton from "../../../components/ui/GlassButton";
import Skeleton from "../../../components/ui/Skeleton";
import { db } from "../../../config/firebase.config";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { getRooms } from "../../../lib/getRoom";
import { getTrustBadge } from "../../../lib/trust";

const dateFormater = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

export default function UserProfile() {
  const { isDark } = useTheme();
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { firestoreUser: viewer } = useFirestoreUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatDoc, setChatDoc] = useState(null);
  const reportSheetRef = useRef(null);
  const { showConfirm, showAlert } = useModal();

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms(viewer?.id);
        if (data) setRooms(data);
      } catch (error) {
        console.error("Failed to load rooms", error);
      }
    };
    if (viewer?.id) loadRooms();
  }, [viewer?.id]);

  const hostedRooms = rooms.filter((r) => r.createdBy === userId).length;
  const joinedRooms = rooms.filter(
    (r) => r.participants?.includes(userId) && r.createdBy !== userId,
  ).length;

  const activeHostedEvents = rooms.filter(
    (r) => r.createdBy === userId && r.visibility !== "ghost"
  );

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
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, viewer?.id]);

  const chatDocId = useMemo(() => {
    if (!viewer?.id || !userId) return null;
    return [viewer.id, userId].sort().join("_");
  }, [viewer?.id, userId]);

  useEffect(() => {
    if (!chatDocId) return;
    const unsub = onSnapshot(doc(db, "chats", chatDocId), (snap) => {
      if (snap.exists()) setChatDoc(snap.data());
      else setChatDoc(null);
    });
    return unsub;
  }, [chatDocId]);

  // Message request status logic
  let messageButtonState = "none";
  let messageButtonText = "Request to Message";

  if (chatDoc?.status === "accepted" || (chatDoc && !chatDoc.status)) {
    messageButtonState = "accepted";
    messageButtonText = "Message";
  } else if (chatDoc?.status === "pending") {
    if (chatDoc.senderId === viewer?.id) {
      messageButtonState = "pending_sent";
      messageButtonText = "Request Sent";
    } else {
      messageButtonState = "pending_received";
      messageButtonText = "Accept Request";
    }
  }

  const handleMessageAction = async () => {
    if (!viewer?.id || !userId) return;

    if (messageButtonState === "accepted") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: `/dm/${user.id}`,
        params: { userName: user?.userName, profilePic: user?.profilePic },
      });
    } else if (messageButtonState === "none") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await setDoc(doc(db, "chats", chatDocId), {
        participants: [viewer.id, userId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "pending",
        senderId: viewer.id,
        lastMessage: "Message request sent",
        lastMessageAt: serverTimestamp(),
      });
    } else if (messageButtonState === "pending_received") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await updateDoc(doc(db, "chats", chatDocId), {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });
      router.push({
        pathname: `/dm/${user.id}`,
        params: { userName: user?.userName, profilePic: user?.profilePic },
      });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reportSheetRef.current?.present();
  };

  const handleOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showConfirm({
      title: "Options",
      message: "Choose an action",
      options: [
        { text: "Report", style: "destructive", onPress: handleReport },
        { text: "Block", style: "destructive", onPress: handleBlock },
        { text: "Cancel", style: "cancel" },
      ],
      icon: "ellipsis-horizontal",
      iconColor: "#9CA3AF"
    });
  };

  const handleShare = async () => {
    try {
      const url = `https://spotus.app/user/${userId}`;

      await Share.share({
        message: `Check out ${user?.userName}'s profile on SpotUs 👀\n${url}`,
      });
    } catch (error) {
      console.error("SpotUs share error:", error);
    }
  };

  const handleBlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    showConfirm({
      title: `Block ${user?.userName}?`,
      message: "You won't see each other anymore.",
      confirmText: "Block",
      confirmButtonStyle: "bg-red-500",
      icon: "ban-outline",
      onConfirm: async () => {
        try {
          const viewerRef = doc(db, "users", viewer.id);
          await updateDoc(viewerRef, {
            blockedUsers: arrayUnion(userId),
          });
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          router.back();
        } catch (err) {
          console.error("Error blocking user:", err);
          showAlert("Error", "Could not block user. Please try again.");
        }
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-bg dark:bg-[#111113] flex-1" edges={["top"]}>
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
      <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
        <TouchableOpacity
          onPress={handleBack}
          className="mx-6 mt-4 w-10 h-10 rounded-full bg-white dark:bg-[#1C1C20] items-center justify-center border border-gray-100 dark:border-[#2C2C30]"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "white" : "#18181B"}
            className="dark:text-gray-100"
          />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-10 -mt-10">
          <Ionicons name="person-outline" size={48} color="#D1D5DB" />
          <Text className="text-secondary dark:text-gray-100 text-lg font-bold mt-4">
            User not found
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1 text-center">
            This profile doesn&apos;t exist anymore.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-bg dark:bg-[#111113] flex-1" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <GlassButton onPress={handleBack} isInteractive={true} shape="circle">
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "white" : "#18181B"}
            className="dark:text-gray-100"
          />
        </GlassButton>
        <Text className="absolute w-full text-center text-secondary dark:text-gray-100 font-semibold text-base z-0 pointer-events-none">
          Profile
        </Text>
        <GlassButton
          onPress={handleOptions}
          isInteractive={true}
          shape="circle"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
        </GlassButton>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Avatar + Name */}
        <View className="items-center mt-6 mb-6 px-6">
          <View className="relative">
            <View
              className="w-[110px] h-[110px] rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-[#1C1C20]"
              style={{
                shadowColor: "#94A3B8",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Image
                source={user?.profilePic || "https://picsum.photos/200"}
                contentFit="cover"
                transition={300}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 bg-green-400 rounded-full border-[4px] border-bg dark:border-[#111113]" />
          </View>

          <Text className="text-secondary dark:text-gray-100 text-[24px] font-display font-extrabold mt-4 tracking-tight">
            {user?.userName || "User"}
          </Text>
          {user?.bio ? (
            <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-1.5 px-6 leading-5">
              {user.bio}
            </Text>
          ) : null}

          {(() => {
            const badge = getTrustBadge(user?.globalReputation ?? 0);
            return (
              <View className="mt-3 flex-row items-center px-3.5 py-1.5 rounded-full" style={{ backgroundColor: `${badge.color}15` }}>
                <Ionicons name={badge.icon} size={12} color={badge.color} />
                <Text className="text-xs font-semibold ml-1.5" style={{ color: badge.color }}>
                  {badge.label} • {user?.globalReputation ?? 0} rep
                </Text>
              </View>
            );
          })()}
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-6 gap-2.5 mb-6">
          <TouchableOpacity
            onPress={handleMessageAction}
            activeOpacity={0.8}
            className={`flex-[2] py-3.5 rounded-2xl flex-row items-center justify-center ${
              messageButtonState === "pending_sent" ? "bg-gray-100 dark:bg-gray-800" : "bg-primary"
            }`}
            disabled={messageButtonState === "pending_sent"}
          >
            <Ionicons
              name={
                messageButtonState === "accepted" ? "chatbubble" : 
                messageButtonState === "pending_sent" ? "time-outline" : 
                messageButtonState === "pending_received" ? "checkmark-circle" : "send"
              }
              size={16}
              color={messageButtonState === "pending_sent" ? "#9CA3AF" : "white"}
            />
            <Text
              className={`font-semibold text-sm ml-2 ${
                messageButtonState === "pending_sent"
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-white"
              }`}
            >
              {messageButtonText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] items-center justify-center"
          >
            <Ionicons name="share-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Stats — with icons */}
        <View className="mx-6 mb-6">
          <View
            className="flex-row bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] overflow-hidden"
            style={{
              shadowColor: "#94A3B8",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View className="flex-1 items-center py-5">
              <View className="w-9 h-9 bg-primary/10 rounded-xl items-center justify-center mb-2">
                <Ionicons name="mic-outline" size={16} color="#FF6B47" />
              </View>
              <Text className="text-[20px] font-display font-extrabold text-primary">
                {hostedRooms}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Events Hosted
              </Text>
            </View>
            <View className="w-px bg-gray-100 dark:bg-[#2C2C30] my-4" />
            <View className="flex-1 items-center py-5">
              <View className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl items-center justify-center mb-2">
                <Ionicons name="enter-outline" size={16} color="#3B82F6" />
              </View>
              <Text className="text-[20px] font-display font-extrabold text-secondary dark:text-gray-100">
                {joinedRooms}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Events Joined
              </Text>
            </View>
            <View className="w-px bg-gray-100 dark:bg-[#2C2C30] my-4" />
            <View className="flex-1 items-center py-5">
              <View className="w-9 h-9 bg-green-50 dark:bg-green-900/20 rounded-xl items-center justify-center mb-2">
                <Ionicons name="star-outline" size={16} color="#10B981" />
              </View>
              <Text className="text-[20px] font-display font-extrabold text-green-500">
                {user?.globalReputation ?? 0}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Rep
              </Text>
            </View>
          </View>
        </View>

        {/* Active Events Hosted */}
        {activeHostedEvents.length > 0 && (
          <View className="px-6 mb-5">
            <Text className="text-secondary dark:text-gray-100 text-[17px] font-bold tracking-tight mb-3">
              Currently Hosting
            </Text>
            {activeHostedEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/rooms/${event.id}`)}
                className="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm shadow-black/5"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-3">
                    <Ionicons name={CATEGORY_ICONS[event.category] || "radio"} size={20} color="#FF6B47" />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-secondary dark:text-gray-100 font-bold text-[15px]" numberOfLines={1}>
                      {event.title || "Live Event"}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                      {event.participants?.length || 1} tuning in
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bio Section */}
        <View className="px-6 mb-5">
          <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-7 h-7 bg-primary/10 rounded-lg items-center justify-center mr-2.5">
                <Ionicons
                  name="document-text-outline"
                  size={14}
                  color="#FF6B47"
                />
              </View>
              <Text className="text-secondary dark:text-gray-100 text-sm font-bold">
                Bio
              </Text>
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-[13px] leading-5">
              {user?.bio || "This user hasn\u0027t added a bio yet."}
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View className="px-6 mb-5">
          <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] overflow-hidden">
            {/* Member Since */}
            <View className="flex-row items-center px-4 py-3.5 border-b border-gray-50 dark:border-[#2C2C30]">
              <View className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={14} color="#FF6B47" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                  Member Since
                </Text>
                <Text className="text-secondary dark:text-gray-100 text-sm font-semibold mt-0.5">
                  {user?.createdAt?.seconds
                    ? dateFormater(user.createdAt.seconds)
                    : "Recently joined"}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View className="flex-row items-center px-4 py-3.5 border-b border-gray-50 dark:border-[#2C2C30]">
              <View className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="location-outline" size={14} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                  Location
                </Text>
                <Text className="text-secondary dark:text-gray-100 text-sm font-semibold mt-0.5">
                  {user?.location || "Nearby"}
                </Text>
              </View>
            </View>

            {/* Activity Status */}
            <View className="flex-row items-center px-4 py-3.5">
              <View className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="pulse-outline" size={14} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                  Activity
                </Text>
                <Text className="text-secondary dark:text-gray-100 text-sm font-semibold mt-0.5">
                  {hostedRooms + joinedRooms > 5
                    ? "Very active"
                    : hostedRooms + joinedRooms > 0
                      ? "Active"
                      : "New member"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Interests */}
        {user?.interests?.length > 0 && (
          <View className="px-6 mb-5">
            <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 bg-pink-50 rounded-lg items-center justify-center mr-2.5">
                  <Ionicons name="heart" size={14} color="#EC4899" />
                </View>
                <Text className="text-secondary dark:text-gray-100 text-sm font-bold">
                  Interests
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {user.interests.map((tag) => (
                  <View
                    key={tag}
                    className="bg-gray-50 dark:bg-[#242428] px-3.5 py-2 rounded-xl border border-gray-100 dark:border-[#2C2C30]"
                  >
                    <Text className="text-gray-600 dark:text-gray-300 text-xs font-bold">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Mutual Rooms */}
        {rooms.filter(
          (r) =>
            r.participants?.includes(userId) &&
            r.participants?.includes(viewer?.id),
        ).length > 0 && (
          <View className="px-6 mb-5">
            <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-7 h-7 bg-blue-50 rounded-lg items-center justify-center mr-2.5">
                    <Ionicons name="people" size={14} color="#3B82F6" />
                  </View>
                  <Text className="text-secondary dark:text-gray-100 text-sm font-bold">
                    Mutual Rooms
                  </Text>
                </View>
                <View className="bg-blue-50 px-2.5 py-1 rounded-lg">
                  <Text className="text-blue-500 text-[10px] font-bold">
                    {
                      rooms.filter(
                        (r) =>
                          r.participants?.includes(userId) &&
                          r.participants?.includes(viewer?.id),
                      ).length
                    }
                  </Text>
                </View>
              </View>
              {rooms
                .filter(
                  (r) =>
                    r.participants?.includes(userId) &&
                    r.participants?.includes(viewer?.id),
                )
                .slice(0, 3)
                .map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/rooms/${r.id}`)}
                    className="flex-row items-center py-2.5"
                  >
                    <View className="w-8 h-8 bg-primary/10 rounded-xl items-center justify-center mr-3">
                      <Ionicons
                        name="chatbubbles-outline"
                        size={14}
                        color="#FF6B47"
                      />
                    </View>
                    <Text
                      className="text-secondary dark:text-gray-100 text-sm font-semibold flex-1"
                      numberOfLines={1}
                    >
                      {r.title}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="#D1D5DB"
                    />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {/* Block / Report */}
        <View className="px-6 mt-2 mb-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleBlock}
              activeOpacity={0.7}
              className="flex-1 py-3.5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex-row items-center justify-center"
            >
              <Ionicons name="ban-outline" size={14} color="#EF4444" />
              <Text className="text-red-400 text-xs font-semibold ml-1.5">
                Block
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReport}
              activeOpacity={0.7}
              className="flex-1 py-3.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] flex-row items-center justify-center"
            >
              <Ionicons name="flag-outline" size={14} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs font-semibold ml-1.5">
                Report
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <ReportSheet ref={reportSheetRef} currentUserId={viewer?.id} targetId={userId} type="user" />
    </SafeAreaView>
  );
}
