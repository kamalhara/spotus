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
  const location = await getCurrentLocation();
  const geohash = geohashForLocation([location.latitude, location.longitude]);

  if (!title || !category) throw new Error("Title and category are required");

  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + duration * 60 * 60 * 1000),
  );
  const inviteCode = generateInviteCode();

  const roomData = {
    title: title.trim(),
    description: description?.trim() || "",
    category,
    createdBy: userId,
    participants: [userId],
    participantCount: 1,
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

  return { roomId: roomRef.id, inviteCode, visibility: roomData.visibility };
};
