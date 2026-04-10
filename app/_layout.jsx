import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/expo";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "../global.css";
import syncUserToFirebase from "../lib/syncUser";
import { tokenCache } from "../utils/cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}

function UserSync() {
  const { user, isLoaded } = useUser();
  useEffect(() => {
    if (!isLoaded || !user) return;
    syncUserToFirebase(user);
  }, [isLoaded, user]);

  return null;
}

export default function RootLayout() {
  console.log("Clerk Publishable Key:", publishableKey ? "EXISTS" : "MISSING");

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      navigation={(to) => {
        console.log("Clerk navigating to:", to);
      }}
    >
      <ClerkLoaded>
        <UserSync />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
