import { doc, updateDoc } from "firebase/firestore";
import { db } from"../config/firebase.config";

// Track which messages we've already marked as seen to prevent
// redundant Firestore writes on every re-render.
const seenMessageIds = new Set();
const seenChatDocs = new Set();

export const ChatSeen = async (chatId, userId, messages = [], chatDoc = null) => {
  if (!chatId || !userId || !messages.length) return;

  try {
    const updates = [];
    let hasUnseen = false;

    messages.forEach((msg) => {
      if (msg.senderId !== userId) {
        const seenBy = msg.seenBy || [];
        const key = `${chatId}_${msg.id}_${userId}`;
        if (!seenBy.includes(userId) && !seenMessageIds.has(key)) {
          hasUnseen = true;
          seenMessageIds.add(key);
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
      const chatKey = `${chatId}_parent_${userId}`;
      if (!lastSeenBy.includes(userId) && !seenChatDocs.has(chatKey)) {
        seenChatDocs.add(chatKey);
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

// Track which room messages we've already marked as seen
const seenRoomMessageIds = new Set();
const seenRoomDocs = new Set();

/**
 * Mark all unseen room messages as seen by the current user.
 * Uses a deduplication set to prevent redundant writes when the
 * component re-renders with the same message list.
 *
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
        const key = `${roomId}_${msg.id}_${userId}`;
        if (!seenBy.includes(userId) && !seenRoomMessageIds.has(key)) {
          hasUnseen = true;
          seenRoomMessageIds.add(key);
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
      const roomKey = `${roomId}_parent_${userId}`;
      if (!lastSeenBy.includes(userId) && !seenRoomDocs.has(roomKey)) {
        seenRoomDocs.add(roomKey);
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
