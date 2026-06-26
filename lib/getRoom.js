import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase.config";

export const getRooms = async (currentUserId = null) => {
  const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));

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
    // Skip ghost rooms from public feeds unless user is creator or participant
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
    
    validRooms.push({
      id: document.id,
      ...data,
    });
  });

  // Asynchronously delete expired rooms from Firebase to clean up the DB
  if (expiredDocs.length > 0) {
    Promise.all(
      expiredDocs.map((id) => deleteDoc(doc(db, "rooms", id)))
    ).catch(err => console.error("Error deleting expired rooms:", err));
  }

  return validRooms;
};
