import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatMessages from "../../../components/chat/ChatMessages";
import MessageSender from "../../../components/chat/MessageSender";
import RoomDetailsSheet from "../../../components/rooms/RoomDetailsSheet";
import GlassButton from "../../../components/ui/GlassButton";
import GlassContainer from "../../../components/ui/GlassContainer";
import { db } from "../../../config/firebase.config";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { RoomSeen } from "../../../lib/chatSeen";
import { sendPushNotification } from "../../../lib/notification";
import { uploadToCloudinary } from "../../../lib/uploadCloudinary";

const CATEGORY_ICONS = {
  Music: "musical-notes",
  Coffee: "cafe",
  Art: "color-palette",
  Books: "book",
  Tech: "code-slash",
  Food: "restaurant",
  Fashion: "shirt",
  Sports: "football",
  "Local Events": "calendar",
};
const CATEGORY_COLORS = {
  Music: "#8B5CF6",
  Coffee: "#D97706",
  Art: "#EC4899",
  Books: "#FF8566",
  Tech: "#3B82F6",
  Food: "#EF4444",
  Fashion: "#F59E0B",
  Sports: "#10B981",
  "Local Events": "#14B8A6",
};
export default function RoomChat() {
  const { isDark } = useTheme();
  const router = useRouter();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [uploadingImageUri, setUploadingImageUri] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showGhostBanner, setShowGhostBanner] = useState(true);
  const [copied, setCopied] = useState(false);

  const { firestoreUser: user } = useFirestoreUser();
  const currentUserId = user?.id;
  const detailsSheetRef = useRef(null);

  const { roomId } = useLocalSearchParams();

  // Subscribe to real-time message updates for this room
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (msg) =>
            !msg.deletedFor?.includes(currentUserId) &&
            !user?.blockedUsers?.includes(msg.senderId),
        );
      setMessages(msgs);
    });
    return unsub;
  }, [currentUserId, roomId, user?.blockedUsers]);

  // Mark room messages as seen when entering
  useEffect(() => {
    if (!roomId || !currentUserId) return;
    RoomSeen(roomId, currentUserId);
  }, [roomId, currentUserId]);

  // Load the room details in real-time
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() });
      }
    });
    return unsub;
  }, [roomId]);

  // Fetch profiles and trust scores for all members in the room
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!room?.participants?.length) return;
      try {
        const profiles = [];
        for (const uid of room.participants) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists())
            profiles.push({ id: userDoc.id, ...userDoc.data() });
        }
        setMembers(profiles);
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    };
    fetchMemberData();
  }, [room?.participants, roomId]);

  const handleEditMessage = async (messageId, newText) => {
    if (!newText.trim() || !roomId) return;
    try {
      await updateDoc(doc(db, "rooms", roomId, "messages", messageId), {
        text: newText.trim(),
        isEdited: true,
      });
      setEditingMessage(null);
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const trimmedText = text.trim();
    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: trimmedText,
        senderId: currentUserId || "unknown-id",
        user: user?.userName || "Unknown",
        profilePic: user?.profilePic || null,
        createdAt: serverTimestamp(),
        seenBy: [currentUserId],
        reactions: {},
        ...(replyTo
          ? {
              replyTo: {
                id: replyTo.id,
                text: replyTo.text || "",
                user: replyTo.user || "Unknown",
                imageUrl: replyTo.imageUrl || null,
              },
            }
          : {}),
      });
      setReplyTo(null);

      // Sync the parent room document with last message metadata
      await updateDoc(doc(db, "rooms", roomId), {
        lastMessage: trimmedText,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: currentUserId,
        lastMessageSeenBy: [currentUserId],
      });

      // Notify all other room participants
      const otherParticipants = (room?.participants || []).filter(
        (uid) => uid !== currentUserId,
      );
      otherParticipants.forEach((uid) => {
        sendPushNotification(
          uid,
          `${user?.userName || "Someone"} in ${room?.title || "Room"}`,
          trimmedText,
          { screen: "room", roomId },
        );
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSendImage = async (uri) => {
    if (!uri || !roomId) return;
    setUploadingImageUri(uri);

    try {
      const imageUrl = await uploadToCloudinary(uri);
      if (!imageUrl) {
        setUploadingImageUri(null);
        return;
      }

      await addDoc(collection(db, "rooms", roomId, "messages"), {
        type: "image",
        imageUrl,
        senderId: currentUserId,
        user: user?.userName || "Unknown",
        profilePic: user?.profilePic || null,
        createdAt: serverTimestamp(),
        seenBy: [currentUserId],
      });

      await updateDoc(doc(db, "rooms", roomId), {
        lastMessage: "📷 Photo",
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: currentUserId,
        lastMessageSeenBy: [currentUserId],
      });
      // Notify all other room participants about the image
      const otherParticipants = (room?.participants || []).filter(
        (uid) => uid !== currentUserId,
      );
      otherParticipants.forEach((uid) => {
        sendPushNotification(
          uid,
          `${user?.userName || "Someone"} in ${room?.title || "Room"}`,
          "📷 Sent a photo",
          { screen: "room", roomId },
        );
      });
    } catch (err) {
      console.error("Room image send error:", err);
    } finally {
      setUploadingImageUri(null);
    }
  };
  const handleKickUser = async (kickUserId) => {
    if (!room || room.createdBy !== currentUserId) return;
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        participants: arrayRemove(kickUserId),
        bannedUsers: arrayUnion(kickUserId),
      });
      // Filter out the banned member from local state to reflect UI immediately
      setMembers((prev) => prev.filter((m) => m.id !== kickUserId));
    } catch (error) {
      console.error("Failed to kick user:", error);
    }
  };

  const handlePinMessage = async (message) => {
    if (!room || room.createdBy !== currentUserId) return;
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        pinnedMessage: {
          id: message.id,
          text: message.text || "📷 Photo",
          senderName: message.user || "Someone",
          senderId: message.senderId,
        }
      });
    } catch (error) {
      console.error("Failed to pin message:", error);
    }
  };

  const handleUnpinMessage = async () => {
    if (!room || room.createdBy !== currentUserId) return;
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        pinnedMessage: null
      });
    } catch (error) {
      console.error("Failed to unpin message:", error);
    }
  };

  const isHost = room?.createdBy === currentUserId;
  const categoryIcon = CATEGORY_ICONS[room?.category] || "grid";
  const categoryColor = CATEGORY_COLORS[room?.category] || "#111113";

  const handleInfoPress = () => {
    router.push(`/rooms/roomInfo?roomId=${roomId}`);
  };

  const handleCopyCode = async () => {
    if (room?.inviteCode) {
      await Clipboard.setStringAsync(room?.inviteCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    try {
      const inviteLink = `spotus.app/join/${room?.inviteCode}`;
      await Share.share({
        message: `Join my event: ${room?.title} on SpotUs! Use invite code ${room?.inviteCode} or tap here: ${inviteLink}`,
      });
    } catch (error) {
      console.error("Error sharing room:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg dark:bg-[#111113]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="bg-white dark:bg-[#1C1C20] z-10 border-b border-gray-100 dark:border-[#2C2C30]">
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center justify-between px-5 py-3">
            <View className="flex-row items-center flex-1">
              <GlassButton
                onPress={() => router.back()}
                size={40}
                shape="circle"
                style={{ marginRight: 12 }}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={isDark ? "white" : "#18181B"}
                />
              </GlassButton>

              <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center mr-3">
                <Ionicons name={categoryIcon} size={18} color={categoryColor} />
              </View>

              <TouchableOpacity
                className="flex-1"
                onPress={() => detailsSheetRef.current?.present()}
                activeOpacity={0.7}
              >
                <Text
                  className="text-secondary dark:text-gray-100 text-base font-display font-extrabold"
                  numberOfLines={1}
                >
                  {room?.title || "Loading..."}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-gray-400 dark:text-gray-500 text-xs">
                    {room?.category || "Room"} ·{""}
                    {room?.participants?.length || 0} members
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              <GlassButton onPress={handleShare} size={40} shape="circle" style={{ marginRight: 8 }}>
                <Ionicons name="share-outline" size={18} color="#9CA3AF" />
              </GlassButton>
              <GlassButton onPress={handleInfoPress} size={40} shape="circle">
                <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
              </GlassButton>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Ghost Mode Banner */}
      {room?.visibility === "ghost" && showGhostBanner && (
        <View className="px-5 pt-3 pb-1">
          <GlassContainer 
            borderRadius={16} 
            fallbackClassName="bg-purple-50 dark:bg-[#2A1635] border border-purple-200 dark:border-[#4B2261]"
            style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: isDark ? "#2A1635" : "#FAF5FF" }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-1.5">
                  <MaterialCommunityIcons name="ghost" size={16} color="#A855F7" />
                  <Text className="text-purple-600 dark:text-purple-300 text-xs font-bold ml-1.5 uppercase tracking-widest">
                    Ghost Mode Active
                  </Text>
                </View>
                <Text className="text-purple-500 dark:text-purple-400 text-xs leading-4 pr-2">
                  Share this code with friends so they can join the event:
                </Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setShowGhostBanner(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color="#A855F7" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/30">
              <TouchableOpacity
                 onPress={handleCopyCode}
                 activeOpacity={0.7}
                 className="bg-white dark:bg-[#1C1C20] border border-purple-100 dark:border-purple-800/50 px-4 py-2.5 rounded-xl flex-row items-center mr-3"
              >
                <Text className="text-purple-700 dark:text-purple-300 font-display font-black tracking-[3px] text-[17px] mr-2">
                  {copied ? "COPIED" : room?.inviteCode}
                </Text>
                <Ionicons name={copied ? "checkmark-outline" : "copy-outline"} size={14} color="#A855F7" />
              </TouchableOpacity>

              <TouchableOpacity
                 onPress={handleShare}
                 activeOpacity={0.7}
                 className="bg-purple-600 px-4 py-2.5 rounded-xl flex-row items-center flex-1 justify-center"
              >
                <Ionicons name="share-outline" size={14} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white text-xs font-bold">Share Link</Text>
              </TouchableOpacity>
            </View>
          </GlassContainer>
        </View>
      )}

      {/* Pinned Message Banner */}
      {room?.pinnedMessage && (
        <View className="px-5 pt-2 pb-1 z-10">
          <GlassContainer
            borderRadius={16}
            fallbackClassName="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30"
            style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: isDark ? "rgba(59,130,246,0.1)" : "rgba(239,246,255,0.8)" }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="pin" size={14} color="#3B82F6" />
                  <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold ml-1.5 uppercase tracking-widest">
                    Pinned Announcement
                  </Text>
                </View>
                <Text className="text-secondary dark:text-gray-200 text-sm font-semibold" numberOfLines={2}>
                  <Text className="font-bold text-primary dark:text-primary-light">{room.pinnedMessage.senderName}: </Text>
                  {room.pinnedMessage.text}
                </Text>
              </View>
              {isHost && (
                <TouchableOpacity
                  onPress={handleUnpinMessage}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="bg-white/50 dark:bg-black/20 p-1.5 rounded-full"
                >
                  <Ionicons name="close" size={16} color="#3B82F6" />
                </TouchableOpacity>
              )}
            </View>
          </GlassContainer>
        </View>
      )}

      <View className="flex-1">
        <ChatMessages
          messages={messages}
          currentUserId={currentUserId}
          chatDocId={roomId}
          collectionName="rooms"
          uploadingImageUri={uploadingImageUri}
          onReply={setReplyTo}
          onEditMessage={setEditingMessage}
          isHost={isHost}
          onKickUser={handleKickUser}
          onPinMessage={handlePinMessage}
        />
      </View>

      <View className="px-5 py-3 flex items-center pb-6 bg-bg dark:bg-[#111113] border-t border-gray-100 dark:border-[#2C2C30]">
        <MessageSender
          handleSend={handleSend}
          chatId={roomId}
          currentUserId={currentUserId}
          handleSendImage={handleSendImage}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          setReplyTo={setReplyTo}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          handleEditMessage={handleEditMessage}
        />
      </View>

      <RoomDetailsSheet
        ref={detailsSheetRef}
        room={room}
        members={members}
        currentUserId={currentUserId}
        isHost={isHost}
        onKickUser={handleKickUser}
      />
    </KeyboardAvoidingView>
  );
}
