import { Stack } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../../config/firebase.config";
import useFirestoreUser from "../../hook/useFireStoreUser";

export default function AuthenticatedLayout() {
  const { firestoreUser: user } = useFirestoreUser();
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
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="rooms/create-rooms"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="rooms/[roomId]" options={{ headerShown: false }} />
      <Stack.Screen name="users/[userId]" options={{ headerShown: false }} />
      <Stack.Screen name="dm/[chatId]" options={{ headerShown: false }} />
    </Stack>
  );
}
