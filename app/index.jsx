import { useAuth, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  // if (!isSignedIn) {
  //   return <Redirect href="/(auth)/login" />;
  // }

  return <Redirect href="/welcome" />;
}
