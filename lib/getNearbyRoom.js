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

export const getNearbyRooms = async (radiusKm = 10) => {
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

  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      const room = {
        id: doc.id,
        ...doc.data(),
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

  return matchingRooms;
};
