import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/expo";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { ThemeProvider } from "../context/ThemeContext";
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
  // Global sync of user data from Clerk to Firestore
  useEffect(() => {
    if (!isLoaded || !user) return;
    syncUserToFirebase(user);
  }, [isLoaded, user]);

  return null;
}

function ThemedApp() {
  return (
    <View style={{ flex: 1 }} className="bg-bg dark:bg-[#0F0F13]">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ClerkLoaded>
            <BottomSheetModalProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(authenticated)"
                  options={{ headerShown: false }}
                />
              </Stack>
              <UserSync />
            </BottomSheetModalProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </GestureHandlerRootView>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
