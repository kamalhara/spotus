import { useOAuth } from "@clerk/expo";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect } from "react";
import { TouchableOpacity, View, Text, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";

WebBrowser.maybeCompleteAuthSession();

// Clerk recommendation for faster OAuth loading
const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function Oauth() {
  useWarmUpBrowser();
  const router = useRouter();

  const { startOAuthFlow: googleAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: facebookAuthFlow } = useOAuth({
    strategy: "oauth_facebook",
  });
  const { startOAuthFlow: appleAuthFlow } = useOAuth({
    strategy: "oauth_apple",
  });

  const handleOAuth = useCallback(async (strategy) => {
    try {
      const flow =
        strategy === "oauth_google"
          ? googleAuthFlow
          : strategy === "oauth_facebook"
            ? facebookAuthFlow
            : appleAuthFlow;

      const { createdSessionId, setActive } = await flow({
        redirectUrl: Linking.createURL("/(auth)/login", { scheme: "spotus" }),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.push("/");
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <View className="flex flex-col gap-3 mb-5">
      {/* Google Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center py-4 px-6 rounded-2xl border border-gray-200 bg-white shadow-sm shadow-slate-100 active:opacity-70"
        onPress={() => handleOAuth("oauth_google")}
      >
        <Svg width="24" height="24" viewBox="0 0 48 48">
          <Path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <Path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <Path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <Path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </Svg>
        <Text className="text-secondary font-semibold ml-3 text-base">Continue with Google</Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 px-6 rounded-2xl border border-gray-200 bg-white shadow-sm shadow-slate-100 active:opacity-70"
          onPress={() => handleOAuth("oauth_apple")}
        >
        <Svg width="24" height="24" viewBox="0 0 50 50">
          <Path fill="#18181B" d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z" />
        </Svg>
        <Text className="text-secondary font-semibold ml-3 text-base">Continue with Apple</Text>
      </TouchableOpacity>
      )}
    </View>
  );
}
