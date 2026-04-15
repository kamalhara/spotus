import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";

export const ChatSeen = async (chatId, userId) => {
  if (!chatId || !userId) return;

  try {
    const msgRef = collection(db, "chats", chatId, "messages");
    const snap = await getDocs(msgRef);

    const updates = [];
    let hasUnseen = false;

    snap.forEach((msgDoc) => {
      const data = msgDoc.data();

      if (data.senderId !== userId) {
        const seenBy = data.seenBy || [];

        // only update if not already seen
        if (!seenBy.includes(userId)) {
          hasUnseen = true;
          updates.push(
            updateDoc(doc(db, "chats", chatId, "messages", msgDoc.id), {
              seenBy: [...seenBy, userId],
            }),
          );
        }
      }
    });

    await Promise.all(updates);

    // ✅ Sync the parent chat document so the list view unread indicator clears
    if (hasUnseen) {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const lastSeenBy = chatSnap.data().lastMessageSeenBy || [];
        if (!lastSeenBy.includes(userId)) {
          await updateDoc(chatRef, {
            lastMessageSeenBy: [...lastSeenBy, userId],
          });
        }
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
