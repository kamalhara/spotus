import { useAuth } from "@clerk/expo";
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
  Platform,
  Share,
  View,
} from "react-native";
import ChatMessages from "../../../components/chat/ChatMessages";
import MessageSender from "../../../components/chat/MessageSender";
import ExpiredRoomModal from "../../../components/rooms/chat/ExpiredRoomModal";
import PinnedMessageBanner from "../../../components/rooms/chat/PinnedMessageBanner";
import RoomChatHeader from "../../../components/rooms/chat/RoomChatHeader";
import RoomDetailsSheet from "../../../components/rooms/RoomDetailsSheet";
import GhostModeBanner from "../../../components/shared/GhostModeBanner";
import { db } from "../../../config/firebase.config";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { RoomSeen } from "../../../lib/chatSeen";
import { sendBatchNotification } from "../../../lib/notification";
import { uploadToCloudinary } from "../../../lib/uploadCloudinary";
import { sendRoomMessage } from "../../../lib/roomMessages";
import { fetchUserBatch } from "../../../lib/userCache";

import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../../constants/categories";
export default function RoomChat() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { getToken } = useAuth();

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
    const interval = setInterval(checkExpiry, 10000);
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
      const token = await getToken();
      const result = await sendRoomMessage(roomId, trimmedText, replyTo, token);
      setReplyTo(null);
      sendBatchNotification(
        result.participantIds,
        currentUserId,
        `${result.senderName} in ${result.roomTitle}`,
        trimmedText,
        { type: "room", screen: "room", roomId },
        token
      );
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSendImage = async (uri) => {
    if (!uri || !roomId) return;
    setUploadingImageUri(uri);

    try {
      const uploadToken = await getToken();
      const uploadResult = await uploadToCloudinary(uri, uploadToken);
      if (!uploadResult?.imageUrl) {
        setUploadingImageUri(null);
        return;
      }

      await addDoc(collection(db, "rooms", roomId, "messages"), {
        type: "image",
        imageUrl: uploadResult.imageUrl,
        cloudinaryPublicId: uploadResult.cloudinaryPublicId,
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
      const token = await getToken();
      sendBatchNotification(
        otherParticipants,
        currentUserId,
        `${user?.userName || "Someone"} in ${room?.title || "Room"}`,
        "📷 Sent a photo",
        { type: "room", screen: "room", roomId },
        token
      );
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
      <ExpiredRoomModal
        visible={roomExpired}
        opacity={expiredFade}
        isDark={isDark}
        onDismiss={handleExpiredDismiss}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-bg dark:bg-[#111113]"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <RoomChatHeader
          room={room}
          categoryIcon={categoryIcon}
          categoryColor={categoryColor}
          isDark={isDark}
          onBack={() => router.back()}
          onDetails={() => detailsSheetRef.current?.present()}
          onShare={handleShare}
          onInfo={handleInfoPress}
        />

        {/* Ghost Mode Banner */}
        <GhostModeBanner
          room={room}
          showGhostBanner={showGhostBanner}
          setShowGhostBanner={setShowGhostBanner}
          onShare={handleShare}
        />

        <PinnedMessageBanner
          pinnedMessage={room?.pinnedMessage}
          isHost={isHost}
          isDark={isDark}
          onUnpin={handleUnpinMessage}
        />

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
