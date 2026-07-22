import * as Notifications from "expo-notifications";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebase.config";
import useFirestoreUser from "../../hook/useFireStoreUser";
import { geohashForLocation } from "geofire-common";
import { registerForPushNotifications } from "../../lib/notification";
import { getSilentLocation } from "../../lib/location";
import { API_BASE_URL } from "../../constants/api";
import { useLocalization } from "../../context/LocalizationContext";

export default function AuthenticatedLayout() {
  const { firestoreUser: user } = useFirestoreUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { language, setLanguage } = useLocalization();
  const [appUnlocked, setAppUnlocked] = useState(false);
  const authenticating = useRef(false);
  const languageHydrated = useRef(false);

  const unlockApp = useCallback(async () => {
    if (!user?.appLockEnabled) {
      setAppUnlocked(true);
      return;
    }
    if (authenticating.current) return;
    authenticating.current = true;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock SpotUs",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });
      setAppUnlocked(result.success);
    } finally {
      authenticating.current = false;
    }
  }, [user?.appLockEnabled]);

  useEffect(() => {
    unlockApp();
  }, [unlockApp]);

  useEffect(() => {
    if (!user?.language || languageHydrated.current) return;
    languageHydrated.current = true;
    if (user.language !== language) setLanguage(user.language);
  }, [language, setLanguage, user?.language]);

  useEffect(() => {
    if (!user?.appLockEnabled) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState.match(/inactive|background/)) setAppUnlocked(false);
      if (nextState === "active") unlockApp();
    });
    return () => subscription.remove();
  }, [unlockApp, user?.appLockEnabled]);

  // Handle incoming push notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
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

  // Heartbeat & AppState tracking
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!user?.id) return;

    const updatePresence = async (isOnline) => {
      try {
        const updateData = {
          isOnline,
          lastSeen: serverTimestamp(),
        };

        if (isOnline) {
          const loc = await getSilentLocation();
          if (loc) {
            updateData.latitude = loc.latitude;
            updateData.longitude = loc.longitude;
            updateData.geohash = geohashForLocation([loc.latitude, loc.longitude]);
          }
        }

        await updateDoc(doc(db, "users", user.id), updateData);
      } catch (error) {
        console.error("Error updating presence:", error);
      }
    };

    // Initial heartbeat
    updatePresence(true);
    const interval = setInterval(() => updatePresence(true), 60000);

    // AppState listener for background/foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground
        updatePresence(true);
      } else if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to the background
        updatePresence(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [user?.id]);

  // Register for push notifications
  useEffect(() => {
    if (!user?.id || user.notificationsEnabled === false) return;
    registerForPushNotifications(user.id);
  }, [user?.id, user?.notificationsEnabled]);

  // Pre-warm the notification server to reduce cold-start latency
  useEffect(() => {
    const pingServer = () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      fetch(`${API_BASE_URL}/ping`, {
        mode: "no-cors",
        signal: controller.signal,
      })
        .catch(() => {}) // Fire-and-forget
        .finally(() => clearTimeout(timeoutId));
    };

    // Ping on mount
    pingServer();

    // Ping when app comes back to foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        pingServer();
      }
    });

    return () => subscription.remove();
  }, []);

  if (user?.appLockEnabled && !appUnlocked) {
    return (
      <View className="flex-1 items-center justify-center bg-bg dark:bg-[#111113] px-8">
        <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center mb-5">
          <Ionicons name="lock-closed" size={34} color="#FF6B47" />
        </View>
        <Text className="text-secondary dark:text-gray-100 text-xl font-bold mb-2">
          SpotUs is locked
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-7">
          Use your device authentication to continue.
        </Text>
        <TouchableOpacity onPress={unlockApp} className="bg-primary rounded-2xl px-8 py-3.5">
          <Text className="text-white font-bold">Unlock</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={signOut} className="mt-5 px-6 py-3">
          <Text className="text-gray-400 font-semibold">Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      <Stack.Screen
        name="profile/reportProblem"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile/contactSupport"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="report" options={{ headerShown: false }} />
    </Stack>
  );
}
