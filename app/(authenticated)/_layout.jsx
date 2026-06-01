import { Stack } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../../config/firebase.config";
import useFirestoreUser from "../../hook/useFireStoreUser";
import { registerForPushNotifications } from "../../lib/notification";

export default function AuthenticatedLayout() {
  const { firestoreUser: user } = useFirestoreUser();

  // Heartbeat: update lastSeen every 30s
  useEffect(() => {
    if (!user?.id) return;

    const updateActivity = async () => {
      await updateDoc(doc(db, "users", user.id), {
        lastSeen: serverTimestamp(),
      });
    };

    updateActivity();

    const interval = setInterval(updateActivity, 30000); // every 30 sec

    return () => clearInterval(interval);
  }, [user?.id]);

  // Register for push notifications
  useEffect(() => {
    if (!user?.id) return;
    registerForPushNotifications(user.id);
  }, [user?.id]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="rooms/create-rooms"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="rooms/[roomId]" options={{ headerShown: false }} />
      <Stack.Screen name="users/[userId]" options={{ headerShown: false }} />
      <Stack.Screen name="dm/[chatId]" options={{ headerShown: false }} />
      <Stack.Screen name="rooms/roomInfo" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile/changePassword"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile/accountSetting"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile/security" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile/notifications"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile/privacyData"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile/language" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile/helpCenter"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile/about" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile/privacyPolicy"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile/terms" options={{ headerShown: false }} />
    </Stack>
  );
}
