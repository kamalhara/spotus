import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Alert, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebase.config";
import { useTheme } from "../../context/ThemeContext";
import GlassContainer from "../ui/GlassContainer";

export default function RoomOptionsModal({
  showOptions,
  setShowOptions,
  roomId,
  currentUserId,
  roomDoc,
}) {
  const { isDark } = useTheme();
  const isMuted = roomDoc?.mutedBy?.includes(currentUserId) || false;

  const handleReport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowOptions(false);
    try {
      await addDoc(collection(db, "reports"), {
        type: "room",
        roomId,
        reporterId: currentUserId,
        reason: "Reported from room options",
        createdAt: serverTimestamp(),
      });
      Alert.alert("Report submitted", "Thanks for helping keep SpotUs safe.");
    } catch (err) {
      console.error("Error submitting room report:", err);
      Alert.alert("Error", "Could not submit report. Please try again.");
    }
  };

  const handleMute = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowOptions(false);
    try {
      const roomRef = doc(db, "rooms", roomId);
      if (isMuted) {
        await updateDoc(roomRef, {
          mutedBy: arrayRemove(currentUserId),
        });
      } else {
        await updateDoc(roomRef, {
          mutedBy: arrayUnion(currentUserId),
        });
      }
    } catch (err) {
      console.error("Error toggling room mute:", err);
      Alert.alert("Error", "Could not update mute setting.");
    }
  };

  const OPTIONS = [
    {
      label: "Report",
      onPress: handleReport,
      icon: "flag",
      color: "#EF4444",
    },
    {
      label: isMuted ? "Unmute" : "Mute",
      onPress: handleMute,
      icon: isMuted ? "notifications" : "volume-mute",
      color: isDark ? "#FFFFFF" : "#18181B",
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
        className="flex-1 bg-black/40"
        onPress={() => setShowOptions(false)}
      >
        <View className="flex-1 justify-end pb-12 px-5">
          <Pressable>
            <GlassContainer
              borderRadius={24}
              fallbackClassName="bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36]"
            >
              {OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={option.onPress}
                  activeOpacity={0.6}
                  className={`flex-row items-center px-5 py-4 ${
                    index < OPTIONS.length - 1
                      ? "border-b border-gray-100/50 dark:border-gray-800/50"
                      : ""
                  }`}
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
                    style={{
                      backgroundColor:
                        option.color === "#EF4444"
                          ? "rgba(239, 68, 68, 0.15)"
                          : isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <Ionicons name={option.icon} size={18} color={option.color} />
                  </View>
                  <Text
                    className="text-[16px] font-bold flex-1"
                    style={{ color: option.color }}
                  >
                    {option.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? "#4B5563" : "#9CA3AF"} />
                </TouchableOpacity>
              ))}
            </GlassContainer>

            <GlassContainer
              borderRadius={24}
              fallbackClassName="bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36]"
              style={{ marginTop: 12 }}
            >
              <TouchableOpacity
                onPress={() => setShowOptions(false)}
                activeOpacity={0.7}
                className="py-4 items-center justify-center"
              >
                <Text className="text-secondary dark:text-gray-100 font-extrabold text-[16px]">
                  Cancel
                </Text>
              </TouchableOpacity>
            </GlassContainer>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
