import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { arrayRemove, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase.config";
import useFirestoreUser from "../../hook/useFireStoreUser";

function BlockedUserModal({ showBlockedModal, setShowBlockedModal }) {
  const { firestoreUser } = useFirestoreUser();
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
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="bg-white dark:bg-[#1A1A22] w-11/12 rounded-2xl p-5 max-h-[70%]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-secondary dark:text-gray-100 text-xl font-bold">
              Blocked Users
            </Text>
            <TouchableOpacity onPress={() => setShowBlockedModal(false)}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          ) : blockedProfiles.length === 0 ? (
            <View className="py-8 items-center">
              <Ionicons
                name="checkmark-circle-outline"
                size={40}
                color="#10B981"
              />
              <Text className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-3">
                No blocked users
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              {blockedProfiles.map((user) => (
                <View
                  key={user.id}
                  className="flex-row items-center p-3 border-b border-gray-100 dark:border-[#2A2A36]"
                >
                  <Image
                    source={{
                      uri: user.profilePic || "https://picsum.photos/200",
                    }}
                    className="w-10 h-10 rounded-full mr-3 bg-gray-200 dark:bg-gray-800"
                  />
                  <View className="flex-1">
                    <Text className="text-secondary dark:text-gray-100 text-base font-semibold">
                      {user.userName || "User"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnblock(user)}
                    disabled={unblocking === user.id}
                    className="flex-row items-center bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-3 py-1.5 rounded-xl"
                  >
                    {unblocking === user.id ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <>
                        <Ionicons name="ban" size={14} color="#EF4444" />
                        <Text className="text-red-500 text-xs font-semibold ml-1.5">
                          Unblock
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default BlockedUserModal;
