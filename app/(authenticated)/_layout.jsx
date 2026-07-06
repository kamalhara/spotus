import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../../config/firebase.config";
import useFirestoreUser from "../../hook/useFireStoreUser";
import { registerForPushNotifications } from "../../lib/notification";

export default function AuthenticatedLayout() {
  const { firestoreUser: user } = useFirestoreUser();
  const router = useRouter();

  // Handle incoming push notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        // Track analytics
        try {
          await setDoc(
            doc(db, "stats", "notifications"),
            {
              notificationsOpened: increment(1),
            },
            { merge: true },
          );
        } catch (e) {
          console.error("Error tracking notification open:", e);
        }

        // Handle deep linking
        const data = response.notification.request.content.data;
        if (!data) return;

        if (data.screen === "dm" && data.chatId) {
          router.push(`/dm/${data.chatId}`);
        } else if (data.screen === "room" && data.roomId) {
          router.push(`/rooms/${data.roomId}`);
        } else if (data.screen === "profile") {
          router.push("/profile");
        }
      },
    );

    return () => subscription.remove();
  }, [router]);

  // Heartbeat: update lastSeen every 30s
  useEffect(() => {
    if (!user?.id) return;

    const updateActivity = async () => {
      await updateDoc(doc(db, "users", user.id), {
        lastSeen: serverTimestamp(),
      });
    };

    updateActivity();

    const interval = setInterval(updateActivity, 60000); // every 60 sec

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
      <Stack.Screen name="rooms/map" options={{ headerShown: false }} />
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
      <Stack.Screen
        name="profile/communityGuidelines"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile/safety" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile/contentModeration"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile/childSafety"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile/deleteAccount"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="report" options={{ headerShown: false }} />
    </Stack>
  );
}
