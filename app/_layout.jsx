import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { Stack } from "expo-router";
import { tokenCache } from "../utils/cache";
import "../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
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
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
