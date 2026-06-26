import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { arrayRemove, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase.config";
import { useTheme } from "../../context/ThemeContext";
import useFirestoreUser from "../../hook/useFireStoreUser";
import GlassButton from "../ui/GlassButton";
import GlassContainer from "../ui/GlassContainer";

function BlockedUserModal({ showBlockedModal, setShowBlockedModal }) {
  const { firestoreUser } = useFirestoreUser();
  const { isDark } = useTheme();
  const [blockedProfiles, setBlockedProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unblocking, setUnblocking] = useState(null);

  // Fetch profiles for blocked user IDs
  useEffect(() => {
    if (!showBlockedModal || !firestoreUser?.blockedUsers?.length) {
      setBlockedProfiles([]);
      return;
    }

    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const profiles = [];
        for (const uid of firestoreUser.blockedUsers) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            profiles.push({ id: userDoc.id, ...userDoc.data() });
          } else {
            profiles.push({
              id: uid,
              userName: "Deleted User",
              profilePic: null,
            });
          }
        }
        setBlockedProfiles(profiles);
      } catch (err) {
        console.error("Error fetching blocked users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [showBlockedModal, firestoreUser?.blockedUsers]);

  const handleUnblock = (blockedUser) => {
    Alert.alert(
      `Unblock ${blockedUser.userName}?`,
      "They will be able to see your profile and send you messages again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: async () => {
            setUnblocking(blockedUser.id);
            try {
              const viewerRef = doc(db, "users", firestoreUser.id);
              await updateDoc(viewerRef, {
                blockedUsers: arrayRemove(blockedUser.id),
              });
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              setBlockedProfiles((prev) =>
                prev.filter((p) => p.id !== blockedUser.id),
              );
            } catch (err) {
              console.error("Error unblocking user:", err);
              Alert.alert("Error", "Could not unblock user. Please try again.");
            } finally {
              setUnblocking(null);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={showBlockedModal} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/50">
        <GlassContainer
          borderRadius={28}
          className="max-h-[75%]"
          style={{
            marginHorizontal: 8,
            marginBottom: 8,
            paddingTop: 12,
            paddingBottom: 24,
          }}
        >
          {/* Drag Handle */}
          <View className="items-center mb-4">
            <View
              className="bg-gray-300 dark:bg-gray-600 rounded-full"
              style={{ width: 36, height: 4 }}
            />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 mb-5">
            <View className="flex-row items-center">
              <View
                className="items-center justify-center mr-3"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: isDark
                    ? "rgba(239,68,68,0.12)"
                    : "rgba(239,68,68,0.08)",
                }}
              >
                <Ionicons name="ban" size={18} color="#EF4444" />
              </View>
              <View>
                <Text className="text-secondary dark:text-gray-100 text-lg font-display font-extrabold tracking-tight">
                  Blocked Users
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium mt-0.5">
                  {blockedProfiles.length}{" "}
                  {blockedProfiles.length === 1 ? "user" : "users"} blocked
                </Text>
              </View>
            </View>
            <GlassButton
              onPress={() => setShowBlockedModal(false)}
              size={36}
              shape="circle"
            >
              <Ionicons
                name="close"
                size={18}
                color={isDark ? "#F3F4F6" : "#6B7280"}
              />
            </GlassButton>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 dark:bg-[#2C2C30] mx-5 mb-2" />

          {loading ? (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="#FF6B47" />
              <Text className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-4">
                Loading…
              </Text>
            </View>
          ) : blockedProfiles.length === 0 ? (
            <View className="py-14 items-center px-8">
              <View
                className="items-center justify-center mb-5"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: isDark
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(16,185,129,0.08)",
                }}
              >
                <Ionicons name="checkmark-circle" size={36} color="#10B981" />
              </View>
              <Text className="text-secondary dark:text-gray-100 text-base font-bold mb-1.5">
                All clear!
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm font-medium text-center leading-5">
                You haven&apos;t blocked anyone. Blocked users won&apos;t be
                able to see your profile or message you.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 8,
              }}
            >
              {blockedProfiles.map((user, index) => (
                <View
                  key={user.id}
                  className="flex-row items-center rounded-2xl p-3 mb-2"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.02)",
                  }}
                >
                  <View
                    className="overflow-hidden mr-3"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isDark ? "#2C2C30" : "#F3F4F6",
                    }}
                  >
                    <Image
                      source={{
                        uri: user.profilePic || "https://picsum.photos/200",
                      }}
                      style={{ width: 44, height: 44 }}
                    />
                  </View>
                  <View className="flex-1 mr-3">
                    <Text
                      className="text-secondary dark:text-gray-100 text-[15px] font-bold"
                      numberOfLines={1}
                    >
                      {user.userName || "User"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnblock(user)}
                    disabled={unblocking === user.id}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(239,68,68,0.06)",
                      borderWidth: 1,
                      borderColor: isDark
                        ? "rgba(239,68,68,0.2)"
                        : "rgba(239,68,68,0.12)",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                    }}
                  >
                    {unblocking === user.id ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <>
                        <Ionicons name="ban" size={13} color="#EF4444" />
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 13,
                            fontWeight: "700",
                            marginLeft: 5,
                          }}
                        >
                          Unblock
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </GlassContainer>
      </View>
    </Modal>
  );
}

export default BlockedUserModal;
