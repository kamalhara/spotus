import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
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
import GhostModeBanner from "../../../components/shared/GhostModeBanner";
import GlassButton from "../../../components/ui/GlassButton";
import GlassContainer from "../../../components/ui/GlassContainer";
import { db } from "../../../config/firebase.config";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { RoomSeen } from "../../../lib/chatSeen";
import { sendPushNotification } from "../../../lib/notification";
import { uploadToCloudinary } from "../../../lib/uploadCloudinary";
import { fetchUserBatch } from "../../../lib/userCache";

import CustomButton from "../../../components/ui/CustomButton";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../../constants/categories";
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

  const [roomExpired, setRoomExpired] = useState(false);
  const expiredFade = useRef(new Animated.Value(0)).current;

  const [messageLimit, setMessageLimit] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { firestoreUser: user } = useFirestoreUser();
  const currentUserId = user?.id;
  const detailsSheetRef = useRef(null);

  const { roomId } = useLocalSearchParams();

  // Subscribe to real-time message updates for this room
  // Load last 50 messages for performance. Older messages are
  // rarely needed and can be loaded on demand in the future.
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc"),
      limitToLast(messageLimit),
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
      setIsLoadingMore(false);
    });
    return unsub;
  }, [currentUserId, roomId, user?.blockedUsers, messageLimit]);

  const handleLoadMore = () => {
    if (messages.length >= messageLimit) {
      setIsLoadingMore(true);
      setMessageLimit((prev) => prev + 50);
    }
  };

  // Mark room messages as seen when entering
  useEffect(() => {
    if (!roomId || !currentUserId) return;
    RoomSeen(roomId, currentUserId, messages, room);
  }, [roomId, currentUserId, messages, room]);

  // Load the room details in real-time
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() });
      } else {
        // Room was deleted
        setRoomExpired(true);
        Animated.timing(expiredFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
    return unsub;
  }, [roomId, expiredFade]);

  // Check room expiration every second while inside the room
  useEffect(() => {
    if (!room?.expiresAt || roomExpired) return;

    const checkExpiry = () => {
      const expiresMs = room.expiresAt.seconds
        ? room.expiresAt.seconds * 1000
        : room.expiresAt instanceof Date
          ? room.expiresAt.getTime()
          : room.expiresAt;

      if (Date.now() >= expiresMs) {
        setRoomExpired(true);
        Animated.timing(expiredFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [room?.expiresAt, roomExpired, expiredFade]);

  const handleExpiredDismiss = useCallback(() => {
    router.replace("/(authenticated)/(tabs)/home");
  }, [router]);

  // Fetch member profiles using batched cache instead of sequential getDoc
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!room?.participants?.length) return;
      try {
        const profiles = await Promise.all(
          room.participants.map(async (uid) => {
            const data = await fetchUserBatch(uid);
            return data ? { id: uid, ...data } : null;
          }),
        );
        setMembers(profiles.filter(Boolean));
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
          currentUserId,
          `${user?.userName || "Someone"} in ${room?.title || "Room"}`,
          trimmedText,
          { type: "room", screen: "room", roomId },
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
          currentUserId,
          `${user?.userName || "Someone"} in ${room?.title || "Room"}`,
          "📷 Sent a photo",
          { type: "room", screen: "room", roomId },
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
        },
      });
    } catch (error) {
      console.error("Failed to pin message:", error);
    }
  };

  const handleUnpinMessage = async () => {
    if (!room || room.createdBy !== currentUserId) return;
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        pinnedMessage: null,
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

  const handleShare = async () => {
    try {
      const inviteLink = Linking.createURL("join/" + room?.inviteCode);
      await Share.share({
        message: `Join my event: ${room?.title} on SpotUs! Use invite code ${room?.inviteCode} or tap here: ${inviteLink}`,
      });
    } catch (error) {
      console.error("Error sharing room:", error);
    }
  };

  return (
    <>
      <Modal
        visible={roomExpired}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <Animated.View
          style={{ flex: 1, opacity: expiredFade }}
          className="bg-black/60 items-center justify-center px-6"
        >
          <View className="w-full max-w-[340px] rounded-[32px] overflow-hidden">
            <GlassContainer
              intensity={isDark ? 30 : 60}
              tint={isDark ? "dark" : "light"}
              borderRadius={32}
              style={{
                padding: 32,
                alignItems: "center",
              }}
              fallbackClassName="bg-white/90 dark:bg-[#1C1C20]/90"
            >
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6 border border-primary/20">
                <Ionicons name="time" size={40} color="#FF6B47" />
              </View>

              <Text className="text-secondary dark:text-white text-2xl font-display font-extrabold text-center mb-3">
                Room Expired
              </Text>

              <Text className="text-gray-500 dark:text-gray-300 text-sm text-center leading-6 mb-8 font-medium">
                This room&apos;s time is up! All messages and content will be
                securely cleaned up.
              </Text>

              <CustomButton
                title="Return to Home"
                onPress={handleExpiredDismiss}
              />
            </GlassContainer>
          </View>
        </Animated.View>
      </Modal>

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
                  <Ionicons
                    name={categoryIcon}
                    size={18}
                    color={categoryColor}
                  />
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
                <GlassButton
                  onPress={handleShare}
                  size={40}
                  shape="circle"
                  style={{ marginRight: 8 }}
                >
                  <Ionicons name="share-outline" size={18} color="#9CA3AF" />
                </GlassButton>
                <GlassButton onPress={handleInfoPress} size={40} shape="circle">
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={18}
                    color="#9CA3AF"
                  />
                </GlassButton>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Ghost Mode Banner */}
        <GhostModeBanner
          room={room}
          showGhostBanner={showGhostBanner}
          setShowGhostBanner={setShowGhostBanner}
          onShare={handleShare}
        />

        {/* Pinned Message Banner */}
        {room?.pinnedMessage && (
          <View className="px-5 pt-2 pb-1 z-10">
            <GlassContainer
              borderRadius={16}
              fallbackClassName="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30"
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: isDark
                  ? "rgba(59,130,246,0.1)"
                  : "rgba(239,246,255,0.8)",
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="pin" size={14} color="#3B82F6" />
                    <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold ml-1.5 uppercase tracking-widest">
                      Pinned Announcement
                    </Text>
                  </View>
                  <Text
                    className="text-secondary dark:text-gray-200 text-sm font-semibold"
                    numberOfLines={2}
                  >
                    <Text className="font-bold text-primary dark:text-primary-light">
                      {room.pinnedMessage.senderName}:{" "}
                    </Text>
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
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
          />
        </View>

        <View className="px-5 pt-3 flex items-center bg-bg dark:bg-[#111113] border-t border-gray-100 dark:border-[#2C2C30]">
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
    </>
  );
}
