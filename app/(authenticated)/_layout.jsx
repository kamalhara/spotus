import { Stack } from "expo-router";

export default function AuthenticatedLayout() {
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
