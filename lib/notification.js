import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "../config/firebase.config";

// Configure foreground notification behavior — suppress banners when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
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
    if (data.type === "nearby_room" && userData.nearbyRoomNotifications === false) return;

    // Prevent sending push notifications if the recipient is currently online (app in foreground)
    if (userData.isOnline === true) {
      if (__DEV__) console.log(`Skipping push notification for online user: ${recipientUserId}`);
      return;
    }

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
        sound: data.type === "nearby_room" ? null : "default",
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
        { merge: true },
      );
      return;
    }

    // Lightweight Analytics Counter
    await setDoc(
      doc(db, "stats", "notifications"),
      {
        notificationsSent: increment(1),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

/**
 * Notify nearby users when a new room is created.
 * @param {object} roomData - The created room data
 * @param {string} roomId - The ID of the created room
 * @param {string} creatorId - The ID of the room creator
 * @param {number} radiusKm - Notification radius in kilometers (default 2)
 */
export async function notifyNearbyUsers(roomData, roomId, creatorId, radiusKm = 2) {
  try {
    if (!roomData.latitude || !roomData.longitude) return;

    const { geohashQueryBounds, distanceBetween } = await import("geofire-common");
    const { collection, query, orderBy, startAt, endAt, getDocs } = await import("firebase/firestore");

    const center = [roomData.latitude, roomData.longitude];
    const radiusInM = radiusKm * 1000;
    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = [];

    for (const bound of bounds) {
      const q = query(
        collection(db, "users"),
        orderBy("geohash"),
        startAt(bound[0]),
        endAt(bound[1])
      );
      promises.push(getDocs(q));
    }

    const snapshots = await Promise.all(promises);
    
    // Use a Set to prevent notifying the same user twice if bounds overlap
    const notifiedUserIds = new Set();
    notifiedUserIds.add(creatorId); // Don't notify the creator

    for (const snapshot of snapshots) {
      for (const docSnap of snapshot.docs) {
        const userId = docSnap.id;
        if (notifiedUserIds.has(userId)) continue;

        const userData = docSnap.data();
        if (!userData.latitude || !userData.longitude) continue;

        const distanceInKm = distanceBetween(
          center,
          [userData.latitude, userData.longitude]
        );

        if (distanceInKm <= radiusKm) {
          notifiedUserIds.add(userId);
          
          if (__DEV__) console.log(`Sending nearby room push notification to user ${userId}, distance: ${distanceInKm.toFixed(2)}km`);

          // Send notification
          const title = "New Room Nearby! 📍";
          const body = `A new room "${roomData.title}" was just created near you.`;
          const data = {
            type: "nearby_room",
            screen: "room",
            roomId: roomId,
          };

          // Intentionally do not await here to not block the main thread
          sendPushNotification(userId, creatorId, title, body, data);
        }
      }
    }
  } catch (error) {
    console.error("Error notifying nearby users:", error);
  }
}
