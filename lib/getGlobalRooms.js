import { collection, getDocs, limit, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../config/firebase.config";

const CACHE_KEY = "globalRooms_cache_v3";
const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function getGlobalRooms() {
  try {
    // 1. Check local cache
    const cachedDataString = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedDataString) {
      const cachedData = JSON.parse(cachedDataString);
      const isExpired = Date.now() - cachedData.timestamp > CACHE_EXPIRY_MS;
      if (!isExpired) {
        // Return cache first, but optionally we could refresh silently in background
        // As per requirements: "Return cache first. Refresh silently in background."
        refreshGlobalRoomsSilently();
        return cachedData.rooms;
      }
    }
    
    // 2. Fetch if no valid cache
    return await fetchAndCacheGlobalRooms();
  } catch (error) {
    console.error("Error fetching global rooms:", error);
    return [];
  }
}

async function refreshGlobalRoomsSilently() {
  try {
    await fetchAndCacheGlobalRooms();
  } catch (e) {
    console.error("Silent refresh failed:", e);
  }
}

async function fetchAndCacheGlobalRooms() {
  const globalQ = query(
    collection(db, "globalRooms"),
    where("isActive", "==", true),
    limit(5)
  );

  const snapshot = await getDocs(globalQ);
  const rooms = snapshot.docs.map(doc => {
    const data = doc.data();
    let createdAt = Date.now();
    if (data.createdAt) {
      if (typeof data.createdAt.toMillis === "function") {
        createdAt = data.createdAt.toMillis();
      } else if (typeof data.createdAt === "number") {
        createdAt = data.createdAt;
      }
    }

    return {
      id: doc.id,
      ...data,
      createdAt
    };
  });

  // Store in cache
  const cachePayload = {
    timestamp: Date.now(),
    rooms
  };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
  console.log("Fetched and cached global rooms. Count:", rooms.length);

  return rooms;
}
