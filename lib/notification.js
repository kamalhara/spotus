import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, setDoc } from "firebase/firestore";
import { Alert } from "react-native";
import { db } from "../config/firebase.config";

// Configure how notifications are handled when the app is in the foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.warn("Notification handler could not be set:", error);
}

export async function registerForPushNotifications(userId) {
  try {
    // Safety check for native Device module
    if (!Device || typeof Device.isDevice === "undefined") {
      console.warn("ExpoDevice native module not found. Registration ignored.");
      return;
    }

    if (!Device.isDevice) {
      console.log("Running on simulator, skipping push registration.");
      return;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Error", "Failed to get push token for push notification!");
      return;
    }

    // Project ID is required for getExpoPushTokenAsync in current Expo versions
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.warn("Project ID not found in app.json. Push tokens may fail.");
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenResponse.data;

    if (!token) {
      console.warn("Failed to retrieve Expo Push Token.");
      return;
    }

    await setDoc(
      doc(db, "users", userId),
      { expoPushToken: token },
      { merge: true },
    );

    console.log("Push token successfully saved to Firestore:", token);
    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
  }
}
