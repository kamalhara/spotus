import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { db } from "../config/firebase.config";
import { getCurrentLocation } from "./location";

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const createRoom = async (
  title,
  description,
  category,
  userId,
  showOnMap,
  duration,
) => {
  const trimmedTitle = title?.trim();
  const hours = Number(duration);

  if (!trimmedTitle || !category) {
    throw new Error("Title and category are required");
  }

  if (!userId) {
    throw new Error("User is required");
  }

  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error("Duration must be a positive number of hours");
  }

  const location = await getCurrentLocation();
  const geohash = geohashForLocation([location.latitude, location.longitude]);

  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + hours * 60 * 60 * 1000),
  );
  const inviteCode = generateInviteCode();

  const roomData = {
    title: trimmedTitle,
    description: description?.trim() || "",
    category,
    createdBy: userId,
    participants: [userId],
    messageCount: 0,
    visibility: showOnMap ? "public" : "ghost",
    showOnMap: !!showOnMap,
    inviteCode,
    geohash,
    latitude: location.latitude,
    longitude: location.longitude,
    expiresAt,
    isActive: true,
    createdAt: serverTimestamp(),
  };

  const roomRef = await addDoc(collection(db, "rooms"), roomData);

  // Notify users within 2km without blocking
  import("./notification").then(({ notifyNearbyUsers }) => {
    notifyNearbyUsers(roomData, roomRef.id, userId, 2);
  }).catch((err) => console.error("Failed to load notification module", err));

  return { roomId: roomRef.id, inviteCode, visibility: roomData.visibility };
};
