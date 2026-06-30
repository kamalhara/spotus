import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase.config";
import { sendPushNotification } from "./notification";

export const joinRoomByCode = async (inviteCode, userId) => {
  if (!inviteCode || !userId)
    throw new Error("Invite code and user ID are required");

  // Query for the room with the matching invite code
  const q = query(
    collection(db, "rooms"),
    where("inviteCode", "==", inviteCode.trim().toUpperCase()),
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Room not found. Please check the code and try again.");
  }

  // Get the first matching room
  const roomDoc = querySnapshot.docs[0];
  const roomData = roomDoc.data();

  // Check if room has expired
  if (roomData.expiresAt) {
    const expiresMs = roomData.expiresAt.seconds
      ? roomData.expiresAt.seconds * 1000
      : roomData.expiresAt instanceof Date
        ? roomData.expiresAt.getTime()
        : roomData.expiresAt;

    if (Date.now() >= expiresMs) {
      throw new Error("This event has expired and is no longer active.");
    }
  }

  // Add user to participants if they aren't already in it
  if (!roomData.participants?.includes(userId)) {
    await updateDoc(roomDoc.ref, {
      participants: arrayUnion(userId),
    });

    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      const userName = userDoc.data()?.userName || "Someone";

      const otherParticipants = (roomData.participants || []).filter(
        (uid) => uid !== userId
      );

      otherParticipants.forEach((uid) => {
        sendPushNotification(
          uid,
          userId,
          roomData.title || "Room",
          `${userName} joined the room!`,
          { type: "room", screen: "room", roomId: roomDoc.id }
        );
      });
    } catch (err) {
      console.error("Error sending join notifications:", err);
    }
  }

  return roomDoc.id;
};
