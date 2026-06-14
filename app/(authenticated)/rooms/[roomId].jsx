import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatMessages from "../../../components/chat/ChatMessages";
import MessageSender from "../../../components/chat/MessageSender";
import RoomDetailsSheet from "../../../components/rooms/RoomDetailsSheet";
import TrustInfoSheet from "../../../components/rooms/TrustInfoSheet";
import GlassButton from "../../../components/ui/GlassButton";
import GlassContainer from "../../../components/ui/GlassContainer";
import { db } from "../../../config/firebase.config";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { RoomSeen } from "../../../lib/chatSeen";
import { sendPushNotification } from "../../../lib/notification";
import { updateTrustOnMessage } from "../../../lib/trust";
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
  Books: "#6366F1",
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
  const [trust, setTrust] = useState(0);
  const [members, setMembers] = useState([]);
  const [uploadingImageUri, setUploadingImageUri] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const { firestoreUser: user } = useFirestoreUser();
  const currentUserId = user?.id;
  const detailsSheetRef = useRef(null);
  const trustSheetRef = useRef(null);

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

  // Load the static room details like title and category
  useEffect(() => {
    if (!roomId) return;
    const loadRoom = async () => {
      const snap = await getDoc(doc(db, "rooms", roomId));
      if (snap.exists()) setRoom({ id: snap.id, ...snap.data() });
    };
    loadRoom();
  }, [roomId]);

  // Listen to the viewer's specific trust level/message count in this room
  useEffect(() => {
    if (!roomId || !currentUserId) return;
    const unsub = onSnapshot(
      doc(db, "rooms", roomId, "trust", currentUserId),
      (snap) => {
        if (snap.exists()) setTrust(snap.data().messagesCount || 0);
      },
    );
    return unsub;
  }, [roomId, currentUserId]);

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
        const trustSnap = await getDocs(
          collection(db, "rooms", roomId, "trust"),
        );
        const trustMap = {};
        trustSnap.forEach((d) => {
          trustMap[d.id] = d.data().messagesCount || 0;
        });
        setMembers(
          profiles.map((p) => ({ ...p, trustScore: trustMap[p.id] || 0 })),
        );
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

      await updateTrustOnMessage(db, roomId, currentUserId, trimmedText);

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
  const trustColor = trust < 3 ? "#EF4444" : trust < 7 ? "#F59E0B" : "#10B981";
  const categoryIcon = CATEGORY_ICONS[room?.category] || "grid";
  const categoryColor = CATEGORY_COLORS[room?.category] || "#0F0F13";

  const handleInfoPress = () => {
    router.push(`/rooms/roomInfo?roomId=${roomId}`);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg dark:bg-[#0F0F13]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="bg-white dark:bg-[#1A1A22] z-10 border-b border-gray-100 dark:border-[#2A2A36]">
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

            <GlassButton onPress={handleInfoPress} size={40} shape="circle">
              <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
            </GlassButton>
          </View>
        </SafeAreaView>
      </View>

      {/* Trust Meter — compact */}
      {trust < 10 && (
        <TouchableOpacity
          className="px-5 pt-3 pb-1"
          onPress={() => trustSheetRef.current?.present()}
        >
          <GlassContainer 
            borderRadius={16} 
            fallbackClassName="bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36]"
            style={{ paddingHorizontal: 16, paddingVertical: 12 }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={trustColor}
                />
                <Text className="text-gray-500 text-xs font-medium ml-1.5">
                  Trust
                </Text>
              </View>
              <Text
                className="text-xs font-semibold"
                style={{ color: trustColor }}
              >
                {trust}/10
              </Text>
            </View>
            <Progress.Bar
              progress={trust / 10}
              width={null}
              color={trustColor}
              unfilledColor="#F3F4F6"
              borderWidth={0}
              height={4}
              borderRadius={2}
              animated={true}
            />
          </GlassContainer>
        </TouchableOpacity>
      )}

      <View className="flex-1">
        <ChatMessages
          messages={messages}
          currentUserId={currentUserId}
          chatDocId={roomId}
          uploadingImageUri={uploadingImageUri}
          collectionName="rooms"
          onReply={(msg) => setReplyTo(msg)}
          onEditMessage={setEditingMessage}
        />
      </View>

      <View className="px-5 py-3 flex items-center pb-6 bg-bg dark:bg-[#0F0F13] border-t border-gray-100 dark:border-[#2A2A36]">
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
      />

      <TrustInfoSheet ref={trustSheetRef} trust={trust} />
    </KeyboardAvoidingView>
  );
}
