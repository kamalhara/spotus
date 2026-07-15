import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  arrayRemove,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useModal } from "../../../context/ModalContext";
import { SafeAreaView } from "react-native-safe-area-context";
import RoomOptionsModal from "../../../components/rooms/roomOptionsModal";
import GlassButton from "../../../components/ui/GlassButton";
import GlassContainer from "../../../components/ui/GlassContainer";
import { db } from "../../../config/firebase.config";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { deleteRoomWithMessages } from "../../../lib/deleteRoom";
import { fetchUserBatch } from "../../../lib/userCache";

import GhostModeBanner from "../../../components/shared/GhostModeBanner";
import { CATEGORY_ICONS } from "../../../constants/categories";

const roomRules = [
  {
    title: "Be respectful",
    description: "Constructive critique only. Keep it professional and kind.",
    icon: "chatbubble",
  },
  {
    title: "No Spam or Self-Promotion",
    description: "Share links only when they are relevant to the discussion.",
    icon: "remove-circle",
  },
  {
    title: "Share your work",
    description:
      "We are here to learn. Don't be shy about posting work in progress.",
    icon: "color-palette",
  },
];
export default function RoomInfo() {
  const { getToken } = useAuth();
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { firestoreUser: user } = useFirestoreUser();
  const currentUserId = user?.id;
  const { isDark } = useTheme();
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const [showRoomTitle, setShowRoomTitle] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { showConfirm } = useModal();

  const maxVisibleMembers = 3;
  const visibleMembers = isMembersExpanded
    ? members
    : members.slice(0, maxVisibleMembers);
  const hasMoreMembers = members.length > maxVisibleMembers;

  useEffect(() => {
    if (!roomId) return;
    const fetchRoomAndMembers = async () => {
      try {
        const snap = await getDoc(doc(db, "rooms", roomId));
        if (snap.exists()) {
          const roomData = { id: snap.id, ...snap.data() };
          setRoom(roomData);

          if (roomData.participants?.length) {
            const profiles = (
              await Promise.all(
                roomData.participants.map(async (uid) => {
                  const profile = await fetchUserBatch(uid);
                  return profile ? { id: uid, ...profile } : null;
                }),
              )
            ).filter(Boolean);
            setMembers(
              profiles
                .filter((p) => !user?.blockedUsers?.includes(p.id)),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching room info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomAndMembers();
  }, [roomId, user?.blockedUsers]);

  const handleProfilePress = (id) => {
    if (id === currentUserId) {
      router.push("/profile");
    } else {
      router.push({
        pathname: `/users/${id}`,
        params: { roomId },
      });
    }
  };
  const handleLeaveRoom = async () => {
    if (!roomId || !currentUserId) return;

    try {
      const roomRef = doc(db, "rooms", roomId);

      await updateDoc(roomRef, {
        participants: arrayRemove(currentUserId),
      });

      setShowOptions(false);
      router.replace("/(authenticated)/(tabs)/home");
    } catch (err) {
      console.error("Leave room error:", err);
    }
  };

  const handleDeleteRoom = () => {
    if (!roomId) return;

    showConfirm({
      title: "Delete Room",
      message: "Are you sure you want to delete this room? This action cannot be undone and will remove all messages for everyone.",
      confirmText: "Delete",
      confirmButtonStyle: "bg-red-500",
      icon: "trash-outline",
      onConfirm: async () => {
        try {
          const token = await getToken();
          await deleteRoomWithMessages(roomId, token);
          setShowOptions(false);
          router.replace("/(authenticated)/(tabs)/home");
        } catch (err) {
          console.error("Delete room error:", err);
        }
      },
    });
  };

  const handleShare = async () => {
    try {
      const inviteLink = Linking.createURL("join/" + room?.inviteCode);
      await Share.share({
        message: `Join “${room?.title}” on SpotUs. Room code: ${room?.inviteCode}\n${inviteLink}`,
      });
    } catch (error) {
      console.error("Error sharing room:", error);
    }
  };

  const categoryIcon = CATEGORY_ICONS[room?.category] || "grid";

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113] px-5">
      <View className="flex-row justify-between items-center py-4">
        <GlassButton onPress={() => router.back()} size={40} shape="circle">
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "white" : "#18181B"}
          />
        </GlassButton>
        <Text
          className="text-secondary dark:text-gray-100 text-xl font-bold"
          numberOfLines={1}
          style={{ maxWidth: 200 }}
        >
          {showRoomTitle ? room?.title : "Room Info"}
        </Text>
        <GlassButton
          onPress={() => setShowOptions(true)}
          size={40}
          shape="circle"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={isDark ? "white" : "#18181B"}
          />
        </GlassButton>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          if (offsetY > 60 && !showRoomTitle) setShowRoomTitle(true);
          if (offsetY <= 60 && showRoomTitle) setShowRoomTitle(false);
        }}
        scrollEventThrottle={16}
      >
        {loading ? (
          <View className="py-8 items-center">
            <Text className="text-muted font-bold text-sm">Loading...</Text>
          </View>
        ) : (
          <>
            {/* Header section */}
            <View className="mb-6 mt-4">
              <View className="flex-row flex-wrap items-center gap-2 mb-3">
                <GlassContainer
                  borderRadius={12}
                  style={{
                    backgroundColor: isDark
                      ? "rgba(79, 70, 229, 0.15)"
                      : "rgba(79, 70, 229, 0.08)",
                  }}
                  fallbackClassName="bg-indigo-50 dark:bg-[#242428]"
                >
                  <View className="px-3.5 py-2 flex-row items-center">
                    <Ionicons
                      name={categoryIcon}
                      size={12}
                      color={`#FF6B47`}
                      style={{ marginRight: 6 }}
                    />
                    <Text className="text-primary font-display font-black text-[10px] uppercase tracking-[1.5px]">
                      {room?.category || "General"}
                    </Text>
                  </View>
                </GlassContainer>

                <GlassContainer
                  borderRadius={12}
                  style={{
                    backgroundColor: isDark
                      ? "rgba(79, 70, 229, 0.15)"
                      : "rgba(79, 70, 229, 0.08)",
                  }}
                  fallbackClassName="bg-indigo-50 dark:bg-[#242428]"
                >
                  <View className="flex-row items-center px-3.5 py-2">
                    <Ionicons name="location-sharp" size={12} color="#FF6B47" />
                    <Text className="text-primary font-display font-black text-[10px] ml-1">
                      {room?.location || "0.4km away"}
                    </Text>
                  </View>
                </GlassContainer>

                <GlassContainer
                  borderRadius={12}
                  style={{
                    backgroundColor: isDark
                      ? "rgba(79, 70, 229, 0.15)"
                      : "rgba(79, 70, 229, 0.08)",
                  }}
                  fallbackClassName="bg-indigo-50 dark:bg-[#242428]"
                >
                  <View className="flex-row items-center px-3.5 py-2">
                    <Ionicons name="time-outline" size={12} color="#FF6B47" />
                    <Text className="text-primary font-display font-black text-[10px] ml-1 uppercase tracking-[1px]">
                      {(() => {
                        if (!room?.expiresAt) return "Open now";
                        const expiresMs = room.expiresAt.seconds ? room.expiresAt.seconds * 1000 : room.expiresAt instanceof Date ? room.expiresAt.getTime() : room.expiresAt;
                        const diffMs = expiresMs - Date.now();
                        if (diffMs <= 0) return "Expired";
                        const totalMinutes = Math.floor(diffMs / (1000 * 60));
                        const hours = Math.floor(totalMinutes / 60);
                        const mins = totalMinutes % 60;
                        if (hours >= 24) return `${Math.floor(hours / 24)}d left`;
                        if (hours > 0) return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
                        return `${Math.max(1, mins)}m left`;
                      })()}
                    </Text>
                  </View>
                </GlassContainer>
              </View>

              <Text className="text-secondary dark:text-gray-100 text-3xl font-display font-black leading-tight tracking-tighter">
                {room?.title}
              </Text>
            </View>

            {/* Ghost Mode Invite Block */}
            <GhostModeBanner room={room} onShare={handleShare} />

            {/* Room Description */}
            <View className="mb-8 pb-8 border-b border-border-light dark:border-gray-800">
              <Text className="text-muted text-[10px] font-bold uppercase tracking-[2px] mb-2.5">
                Description
              </Text>
              <Text className="text-slate-500 leading-[22px] font-medium text-[14px]">
                {room?.description ||
                  `A local room for ${room?.category || "nearby"} discussions and plans with members in your area.`}
              </Text>
            </View>

            {/* Members Section */}
            <View>
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-secondary dark:text-gray-100 text-xl font-display font-black tracking-tight">
                  Members
                </Text>
                <GlassContainer
                  borderRadius={12}
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                  fallbackClassName="bg-gray-100 dark:bg-[#242428]"
                >
                  <View className="px-3.5 py-1.5">
                    <Text className="text-muted font-display font-black text-[10px] uppercase tracking-[1.5px]">
                      {room?.participants?.length || 0} Total
                    </Text>
                  </View>
                </GlassContainer>
              </View>

              <View className="flex flex-col gap-3">
                {members && members.length > 0 ? (
                  <>
                    {visibleMembers.map((member) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleProfilePress(member.id)}
                        key={member.id}
                        className="flex-row items-center justify-between bg-white dark:bg-[#242428] p-3.5 rounded-2xl border border-gray-50 dark:border-[#2C2C30]"
                        style={{
                          shadowColor: "#94A3B8",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.04,
                          shadowRadius: 4,
                          elevation: 1,
                        }}
                      >
                        <View className="flex-row items-center flex-1">
                          <Image
                            source={{
                              uri:
                                member.profilePic ||
                                "https://picsum.photos/200",
                            }}
                            className="w-11 h-11 rounded-xl mr-3.5 border-2 border-gray-50 dark:border-gray-700"
                          />
                          <View>
                            <Text className="text-secondary dark:text-gray-100 font-display font-black text-sm tracking-tight">
                              {member.userName || "Unknown Member"}
                            </Text>
                            <View className="flex-row items-center mt-2 gap-2">
                              {member.id === room?.createdBy && (
                                <View className="bg-warning/10 px-2.5 py-1 rounded-lg flex-row items-center">
                                  <Ionicons
                                    name="star"
                                    size={10}
                                    color="#F59E0B"
                                  />
                                  <Text className="text-warning font-display font-black text-[8px] uppercase tracking-widest ml-1">
                                    Creator
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                        {member.id === currentUserId && (
                          <View className="bg-primary/10 px-2.5 py-1.5 rounded-xl">
                            <Text className="text-primary font-display font-black text-[9px] uppercase tracking-widest">
                              You
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                    {hasMoreMembers && (
                      <TouchableOpacity
                        onPress={() => setIsMembersExpanded(!isMembersExpanded)}
                        className="flex-row items-center justify-center py-3 mt-2 bg-white dark:bg-[#242428] rounded-2xl border border-gray-50 dark:border-[#2C2C30]"
                        style={{
                          shadowColor: "#94A3B8",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.04,
                          shadowRadius: 4,
                          elevation: 1,
                        }}
                      >
                        <Text className="text-primary font-bold text-sm mr-1">
                          {isMembersExpanded
                            ? "Show Less"
                            : `Show ${members.length - maxVisibleMembers} More`}
                        </Text>
                        <Ionicons
                          name={
                            isMembersExpanded ? "chevron-up" : "chevron-down"
                          }
                          size={16}
                          color="#FF6B47"
                        />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View className="py-8 items-center">
                    <View className="w-14 h-14 bg-surface-alt dark:bg-[#242428] rounded-2xl items-center justify-center mb-3">
                      <Ionicons
                        name="people-outline"
                        size={24}
                        color="#CBD5E1"
                      />
                    </View>
                    <Text className="text-muted font-bold text-sm">
                      No one has joined yet
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* Room Rules Section */}
        <View className="bg-bg dark:bg-[#111113] my-10 px-4">
          <Text className="text-secondary dark:text-gray-100 text-xl font-display font-black tracking-tight mb-4">
            Room Rules
          </Text>

          <View
            className="bg-white dark:bg-[#1C1C20] rounded-3xl p-5 border border-gray-100 dark:border-[#2C2C30]"
            style={{
              shadowColor: "#94A3B8",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            {roomRules.map((rule, index) => (
              <View
                key={rule.title}
                className={`flex flex-row items-start ${index !== roomRules.length - 1 ? "mb-5 pb-5 border-b border-gray-50 dark:border-[#2C2C30]" : ""}`}
              >
                <View className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mr-4">
                  <Ionicons name={rule.icon} size={20} color="#4B5563" />
                </View>
                <View className="flex-1">
                  <Text className="text-secondary dark:text-gray-100 font-bold text-base mb-1">
                    {rule.title}
                  </Text>
                  <Text className="text-muted font-medium text-sm leading-5">
                    {rule.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <GlassContainer
          borderRadius={16}
          style={{
            backgroundColor: isDark
              ? "rgba(239, 68, 68, 0.15)"
              : "rgba(239, 68, 68, 0.05)",
            marginHorizontal: 24,
            marginTop: 28,
          }}
          fallbackClassName="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30"
        >
          {currentUserId === room?.createdBy ? (
            <TouchableOpacity
              onPress={handleDeleteRoom}
              activeOpacity={0.7}
              className="py-4 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="text-red-500 font-semibold text-[15px]">
                Delete Room
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleLeaveRoom}
              activeOpacity={0.7}
              className="py-4 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text className="text-red-500 font-semibold text-[15px]">
                Leave Room
              </Text>
            </TouchableOpacity>
          )}
        </GlassContainer>
      </ScrollView>
      {showOptions && (
        <RoomOptionsModal
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          roomId={roomId}
          currentUserId={currentUserId}
          roomDoc={room}
        />
      )}
    </SafeAreaView>
  );
}
