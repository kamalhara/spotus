import { useAuth } from "@clerk/expo";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../config/firebase.config";
import { apiRequest } from "../../lib/api";
import AppLoadingScreen from "../ui/AppLoadingScreen";

export default function FirebaseAuthGate({ children }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const [readyUserId, setReadyUserId] = useState(auth.currentUser?.uid || null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const syncFirebaseSession = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      if (auth.currentUser) await signOut(auth);
      setReadyUserId(null);
      setError(null);
      return;
    }

    if (auth.currentUser?.uid === userId) {
      setReadyUserId(userId);
      setError(null);
      return;
    }

    setReadyUserId(null);
    setError(null);
    const clerkToken = await getToken();
    const { firebaseToken } = await apiRequest("/api/auth/firebase-token", {
      method: "POST",
      token: clerkToken,
    });
    await signInWithCustomToken(auth, firebaseToken);
    setReadyUserId(userId);
  }, [getToken, isLoaded, isSignedIn, userId]);

  useEffect(() => {
    let active = true;
    syncFirebaseSession().catch((sessionError) => {
      if (!active) return;
      console.error("Firebase authentication failed:", sessionError);
      setError(sessionError);
    });
    return () => {
      active = false;
    };
  }, [attempt, syncFirebaseSession]);

  if (!isLoaded || (isSignedIn && readyUserId !== userId)) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-8 dark:bg-[#111113]">
        {error ? (
          <>
            <Text className="text-center text-base font-bold text-secondary dark:text-gray-100">
              Could not secure your database session
            </Text>
            <Text className="mt-2 text-center text-sm text-muted">
              Check your connection and try again.
            </Text>
            <TouchableOpacity
              className="mt-6 rounded-full bg-primary px-6 py-3"
              onPress={() => setAttempt((value) => value + 1)}
            >
              <Text className="font-bold text-white">Try again</Text>
            </TouchableOpacity>
          </>
        ) : (
          <AppLoadingScreen
            message={isSignedIn ? "Signing you in…" : "Opening SpotUs…"}
            detail={
              isSignedIn
                ? "Securing your account and syncing your rooms"
                : "Getting everything ready for you"
            }
          />
        )}
      </View>
    );
  }

  return children;
}
