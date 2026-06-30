import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ui/ScreenHeader";
import { db } from "../../config/firebase.config";
import { useTheme } from "../../context/ThemeContext";
import useFirestoreUser from "../../hook/useFireStoreUser";

export default function NotificationsList() {
  const { firestoreUser } = useFirestoreUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!firestoreUser?.id) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", firestoreUser.id),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(notifs);
      setLoading(false);
    });

    return unsubscribe;
  }, [firestoreUser?.id]);

  const handlePress = async (notification) => {
    if (!notification.read) {
      try {
        await updateDoc(doc(db, "notifications", notification.id), {
          read: true,
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    const { screen, chatId, roomId } = notification.data || {};
    if (screen === "dm" && chatId) {
      router.push(`/dm/${chatId}`);
    } else if (screen === "room" && roomId) {
      router.push(`/rooms/${roomId}`);
    } else if (screen === "profile") {
      router.push("/profile");
    }
  };

  const renderItem = ({ item }) => {
    const isMessage = item.type === "message";
    const iconName = isMessage ? "chatbubble-outline" : "people-outline";
    const iconColor = isMessage ? "#3B82F6" : "#FF6B47";

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
        className={`px-5 py-4 border-b border-gray-100 dark:border-[#2C2C30] flex-row items-center ${
          !item.read ? "bg-primary/5 dark:bg-primary/10" : ""
        }`}
      >
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text
            className={`text-base ${
              !item.read ? "font-bold text-secondary dark:text-white" : "font-semibold text-gray-800 dark:text-gray-200"
            }`}
          >
            {item.title}
          </Text>
          <Text
            className={`text-sm mt-0.5 ${
              !item.read ? "text-gray-600 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"
            }`}
            numberOfLines={2}
          >
            {item.body}
          </Text>
        </View>
        {!item.read && <View className="w-2.5 h-2.5 rounded-full bg-primary ml-2" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Notifications" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400">Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="notifications-off-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 dark:text-gray-400 text-base font-semibold">
                No notifications yet.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
