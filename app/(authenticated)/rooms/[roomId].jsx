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
import ChatMessages from "../../../components/ChatMessages";
import MessageSender from "../../../components/MessageSender";
import RoomDetailsSheet from "../../../components/RoomDetailsSheet";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { updateTrustOnMessage } from "../../../lib/trust";

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

export default function RoomChat() {
  const router = useRouter();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [trust, setTrust] = useState(0);
  const [members, setMembers] = useState([]);

  const { firestoreUser: user } = useFirestoreUser();
  const currentUserId = user?.id;
  const detailsSheetRef = useRef(null);

  const { roomId } = useLocalSearchParams();

  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const loadRoom = async () => {
      const snap = await getDoc(doc(db, "rooms", roomId));
      if (snap.exists()) setRoom({ id: snap.id, ...snap.data() });
    };
    loadRoom();
  }, [roomId]);

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

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!room?.participants?.length) return;
      try {
        const profiles = [];
        for (const uid of room.participants) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) profiles.push({ id: userDoc.id, ...userDoc.data() });
        }
        const trustSnap = await getDocs(collection(db, "rooms", roomId, "trust"));
        const trustMap = {};
        trustSnap.forEach((d) => { trustMap[d.id] = d.data().messagesCount || 0; });
        setMembers(profiles.map((p) => ({ ...p, trustScore: trustMap[p.id] || 0 })));
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    };
    fetchMemberData();
  }, [room?.participants, roomId]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const trimmedText = text.trim();
    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: trimmedText,
        senderId: currentUserId || "unknown-id",
        user: user?.userName || "Unknown",
        createdAt: serverTimestamp(),
      });
      await updateTrustOnMessage(db, roomId, currentUserId, trimmedText);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const trustColor =
    trust < 3 ? "#EF4444" : trust < 7 ? "#F59E0B" : "#10B981";
  const categoryIcon = CATEGORY_ICONS[room?.category] || "grid";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="bg-white z-10 border-b border-gray-100">
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center justify-between px-5 py-3">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="chevron-back" size={20} color="#18181B" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1"
                onPress={() => detailsSheetRef.current?.present()}
                activeOpacity={0.7}
              >
                <Text
                  className="text-secondary text-base font-bold"
                  numberOfLines={1}
                >
                  {room?.title || "Loading..."}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Ionicons name={categoryIcon} size={10} color="#9CA3AF" style={{ marginRight: 4 }} />
                  <Text className="text-gray-400 text-xs">
                    {room?.participants?.length || 0} members
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Trust Meter — compact */}
      {trust < 10 && (
        <View className="px-5 pt-3 pb-1">
          <View className="bg-white px-4 py-3 rounded-xl border border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark-outline" size={14} color={trustColor} />
                <Text className="text-gray-500 text-xs font-medium ml-1.5">
                  Trust
                </Text>
              </View>
              <Text className="text-xs font-semibold" style={{ color: trustColor }}>
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
          </View>
        </View>
      )}

      <View className="flex-1">
        <ChatMessages messages={messages} currentUserId={currentUserId} />
      </View>

      <View className="px-5 py-3 flex items-center pb-6">
        <MessageSender handleSend={handleSend} />
      </View>

      <RoomDetailsSheet
        ref={detailsSheetRef}
        room={room}
        members={members}
        currentUserId={currentUserId}
      />
    </KeyboardAvoidingView>
  );
}
