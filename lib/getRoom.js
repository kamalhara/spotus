import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { deleteRoomWithMessages } from "./deleteRoom";

/**
 * Fetches rooms that the given user is a participant of.
 * Uses a Firestore query-level filter instead of downloading the entire
 * rooms collection and filtering client-side.
 *
 * @param {string|null} currentUserId - The current user's ID
 * @returns {Promise<Array>} - Valid, non-expired rooms the user participates in
 */
export const getRooms = async (currentUserId = null) => {
  if (!currentUserId) return [];

  const q = query(
    collection(db, "rooms"),
    where("participants", "array-contains", currentUserId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  const now = Date.now();
  const validRooms = [];
  const expiredDocs = [];

  snap.docs.forEach((document) => {
    const data = document.data();

    // Check expiration if it exists
    if (data.expiresAt) {
      const expirationMs = data.expiresAt.toMillis ? data.expiresAt.toMillis() : data.expiresAt;
      if (expirationMs < now) {
        expiredDocs.push(document.id);
        return; // skip adding to valid rooms
      }
    }

    // Skip rooms where the user is banned
    if (data.bannedUsers?.includes(currentUserId)) {
      return;
    }

    validRooms.push({
      id: document.id,
      ...data,
    });
  });

  // Asynchronously delete expired rooms from Firebase to clean up the DB
  if (expiredDocs.length > 0) {
    Promise.all(
      expiredDocs.map((id) => deleteRoomWithMessages(id))
    ).catch(err => console.error("Error deleting expired rooms:", err));
  }

  return validRooms;
};
