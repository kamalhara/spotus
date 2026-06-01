import Constants from"expo-constants";
import * as Device from"expo-device";
import * as Notifications from"expo-notifications";
import { doc, getDoc, setDoc } from"firebase/firestore";
import { Platform } from"react-native";
import { db } from"../config/firebase.config";

// Configure foreground notification behavior — suppress banners when app is open
Notifications.setNotificationHandler({
 handleNotification: async () => ({
 shouldShowAlert: false,
 shouldPlaySound: false,
 shouldSetBadge: false,
 }),
});

/**
 * Register for push notifications and save the token to Firestore.
 */
export async function registerForPushNotifications(userId) {
 try {
 if (!Device.isDevice) {
 console.log("Running on simulator, skipping push registration.");
 return;
 }

 const { status: existingStatus } =
 await Notifications.getPermissionsAsync();

 let finalStatus = existingStatus;

 if (existingStatus !=="granted") {
 const { status } = await Notifications.requestPermissionsAsync();
 finalStatus = status;
 }

 if (finalStatus !=="granted") {
 console.log("Permission denied for push notifications.");
 return;
 }

 // Android needs a notification channel
 if (Platform.OS ==="android") {
 await Notifications.setNotificationChannelAsync("default", {
 name:"Default",
 importance: Notifications.AndroidImportance.MAX,
 vibrationPattern: [0, 250, 250, 250],
 lightColor:"#4F46E5",
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
 doc(db,"users", userId),
 { pushToken: token },
 { merge: true },
 );

 console.log("Push token saved:", token);
 return token;
 } catch (error) {
 console.error("Error registering for push notifications:", error);
 }
}

/**
 * Send a push notification to a user via Expo's push API.
 * @param {string} recipientUserId - The Firestore user ID of the recipient
 * @param {string} title - Notification title (sender name)
 * @param {string} body - Notification body (message text)
 * @param {object} data - Extra data to include (e.g. chatId, screen)
 */
export async function sendPushNotification(
 recipientUserId,
 title,
 body,
 data = {},
) {
 try {
 // Fetch the recipient's push token from Firestore
 const userDoc = await getDoc(doc(db,"users", recipientUserId));
 if (!userDoc.exists()) return;

 const pushToken = userDoc.data()?.pushToken;
 if (!pushToken) return;

 // Send via Expo's push notification API
 await fetch("https://exp.host/--/api/v2/push/send", {
 method:"POST",
 headers: {
 Accept:"application/json",
"Accept-encoding":"gzip, deflate",
"Content-Type":"application/json",
 },
 body: JSON.stringify({
 to: pushToken,
 title,
 body,
 sound:"default",
 data,
 }),
 });
 } catch (error) {
 console.error("Error sending push notification:", error);
 }
}
