/**
 * Simple Analytics abstraction layer.
 * In a real app, this would connect to Mixpanel, PostHog, or Firebase Analytics.
 */

export const trackEvent = (eventName, properties = {}) => {
  if (__DEV__) {
    console.log(`[Analytics Event] ${eventName}`, properties);
  }
  // TODO: Send to analytics provider (e.g., PostHog.capture(eventName, properties))
};

export const trackScreen = (screenName, properties = {}) => {
  if (__DEV__) {
    console.log(`[Analytics Screen] ${screenName}`, properties);
  }
  // TODO: Send to analytics provider (e.g., PostHog.screen(screenName, properties))
};
