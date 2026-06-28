import { collection, getDocs, limit, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../config/firebase.config";

const CACHE_KEY = "exploreRoomsCache";
const CACHE_TIME_KEY = "exploreRoomsCacheTime";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const getExploreRooms = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    const cacheTime = await AsyncStorage.getItem(CACHE_TIME_KEY);
    const now = Date.now();

    if (cached && cacheTime && now - parseInt(cacheTime, 10) < CACHE_TTL_MS) {
      return JSON.parse(cached);
    }

    // Try exploreRooms collection first
    const exploreQ = query(collection(db, "exploreRooms"), limit(10));
    let snap = await getDocs(exploreQ);
    let rawDocs = snap.docs;

    // Fallback if exploreRooms doesn't exist or is empty
    if (rawDocs.length === 0) {
      const fallbackQ = query(
        collection(db, "rooms"),
        where("visibility", "==", "public"),
        limit(10)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      rawDocs = fallbackSnap.docs;
    }

    const rooms = [];
    rawDocs.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Skip expired rooms
      if (data.expiresAt) {
        const expirationMs = data.expiresAt.toMillis ? data.expiresAt.toMillis() : data.expiresAt;
        if (expirationMs < now) return;
      }

      // Anonymize coordinates: round to 2 decimal places to cluster around a ~1km-10km radius (city/neighborhood level)
      // e.g. 37.7749 -> 37.77
      const approxLat = Math.round((data.latitude || 0) * 100) / 100;
      const approxLng = Math.round((data.longitude || 0) * 100) / 100;

      // Remove sensitive fields
      delete data.exactLatitude;
      delete data.exactLongitude;
      delete data.inviteCode;

      rooms.push({
        id: docSnap.id,
        ...data,
        latitude: approxLat,
        longitude: approxLng,
        isApproximate: true,
      });
    });

    // Cache the results
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(rooms));
    await AsyncStorage.setItem(CACHE_TIME_KEY, now.toString());

    return rooms;
  } catch (error) {
    console.error("Error fetching explore rooms:", error);
    // If we fail and have a cache (even expired), return it gracefully
    const fallbackCache = await AsyncStorage.getItem(CACHE_KEY);
    if (fallbackCache) return JSON.parse(fallbackCache);
    return [];
  }
};
