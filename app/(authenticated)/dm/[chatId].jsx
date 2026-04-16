import { Ionicons } from "@expo/vector-icons";
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
  setDoc,
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
import ChatMessages from "../../../components/ChatMessages";
import MessageSender from "../../../components/MessageSender";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import useTypingIndicator from "../../../hook/useTypingIndicator";
import { ChatSeen } from "../../../lib/chatSeen";
import { uploadToCloudinary } from "../../../lib/uploadCloudinary";

export default function ChatId() {
  const { chatId, userName, profilePic } = useLocalSearchParams();
  const router = useRouter();
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;
  const [messages, setMessages] = useState([]);

  // Deterministic chat doc ID so both users share the same conversation
  const chatDocId = useMemo(() => {
    if (!currentUserId || !chatId) return null;
    return [currentUserId, chatId].sort().join("_");
  }, [currentUserId, chatId]);

  const isTyping = useTypingIndicator(chatDocId, currentUserId);

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

  // Listen to messages
  useEffect(() => {
    if (!chatDocId) return;
    const q = query(
      collection(db, "chats", chatDocId, "messages"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [chatDocId]);
  useEffect(() => {
    if (!chatDocId || !currentUserId) return;
    ChatSeen(chatDocId, currentUserId);
  }, [chatDocId, currentUserId]);

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
      });
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
    } catch (err) {
      console.error("Error sending DM:", err);
    }
  };
  const handleSendImage = async (uri) => {
    if (!uri) return;

    try {
      const imageUrl = await uploadToCloudinary(uri);
      if (!imageUrl) return;

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
    } catch (err) {
      console.error("Error sending Image", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-3.5 pt-1">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={20} color="#18181B" />
            </TouchableOpacity>
            <Image
              source={{ uri: profilePic || "https://picsum.photos/200" }}
              className="w-11 h-11 rounded-full bg-gray-100"
            />
            <View>
              <Text className="text-secondary font-bold text-base">
                {userName}
              </Text>
              <View
                className="flex-row items-center mt-0.5"
                style={{ minHeight: 16 }}
              >
                {isTyping ? (
                  <Text
                    style={{
                      color: "#4F46E5",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    Typing...
                  </Text>
                ) : (
                  <>
                    <View className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1" />
                    <Text className="text-gray-400 text-xs">Active now</Text>
                  </>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View className="flex-1">
          <ChatMessages
            messages={messages}
            currentUserId={currentUserId}
            chatDocId={chatDocId}
          />
        </View>

        {/* Input */}
        <View className="px-5 py-3 pb-5">
          <MessageSender
            handleSend={handleSend}
            chatId={chatDocId}
            currentUserId={currentUserId}
            handleSendImage={handleSendImage}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
