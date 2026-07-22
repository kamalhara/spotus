import { doc, getDoc, serverTimestamp, setDoc } from"firebase/firestore";
import { db } from"../config/firebase.config";

export default async function syncUserToFirebase(user) {
 if (!user) return;

 try {
 const userRef = doc(db,"users", user.id);
 const snap = await getDoc(userRef);

 if (snap.exists()) {
 // Document already exists, skip creation
 return;
 }

 // Prepare user data for Firestore
 const userData = {
 email: user.primaryEmailAddress?.emailAddress ||"",
 userName:
 user.username ||
 `${user.firstName ||""} ${user.lastName ||""}`.trim() ||
"New User",
 profilePic: user.imageUrl ||"",
 roomsJoined: [],
 notificationsEnabled: true,
 messageNotifications: true,
 roomNotifications: true,
 nearbyRoomNotifications: true,
 publicProfile: true,
 readReceipts: true,
 preciseLocation: false,
 appLockEnabled: false,
 language: "en",
 createdAt: serverTimestamp(),
 updatedAt: serverTimestamp(),
 };

 await setDoc(userRef, userData);
 } catch (error) {
 console.error("[Sync] Error syncing user to Firestore:", error);
 }
}
