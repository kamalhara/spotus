import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase.config";
import { useTheme } from "../../context/ThemeContext";
import GlassContainer from "../ui/GlassContainer";

export default function UserOptionsModal({
  showOptions,
  setShowOptions,
  chatId,
  currentUserId,
  chatDoc,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isMuted = chatDoc?.mutedBy?.includes(currentUserId) || false;

  const handleMuteUser = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const mutedBy = chatDoc?.mutedBy || [];
      const newMutedBy = isMuted
        ? mutedBy.filter((id) => id !== currentUserId)
        : [...mutedBy, currentUserId];

      await setDoc(
        doc(db, "chats", chatId),
        { mutedBy: newMutedBy },
        { merge: true },
      );
      setShowOptions(false);
    } catch (error) {
      console.error("Error toggling mute:", error);
      Alert.alert("Error", "Could not update mute setting.");
    }
  };

  const handleDeleteChat = async () => {
    setShowOptions(false);
    Alert.alert(
      "Delete Chat for Everyone",
      "This will permanently delete the entire conversation for both participants. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // 1. Delete all messages in the subcollection (batch delete)
              const messagesRef = collection(db, "chats", chatId, "messages");
              const messagesSnap = await getDocs(messagesRef);

              // Firestore batch supports max 500 operations
              const batchSize = 500;
              const docs = messagesSnap.docs;

              for (let i = 0; i < docs.length; i += batchSize) {
                const batch = writeBatch(db);
                const chunk = docs.slice(i, i + batchSize);
                chunk.forEach((d) => batch.delete(d.ref));
                await batch.commit();
              }

              // 2. Delete the chat document itself
              await deleteDoc(doc(db, "chats", chatId));

              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              router.replace("/(authenticated)/(tabs)/chat_tab");
            } catch (error) {
              console.error("Error deleting chat:", error);
              Alert.alert("Error", "Could not delete the chat.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };
  const { isDark } = useTheme();
  const handleReportUser = async () => {
    setShowOptions(false);
    router.push("/feedback");
  };

  const OPTIONS = [
    {
      label: "Report",
      onPress: handleReportUser,
      icon: "flag",
      color: "#EF4444",
    },
    {
      label: isMuted ? "Unmute" : "Mute",
      onPress: handleMuteUser,
      icon: isMuted ? "notifications" : "volume-mute",
      color: isDark ? "#E5E7EB" : " #000000",
    },
    {
      label: "Delete Chat for Everyone",
      onPress: handleDeleteChat,
      icon: "trash",
      color: "#EF4444",
    },
  ];

  return (
    <Modal
      transparent
      visible={showOptions}
      animationType="fade"
      onRequestClose={() => setShowOptions(false)}
    >
      <Pressable
        className="flex-1 bg-black/30"
        onPress={() => setShowOptions(false)}
      >
        <View className="flex-1 justify-end pb-12 px-5">
          <Pressable>
            <GlassContainer
              borderRadius={16}
              fallbackClassName="bg-white dark:bg-[#1A1A22] border border-border-light dark:border-[#2A2A36]"
            >
              {/* Options */}
              {OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    option.onPress();
                  }}
                  activeOpacity={0.6}
                  disabled={loading}
                  className={`flex-row items-center px-5 py-3.5 ${
                    index < OPTIONS.length - 1
                      ? "border-b border-gray-50 dark:border-[#2A2A36]"
                      : ""
                  }`}
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
                    style={{
                      backgroundColor:
                        option.color === "#EF4444"
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(156, 163, 175, 0.1)",
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={option.color}
                    />
                  </View>
                  <Text
                    className="text-[15px] font-semibold flex-1"
                    style={{ color: option.color }}
                  >
                    {option.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </GlassContainer>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowOptions(false)}
              activeOpacity={0.7}
              style={{ marginTop: 8 }}
            >
              <GlassContainer
                borderRadius={16}
                fallbackClassName="bg-white dark:bg-[#1A1A22] border border-border-light dark:border-[#2A2A36]"
              >
                <View className="py-4 items-center">
                  <Text className="text-secondary dark:text-gray-100 font-bold text-[15px]">
                    Cancel
                  </Text>
                </View>
              </GlassContainer>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>

      {/* Full-screen loading overlay during delete */}
      {loading && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <GlassContainer
            borderRadius={16}
            fallbackClassName="bg-white dark:bg-[#1A1A22] border border-border-light dark:border-[#2A2A36]"
          >
            <View className="p-6 items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="text-secondary dark:text-gray-100 font-semibold mt-3">
                Deleting chat...
              </Text>
            </View>
          </GlassContainer>
        </View>
      )}
    </Modal>
  );
}
