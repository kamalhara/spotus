import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/expo";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { ThemeProvider } from "../context/ThemeContext";
import { ModalProvider } from "../context/ModalContext";
import "../global.css";
import { trackScreen } from "../lib/analytics";
import { warmApi } from "../lib/api";
import syncUserToFirebase from "../lib/syncUser";
import { tokenCache } from "../utils/cache";
import FirebaseAuthGate from "../components/auth/FirebaseAuthGate";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

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
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackScreen(pathname);
    }
  }, [pathname]);

  return (
    <View style={{ flex: 1 }} className="bg-bg dark:bg-[#111113]">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ClerkLoaded>
            <FirebaseAuthGate>
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
            </FirebaseAuthGate>
          </ClerkLoaded>
        </ClerkProvider>
      </GestureHandlerRootView>
      <StatusBar style="auto" />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    warmApi();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setBackgroundColorAsync("#ffffff00");
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <ModalProvider>
        <ThemedApp />
      </ModalProvider>
    </ThemeProvider>
  );
}
