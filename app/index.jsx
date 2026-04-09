import { useAuth, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-bg px-7">
      <View className="mb-10 items-center">
        <Text className="text-primary text-3xl font-bold mb-2">Spot Us</Text>
        <Text className="text-gray-500">You are securely signed in!</Text>
      </View>

      <View className="bg-gray-100 p-6 rounded-2xl w-full mb-10 items-center">
        <Text className="text-lg font-bold">Account Details</Text>
        <Text className="text-gray-600 mt-2">
          {user?.emailAddresses[0]?.emailAddress}
        </Text>
      </View>

      <TouchableOpacity
        className="bg-red-500 w-full py-4 rounded-xl items-center"
        onPress={() => signOut()}
      >
        <Text className="text-white font-bold text-lg">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
