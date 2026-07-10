import {
  collection,
  endAt,
  getDocs,
  orderBy,
  query,
  startAt,
  onSnapshot,
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

      // Skip rooms where the user is banned
      if (data.bannedUsers?.includes(currentUserId)) {
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

  // Client is no longer responsible for deleting expired rooms

  return matchingRooms.sort((a, b) => a.distance - b.distance);
};

export const subscribeNearbyRooms = async (radiusKm = 10, currentUserId = null, onUpdate) => {
  const center = await getCurrentLocation();
  const radiusInM = radiusKm * 1000;
  const bounds = geohashQueryBounds(
    [center.latitude, center.longitude],
    radiusInM,
  );

  const unsubscribes = [];
  const roomsMap = new Map();
  let emitTimeout = null;

  const emitUpdate = () => {
    const matchingRooms = [];
    const expiredDocs = [];
    const now = Date.now();

    for (const [roomId, docSnap] of roomsMap.entries()) {
      const data = docSnap.data();

      if (data.expiresAt) {
        const expirationMs = data.expiresAt.toMillis ? data.expiresAt.toMillis() : data.expiresAt;
        if (expirationMs < now) {
          expiredDocs.push(roomId);
          continue;
        }
      }

      if (
        data.visibility === "ghost" &&
        data.createdBy !== currentUserId &&
        !data.participants?.includes(currentUserId)
      ) {
        continue;
      }

      if (data.bannedUsers?.includes(currentUserId)) {
        continue;
      }

      const room = {
        id: roomId,
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
    }

    // Client is no longer responsible for deleting expired rooms

    onUpdate(matchingRooms.sort((a, b) => a.distance - b.distance));
  };

  for (const bound of bounds) {
    const q = query(
      collection(db, "rooms"),
      orderBy("geohash"),
      startAt(bound[0]),
      endAt(bound[1]),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
          roomsMap.delete(change.doc.id);
        } else {
          roomsMap.set(change.doc.id, change.doc);
        }
      });
      
      // Debounce updates slightly to prevent multiple renders on initial load of multiple bounds
      if (emitTimeout) clearTimeout(emitTimeout);
      emitTimeout = setTimeout(() => {
        emitUpdate();
      }, 50);
    });

    unsubscribes.push(unsubscribe);
  }

  return () => {
    if (emitTimeout) clearTimeout(emitTimeout);
    unsubscribes.forEach((unsub) => unsub());
  };
};
