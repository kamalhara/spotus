import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { addDoc, collection, doc, getDoc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "../config/firebase.config";

// Configure foreground notification behavior — suppress banners when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and save the token to Firestore.
 */
export async function registerForPushNotifications(userId) {
  try {
    if (!Device.isDevice) {
      if (__DEV__)
        console.log("Running on simulator, skipping push registration.");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Permission denied for push notifications.");
      return;
    }

    // Android needs a notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4F46E5",
      });
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenResponse.data;

    await setDoc(
      doc(db, "users", userId),
      {
        expoPushToken: token,
        notificationsEnabled: true,
        messageNotifications: true,
        roomNotifications: true,
        pushTokenUpdatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    if (__DEV__) console.log("Push token saved:", token);
    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
  }
}

/**
 * Send a push notification to a user via Expo's push API.
 * @param {string} recipientUserId - The Firestore user ID of the recipient
 * @param {string} senderUserId - The Firestore user ID of the sender
 * @param {string} title - Notification title (sender name)
 * @param {string} body - Notification body (message text)
 * @param {object} data - Extra data to include (e.g. type, chatId, roomId, screen)
 */
export async function sendPushNotification(
  recipientUserId,
  senderUserId,
  title,
  body,
  data = {},
) {
  try {
    // Prevent self-notifications
    if (recipientUserId === senderUserId) return;

    // Fetch the recipient's push token and preferences from Firestore
    const userDoc = await getDoc(doc(db, "users", recipientUserId));
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const pushToken = userData?.expoPushToken || userData?.pushToken;
    if (!pushToken) return;

    // Respect notification preferences
    if (userData.notificationsEnabled === false) return;
    if (data.type === "message" && userData.messageNotifications === false) return;
    if (data.type === "room" && userData.roomNotifications === false) return;

    // Send via Expo's push notification API
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        sound: "default",
        priority: "high",
        badge: 1,
        data: {
          ...data,
          senderId: senderUserId,
        },
      }),
    });

    const result = await response.json();

    // Invalid Token Cleanup
    if (
      result?.data?.status === "error" &&
      result?.data?.details?.error === "DeviceNotRegistered"
    ) {
      await setDoc(
        doc(db, "users", recipientUserId),
        { expoPushToken: null, pushToken: null },
        { merge: true }
      );
      return;
    }

    // Notification History
    await addDoc(collection(db, "notifications"), {
      userId: recipientUserId,
      title,
      body,
      type: data.type || "general",
      data: { ...data, senderId: senderUserId },
      createdAt: serverTimestamp(),
      read: false,
    });

    // Lightweight Analytics Counter
    await setDoc(
      doc(db, "stats", "notifications"),
      {
        notificationsSent: increment(1),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
