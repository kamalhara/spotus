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
import { API_BASE_URL } from "../constants/api";

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
 * Internal helper: fetch with retry + timeout.
 * Retries up to `maxAttempts` times with exponential backoff (1s, 2s, 4s).
 * Only retries on network errors or 5xx status codes (not 4xx).
 * @returns {Promise<Response|null>} The response, or null on final failure.
 */
async function fetchWithRetry(url, options, maxAttempts = 3) {
  const backoffMs = [1000, 2000, 4000];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Don't retry on 4xx — these are client errors
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // 5xx — retry if attempts remain
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, backoffMs[attempt]));
        continue;
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      // Network error or abort — retry if attempts remain
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, backoffMs[attempt]));
        continue;
      }
      // Final attempt failed
      return null;
    }
  }
  return null;
}

/**
 * Send a push notification to a user via Expo's push API.
 * Uses retry logic with exponential backoff and a 10-second timeout.
 * Fire-and-forget: logs errors but never throws.
 * @param {string} recipientUserId - The Firestore user ID of the recipient
 * @param {string} senderUserId - The Firestore user ID of the sender
 * @param {string} title - Notification title (sender name)
 * @param {string} body - Notification body (message text)
 * @param {object} data - Extra data to include (e.g. type, chatId, roomId, screen)
 * @param {string} token - Clerk JWT token for authentication
 */
export async function sendPushNotification(
  recipientUserId,
  senderUserId,
  title,
  body,
  data = {},
  token
) {
  try {
    if (!token) {
      if (__DEV__) console.warn("Cannot send push notification: User not authenticated (missing Clerk token).");
      return;
    }

    // Prevent self-notifications early to save a network request
    if (recipientUserId === senderUserId) return;

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientUserId,
          senderUserId,
          title,
          body,
          data,
        }),
      }
    );

    if (!response) {
      console.error("sendPushNotification: all retry attempts failed");
      return;
    }

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      console.error("Error from notification backend:", result.error || result);
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

/**
 * Send a batch push notification to multiple users via the batch endpoint.
 * Uses the same retry + timeout logic as sendPushNotification.
 * Fire-and-forget: logs errors but never throws.
 * @param {string[]} recipientUserIds - Array of Firestore user IDs to notify
 * @param {string} senderUserId - The Firestore user ID of the sender
 * @param {string} title - Notification title
 * @param {string} body - Notification body (message text)
 * @param {object} data - Extra data to include (e.g. type, chatId, roomId, screen)
 * @param {string} token - Clerk JWT token for authentication
 */
export async function sendBatchNotification(
  recipientUserIds,
  senderUserId,
  title,
  body,
  data = {},
  token
) {
  try {
    if (!token) {
      if (__DEV__) console.warn("Cannot send batch notification: User not authenticated (missing Clerk token).");
      return;
    }

    if (!recipientUserIds || recipientUserIds.length === 0) return;

    // Filter out the sender to prevent self-notifications
    const filtered = recipientUserIds.filter((uid) => uid !== senderUserId);
    if (filtered.length === 0) return;

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/notifications/batch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientUserIds: filtered,
          title,
          body,
          data,
        }),
      }
    );

    if (!response) {
      console.error("sendBatchNotification: all retry attempts failed");
      return;
    }

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      console.error("Error from batch notification backend:", result.error || result);
    }
  } catch (error) {
    console.error("Error sending batch notification:", error);
  }
}

/**
 * Notify nearby users when a new room is created.
 * @param {object} roomData - The created room data
 * @param {string} roomId - The ID of the created room
 * @param {string} creatorId - The ID of the room creator
 * @param {number} radiusKm - Notification radius in kilometers (default 2)
 * @param {string} token - Clerk JWT token for authentication
 */
export async function notifyNearbyUsers(roomData, roomId, creatorId, radiusKm = 2, token) {
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
          sendPushNotification(userId, creatorId, title, body, data, token);
        }
      }
    }
  } catch (error) {
    console.error("Error notifying nearby users:", error);
  }
}
