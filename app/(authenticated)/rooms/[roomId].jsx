import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
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
    await addDoc(collection(db, "rooms", roomId, "messages"), {
      text,
      senderId: currentUserId || "unknown-id",
      user: user?.userName || "Unknown",
      createdAt: serverTimestamp(),
    });

    const trustRef = doc(db, "rooms", roomId, "trust", currentUserId);
    await setDoc(
      trustRef,
      {
        messagesCount: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  };
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F9FAFB]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Premium Header */}
      <View className="bg-white shadow-sm shadow-slate-200 z-10">
        <SafeAreaView edges={["top"]}>
          <View className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-50">
            <View className="flex flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4 border border-gray-100 active:bg-gray-100"
              >
                <Ionicons name="chevron-back" size={20} color="#1F2937" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1"
                onPress={() => detailsSheetRef.current?.present()}
                activeOpacity={0.7}
              >
                <Text
                  className="text-secondary text-xl font-black tracking-tight leading-7"
                  numberOfLines={1}
                >
                  {room?.title || "Loading..."}
                </Text>
                <View className="flex flex-row items-center mt-0.5">
                  <View className="bg-green-500 w-1.5 h-1.5 rounded-full mr-1.5 shadow-sm shadow-green-200" />
                  <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">
                    {room?.category || "SPOT"} •{" "}
                    {room?.participants?.length || 0} ACTIVE
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 active:bg-gray-100">
              <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Medium Trust Meter Card */}
      {trust < 10 && (
        <View className="px-6 mt-4">
          <View className="bg-white px-4 py-3.5 rounded-2xl border border-gray-100 shadow-sm shadow-slate-50">
            <View className="flex flex-row items-center justify-between mb-3">
              <View className="flex flex-row items-center gap-2">
                <Ionicons name="shield-checkmark" size={16} color="#4F46E5" />
                <Text className="text-secondary text-[11px] font-bold uppercase tracking-wider">
                  Trust Meter
                </Text>
              </View>
              <View className="bg-indigo-50 px-2 py-0.5 rounded-md">
                <Text className="text-primary text-[11px] font-black">
                  {trust * 10}%
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-center gap-3">
              <View className="flex-1">
                <Progress.Bar
                  progress={trust / 10}
                  width={null}
                  color="#4F46E5"
                  unfilledColor="#F3F4F6"
                  borderWidth={0}
                  height={7}
                  borderRadius={4}
                  animated={true}
                />
              </View>
            </View>

            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-2.5 ml-0.5">
              {10 - trust} more messages to unlock direct messaging
            </Text>
          </View>
        </View>
      )}

      <View className="flex-1">
        <ChatMessages messages={messages} currentUserId={currentUserId} />
      </View>

      <View className="px-6 py-4 bg-white/0 flex items-center">
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
