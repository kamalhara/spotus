import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.config";

/**
 * Deletes a room and all of its messages from Firestore.
 * This ensures that subcollections are not left orphaned in the database.
 * 
 * @param {string} roomId - The ID of the room to delete
 */
export const deleteRoomWithMessages = async (roomId) => {
  try {
    // 1. Fetch and delete all messages in the subcollection first
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const messagesSnapshot = await getDocs(messagesRef);
    
    if (!messagesSnapshot.empty) {
      const deletePromises = messagesSnapshot.docs.map(msgDoc => 
        deleteDoc(doc(db, "rooms", roomId, "messages", msgDoc.id))
      );
      await Promise.all(deletePromises);
    }

    // 2. Delete the room document itself
    await deleteDoc(doc(db, "rooms", roomId));
    
  } catch (error) {
    console.error(`Error deleting room ${roomId} and its messages:`, error);
  }
};

/**
 * Deletes a DM chat and all of its messages from Firestore.
 * This ensures that subcollections are not left orphaned in the database.
 * 
 * @param {string} chatId - The ID of the chat to delete
 */
export const deleteChatWithMessages = async (chatId) => {
  try {
    // 1. Fetch and delete all messages in the subcollection first
    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesSnapshot = await getDocs(messagesRef);
    
    if (!messagesSnapshot.empty) {
      const deletePromises = messagesSnapshot.docs.map(msgDoc => 
        deleteDoc(doc(db, "chats", chatId, "messages", msgDoc.id))
      );
      await Promise.all(deletePromises);
    }

    // 2. Delete the chat document itself
    await deleteDoc(doc(db, "chats", chatId));
    
  } catch (error) {
    console.error(`Error deleting chat ${chatId} and its messages:`, error);
  }
};
