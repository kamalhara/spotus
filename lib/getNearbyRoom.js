import {
  collection,
  endAt,
  getDocs,
  orderBy,
  query,
  startAt,
} from "firebase/firestore";
import { distanceBetween, geohashQueryBounds } from "geofire-common";
import { db } from "../config/firebase.config";
import { getCurrentLocation } from "./location";

export const getNearbyRooms = async (radiusKm = 10, currentUserId = null) => {
  const center = await getCurrentLocation();

  const radiusInM = radiusKm * 1000;

  const bounds = geohashQueryBounds(
    [center.latitude, center.longitude],
    radiusInM,
  );

  const promises = [];

  for (const bound of bounds) {
    const q = query(
      collection(db, "rooms"),
      orderBy("geohash"),
      startAt(bound[0]),
      endAt(bound[1]),
    );

    promises.push(getDocs(q));
  }

  const snapshots = await Promise.all(promises);

  const matchingRooms = [];
  const expiredDocs = [];
  const now = Date.now();

  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();

      // Check expiration if it exists
      if (data.expiresAt) {
        const expirationMs = data.expiresAt.toMillis ? data.expiresAt.toMillis() : data.expiresAt;
        if (expirationMs < now) {
          expiredDocs.push(docSnap.id);
          return; // skip adding to valid rooms
        }
      }

      // Skip ghost rooms unless user is creator or participant
      if (
        data.visibility === "ghost" &&
        data.createdBy !== currentUserId &&
        !data.participants?.includes(currentUserId)
      ) {
        return;
      }

      const room = {
        id: docSnap.id,
        ...data,
      };

      const distanceInKm = distanceBetween(
        [center.latitude, center.longitude],
        [room.latitude, room.longitude],
      );

      if (distanceInKm <= radiusKm) {
        matchingRooms.push({
          ...room,
          distance: distanceInKm,
        });
      }
    });
  });

  // Asynchronously delete expired rooms
  if (expiredDocs.length > 0) {
    import("firebase/firestore").then(({ deleteDoc, doc }) => {
      Promise.all(
        expiredDocs.map((id) => deleteDoc(doc(db, "rooms", id)))
      ).catch(err => console.error("Error deleting expired rooms:", err));
    });
  }

  return matchingRooms.sort((a, b) => a.distance - b.distance);
};
