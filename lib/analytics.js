import PostHog from "posthog-react-native";

const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;

export const posthog = new PostHog(
  posthogApiKey || "phc_REPLACE_WITH_POSTHOG_PROJECT_KEY",
  {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    disabled: !posthogApiKey,
    captureAppLifecycleEvents: true,
  },
);

export const trackEvent = (eventName, properties = {}) => {
  if (__DEV__) {
    console.log(`[Analytics Event] ${eventName}`, properties);
  }
  posthog.capture(eventName, properties);
};

export const trackScreen = (screenName, properties = {}) => {
  if (__DEV__) {
    console.log(`[Analytics Screen] ${screenName}`, properties);
  }
  posthog.screen(screenName, properties);
};
