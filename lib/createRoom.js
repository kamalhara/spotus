import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { db } from "../config/firebase.config";
import { getCurrentLocation } from "./location";

export const createRoom = async (title, description, category, userId, showOnMap) => {
  const location = await getCurrentLocation();
  const geohash = geohashForLocation([location.latitude, location.longitude]);
  if (!title || !category) return;

  return await addDoc(collection(db, "rooms"), {
    title,
    description: description || "",
    category,
    createdBy: userId,
    participants: [userId],

    geohash,
    longitude: location.longitude,
    latitude: location.latitude,
    showOnMap: !!showOnMap,

    createdAt: serverTimestamp(),
  });
};
