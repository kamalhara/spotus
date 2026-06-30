import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatMessages from "../../../components/chat/ChatMessages";
import MessageSender from "../../../components/chat/MessageSender";
import UserOptionsModal from "../../../components/modals/userOptionsModal";
import GlassButton from "../../../components/ui/GlassButton";
import { db } from "../../../config/firebase.config";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import usePresenceStatus from "../../../hook/usePresenceStatus";
import { ChatSeen } from "../../../lib/chatSeen";
import { deleteChatWithMessages } from "../../../lib/deleteRoom";
import { sendPushNotification } from "../../../lib/notification";
import { uploadToCloudinary } from "../../../lib/uploadCloudinary";

export default function ChatId() {
  const { isDark } = useTheme();
  const { chatId, userName, profilePic } = useLocalSearchParams();
  const router = useRouter();
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [uploadingImageUri, setUploadingImageUri] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [chatDoc, setChatDoc] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [messageLimit, setMessageLimit] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Deterministic chat doc ID so both users share the same conversation
  const chatDocId = useMemo(() => {
    if (!currentUserId || !chatId) return null;
    return [currentUserId, chatId].sort().join("_");
  }, [currentUserId, chatId]);

  let isTyping = false;
  if (chatDoc?.typing && currentUserId) {
    for (const [key, val] of Object.entries(chatDoc.typing)) {
      if (key !== currentUserId && val) {
        isTyping = true;
        break;
      }
    }
  }

  const userStatus = usePresenceStatus(otherUser?.lastSeen);

  // Create or merge the chat document
  useEffect(() => {
    if (!chatDocId || !currentUserId || !chatId) return;

    const createChat = async () => {
      const ref = doc(db, "chats", chatDocId);
      const snap = await getDoc(ref);

      // ✅ only first time create
      if (!snap.exists()) {
        await setDoc(ref, {
          participants: [currentUserId, chatId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: "",
          lastMessageAt: null,
        });
      } else {
        // 🔄 only update activity
        await setDoc(
          ref,
          {
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
    };

    createChat();
  }, [chatDocId, currentUserId, chatId]);

  useEffect(() => {
    if (!chatId) return;

    const unsub = onSnapshot(doc(db, "users", chatId), (snap) => {
      setOtherUser(snap.data());
    });

    return unsub;
  }, [chatId, currentUserId]);

  // Listen to last 50 messages for performance
  useEffect(() => {
    if (!chatDocId) return;
    const q = query(
      collection(db, "chats", chatDocId, "messages"),
      orderBy("createdAt", "asc"),
      limitToLast(messageLimit),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((msg) => !msg.deletedFor?.includes(currentUserId));
      setMessages(msgs);
      setIsLoadingMore(false);
    });
    return unsub;
  }, [chatDocId, currentUserId, messageLimit]);

  const handleLoadMore = () => {
    if (messages.length >= messageLimit) {
      setIsLoadingMore(true);
      setMessageLimit((prev) => prev + 50);
    }
  };

  // Listen to chat doc for mute status
  useEffect(() => {
    if (!chatDocId) return;
    const unsub = onSnapshot(doc(db, "chats", chatDocId), (snap) => {
      if (snap.exists()) setChatDoc(snap.data());
    });
    return unsub;
  }, [chatDocId]);
  useEffect(() => {
    if (!chatDocId || !currentUserId) return;
    ChatSeen(chatDocId, currentUserId, messages, chatDoc);
  }, [chatDocId, currentUserId, messages, chatDoc]);

  const handleEditMessage = async (messageId, newText) => {
    if (!newText.trim() || !chatDocId) return;
    try {
      await setDoc(
        doc(db, "chats", chatDocId, "messages", messageId),
        { text: newText.trim(), isEdited: true },
        { merge: true },
      );
      setEditingMessage(null);
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  // Send a message
  const handleSend = async (text) => {
    if (!text.trim() || !chatDocId) return;
    try {
      await addDoc(collection(db, "chats", chatDocId, "messages"), {
        text: text.trim(),
        senderId: currentUserId,
        user: firestoreUser?.userName || "Unknown",
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
      // Update the chat's last activity and message preview
      await setDoc(
        doc(db, "chats", chatDocId),
        {
          updatedAt: serverTimestamp(),
          lastMessage: text.trim(),
          lastMessageAt: serverTimestamp(),
          lastMessageSenderId: currentUserId,
          lastMessageSeenBy: [currentUserId],
        },
        { merge: true },
      );
      // Send push notification only if the other user hasn't muted the chat
      const isMutedByRecipient = chatDoc?.mutedBy?.includes(chatId);
      if (!isMutedByRecipient) {
        sendPushNotification(
          chatId,
          currentUserId,
          firestoreUser?.userName || "New message",
          text.trim(),
          { type: "message", screen: "dm", chatId, chatDocId },
        );
      }
    } catch (err) {
      console.error("Error sending DM:", err);
    }
  };
  const handleSendImage = async (uri) => {
    if (!uri) return;
    setUploadingImageUri(uri);

    try {
      const imageUrl = await uploadToCloudinary(uri);
      if (!imageUrl) {
        setUploadingImageUri(null);
        return;
      }

      await addDoc(collection(db, "chats", chatDocId, "messages"), {
        type: "image",
        imageUrl,
        senderId: currentUserId,
        user: firestoreUser?.userName || "Unknown",
        createdAt: serverTimestamp(),
        seenBy: [currentUserId],
      });
      await setDoc(
        doc(db, "chats", chatDocId),
        {
          updatedAt: serverTimestamp(),
          lastMessage: "📷 Photo",
          lastMessageAt: serverTimestamp(),
          lastMessageSenderId: currentUserId,
          lastMessageSeenBy: [currentUserId],
        },
        { merge: true },
      );
      // Send push notification only if the other user hasn't muted the chat
      const isMutedByRecipient = chatDoc?.mutedBy?.includes(chatId);
      if (!isMutedByRecipient) {
        sendPushNotification(
          chatId,
          currentUserId,
          firestoreUser?.userName || "New message",
          "📷 Sent a photo",
          { type: "message", screen: "dm", chatId, chatDocId },
        );
      }
    } catch (err) {
      console.error("Error sending Image", err);
    } finally {
      setUploadingImageUri(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-3"
          style={{
            shadowColor: "#94A3B8",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center gap-3 flex-1 mr-2">
            <GlassButton onPress={() => router.back()} size={40} shape="circle">
              <Ionicons
                name="chevron-back"
                size={20}
                color={isDark ? "white" : "#18181B"}
              />
            </GlassButton>
            <TouchableOpacity
              className="flex-row items-center gap-3 flex-1"
              onPress={() =>
                router.push({
                  pathname: "/(authenticated)/users/[userId]",
                  params: { userId: chatId },
                })
              }
            >
              <Image
                source={{ uri: profilePic || "https://picsum.photos/200" }}
                className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800"
              />
              <View className="flex-1">
                <Text
                  className="text-secondary dark:text-gray-100 font-bold text-base"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {userName}
                </Text>
                <View
                  className="flex-row items-center mt-0.5"
                  style={{ minHeight: 16 }}
                >
                  {isTyping ? (
                    <Text
                      style={{
                        color: "#FF6B47",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      Typing...
                    </Text>
                  ) : (
                    <>
                      <View
                        className={`w-1.5 h-1.5 ${
                          userStatus === "Active now"
                            ? "bg-green-400"
                            : "bg-gray-400"
                        } rounded-full mr-1`}
                      />
                      <Text className="text-gray-400 text-xs">
                        {userStatus}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <GlassButton
            onPress={() => setShowOptions(true)}
            size={40}
            shape="circle"
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
          </GlassButton>
        </View>

        {/* Messages */}
        <View className="flex-1">
          <ChatMessages
            messages={messages}
            currentUserId={currentUserId}
            chatDocId={chatDocId}
            uploadingImageUri={uploadingImageUri}
            collectionName="chats"
            onReply={(msg) => setReplyTo(msg)}
            onEditMessage={setEditingMessage}
            isTyping={isTyping}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
          />
        </View>

        {/* Input or Pending State */}
        {chatDoc?.status === "pending" ? (
          <View className="px-5 py-6">
            {chatDoc.senderId === currentUserId ? (
              <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 items-center">
                <Ionicons name="time-outline" size={24} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 font-medium text-center mt-2">
                  Waiting for {otherUser?.userName || "user"} to accept your
                  request.
                </Text>
              </View>
            ) : (
              <View className="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-3xl p-5 shadow-sm shadow-black/5">
                <Text className="text-secondary dark:text-gray-100 font-bold text-center mb-1">
                  Message Request
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mb-5">
                  {otherUser?.userName || "This user"} wants to chat with you.
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={async () => {
                      await deleteChatWithMessages(chatDocId);
                      router.replace("/home");
                    }}
                    className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center"
                  >
                    <Text className="text-gray-600 dark:text-gray-300 font-bold">
                      Decline
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      await updateDoc(doc(db, "chats", chatDocId), {
                        status: "accepted",
                        updatedAt: serverTimestamp(),
                      });
                    }}
                    className="flex-1 py-3.5 bg-primary rounded-2xl items-center"
                  >
                    <Text className="text-white font-bold">Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View className="px-5 pt-3">
            <MessageSender
              handleSend={handleSend}
              chatId={chatDocId}
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
        )}
        {showOptions && (
          <UserOptionsModal
            showOptions={showOptions}
            setShowOptions={setShowOptions}
            chatId={chatDocId}
            currentUserId={currentUserId}
            chatDoc={chatDoc}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
