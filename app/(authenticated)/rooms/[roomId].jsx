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

  // Sheet Refs
  const detailsSheetRef = useRef(null);

  const { roomId } = useLocalSearchParams();
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(msgs);
    });

    return unsub;
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const loadRoom = async () => {
      const roomRef = doc(db, "rooms", roomId);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() });
      }
    };

    loadRoom();
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !currentUserId) return;
    const trustRef = doc(db, "rooms", roomId, "trust", currentUserId);
    const unsub = onSnapshot(trustRef, (snap) => {
      if (snap.exists()) {
        setTrust(snap.data().messagesCount || 0);
      }
    });
    return unsub;
  }, [roomId, currentUserId]);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!room?.participants?.length) return;

      try {
        // Fetch User Profiles
        const profiles = [];
        for (const userId of room.participants) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            profiles.push({ id: userDoc.id, ...userDoc.data() });
          }
        }

        // Fetch Trust Scores for everyone in this room
        const trustSnap = await getDocs(
          collection(db, "rooms", roomId, "trust"),
        );
        const trustMap = {};
        trustSnap.forEach((d) => {
          trustMap[d.id] = d.data().messagesCount || 0;
        });

        // Combine data
        const membersWithTrust = profiles.map((p) => ({
          ...p,
          trustScore: trustMap[p.id] || 0,
        }));

        setMembers(membersWithTrust);
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

      // Update both room and global trust
      await updateTrustOnMessage(db, roomId, currentUserId, trimmedText);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const trustPercentage = Math.min(trust * 10, 100);
  const trustColor =
    trustPercentage < 30 ? "#EF4444" : trustPercentage < 70 ? "#F59E0B" : "#10B981";
  const categoryIcon = CATEGORY_ICONS[room?.category] || "grid";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Premium Header */}
      <View className="bg-white z-10 border-b border-border-light">
        <SafeAreaView edges={["top"]}>
          <View className="flex flex-row items-center justify-between px-5 py-3.5">
            <View className="flex flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-surface-alt rounded-2xl items-center justify-center mr-3.5"
              >
                <Ionicons name="chevron-back" size={20} color="#18181B" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1"
                onPress={() => detailsSheetRef.current?.present()}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 bg-primary/10 rounded-xl items-center justify-center">
                    <Ionicons name={categoryIcon} size={14} color="#4F46E5" />
                  </View>
                  <View>
                    <Text
                      className="text-secondary text-[17px] font-black tracking-tight"
                      numberOfLines={1}
                    >
                      {room?.title || "Loading..."}
                    </Text>
                    <View className="flex flex-row items-center mt-0.5">
                      <View className="bg-success w-1.5 h-1.5 rounded-full mr-1.5" />
                      <Text className="text-muted text-[9px] font-bold uppercase tracking-[1.5px]">
                        {room?.participants?.length || 0} active
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="w-10 h-10 bg-surface-alt rounded-2xl items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Trust Meter Card */}
      {trust < 10 && (
        <View className="px-5 mt-4">
          <View className="bg-white px-5 py-4 rounded-2xl border border-border-light">
            <View className="flex flex-row items-center justify-between mb-3">
              <View className="flex flex-row items-center gap-2">
                <Ionicons name="shield-checkmark" size={16} color={trustColor} />
                <Text className="text-secondary text-[11px] font-bold uppercase tracking-[1.5px]">
                  Trust Meter
                </Text>
              </View>
              <View
                className="px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: `${trustColor}15` }}
              >
                <Text
                  className="text-[12px] font-black"
                  style={{ color: trustColor }}
                >
                  {trustPercentage}%
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-center gap-3">
              <View className="flex-1">
                <Progress.Bar
                  progress={trust / 10}
                  width={null}
                  color={trustColor}
                  unfilledColor="#F1F5F9"
                  borderWidth={0}
                  height={6}
                  borderRadius={3}
                  animated={true}
                />
              </View>
            </View>

            <Text className="text-muted text-[10px] font-bold uppercase tracking-[1.5px] mt-2.5 ml-0.5">
              {10 - trust} more messages to unlock DMs
            </Text>
          </View>
        </View>
      )}

      <View className="flex-1">
        <ChatMessages messages={messages} currentUserId={currentUserId} />
      </View>

      <View className="px-5 py-3.5 bg-transparent flex items-center pb-6">
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
