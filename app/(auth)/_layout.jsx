import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(authenticated)/(tabs)/home" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}
