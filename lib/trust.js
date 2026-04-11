import { doc, getDoc, increment, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Checks if a user can send a direct message based on their room trust score.
 * @param {number} roomTrust - The user's trust score within a specific room.
 * @returns {boolean}
 */
export const canSendDM = (roomTrust = 0) => {
  return (roomTrust ?? 0) >= 10;
};

/**
 * Fetches the trust score for a specific user in a specific room.
 * @param {object} db - Firestore instance.
 * @param {string} roomId - The ID of the room.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>}
 */
export const getRoomTrust = async (db, roomId, userId) => {
  if (!roomId || !userId) return 0;
  try {
    const trustRef = doc(db, "rooms", roomId, "trust", userId);
    const snap = await getDoc(trustRef);
    return snap.exists() ? (snap.data().messagesCount ?? 0) : 0;
  } catch (err) {
    console.error("Error fetching room trust:", err);
    return 0;
  }
};

/**
 * Updates room trust when a user sends a message.
 * @param {object} db - Firestore instance.
 * @param {string} roomId - The ID of the room.
 * @param {string} userId - The ID of the user.
 * @param {string} messageText - The content of the message.
 */
export const updateTrustOnMessage = async (db, roomId, userId, messageText) => {
  if (!roomId || !userId) return;

  const roomTrustRef = doc(db, "rooms", roomId, "trust", userId);

  try {
    // Update Room Trust (always increment messagesCount)
    await setDoc(roomTrustRef, {
      messagesCount: increment(1),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.error("Error updating trust scores:", err);
  }
};
