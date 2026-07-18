import { useAuth, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import AppLoadingScreen from "../components/ui/AppLoadingScreen";

export default function Index() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  if (!isAuthLoaded || (isSignedIn && !isUserLoaded)) {
    return <AppLoadingScreen />;
  }

  if (isSignedIn) {
    // If onboarding is explicitly completed, go home
    if (user?.unsafeMetadata?.onboardingComplete) {
      return <Redirect href="/(authenticated)/(tabs)/home" />;
    }

    // Determine if this is a relatively new account (created within the last 24 hours)
    // Existing users who log in will bypass onboarding.
    const isNewAccount = user?.createdAt && (Date.now() - user.createdAt.getTime()) < 24 * 60 * 60 * 1000;

    if (isNewAccount) {
      return <Redirect href="/(authenticated)/onboarding" />;
    } else {
      return <Redirect href="/(authenticated)/(tabs)/home" />;
    }
  }

  return <Redirect href="/welcome" />;
}
