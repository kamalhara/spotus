import { doc, updateDoc } from "firebase/firestore";
import { db } from"../config/firebase.config";

export const ChatSeen = async (chatId, userId, messages = [], chatDoc = null) => {
  if (!chatId || !userId || !messages.length) return;

  try {
    const updates = [];
    let hasUnseen = false;

    messages.forEach((msg) => {
      if (msg.senderId !== userId) {
        const seenBy = msg.seenBy || [];
        if (!seenBy.includes(userId)) {
          hasUnseen = true;
          updates.push(
            updateDoc(doc(db, "chats", chatId, "messages", msg.id), {
              seenBy: [...seenBy, userId],
            }),
          );
        }
      }
    });

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    if (hasUnseen && chatDoc) {
      const lastSeenBy = chatDoc.lastMessageSeenBy || [];
      if (!lastSeenBy.includes(userId)) {
        await updateDoc(doc(db, "chats", chatId), {
          lastMessageSeenBy: [...lastSeenBy, userId],
        });
      }
    }
  } catch (err) {
    console.error("Error updating seen status:", err);
  }
};

/**
 * Utility to check if a chat session has unread messages for a specific user
 * @param {object} chat - The chat document data
 * @param {string} userId - The current user's ID
 * @returns {boolean}
 */
export const isChatUnseen = (chat, userId) => {
  if (!chat || !userId) return false;
  return (
    chat.lastMessageSenderId !== userId &&
    !chat.lastMessageSeenBy?.includes(userId)
  );
};

/**
 * Mark all unseen room messages as seen by the current user.
 * @param {string} roomId - The room document ID
 * @param {string} userId - The current user's ID
 * @param {Array} messages - Pre-fetched messages array
 * @param {object} roomDoc - Parent room document
 */
export const RoomSeen = async (roomId, userId, messages = [], roomDoc = null) => {
  if (!roomId || !userId || !messages.length) return;

  try {
    const updates = [];
    let hasUnseen = false;

    messages.forEach((msg) => {
      if (msg.senderId !== userId) {
        const seenBy = msg.seenBy || [];
        if (!seenBy.includes(userId)) {
          hasUnseen = true;
          updates.push(
            updateDoc(doc(db, "rooms", roomId, "messages", msg.id), {
              seenBy: [...seenBy, userId],
            }),
          );
        }
      }
    });

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    if (hasUnseen && roomDoc) {
      const lastSeenBy = roomDoc.lastMessageSeenBy || [];
      if (!lastSeenBy.includes(userId)) {
        await updateDoc(doc(db, "rooms", roomId), {
          lastMessageSeenBy: [...lastSeenBy, userId],
        });
      }
    }
  } catch (err) {
    console.error("Error updating room seen status:", err);
  }
};

/**
 * Utility to check if a room has unread messages for a specific user
 * @param {object} room - The room document data
 * @param {string} userId - The current user's ID
 * @returns {boolean}
 */
export const isRoomUnseen = (room, userId) => {
 if (!room || !userId) return false;
 return (
 room.lastMessageSenderId !== userId &&
 !room.lastMessageSeenBy?.includes(userId)
 );
};

