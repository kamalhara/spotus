import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";

export const setTyping = async (
  chatId,
  userId,
  isTyping,
  collectionName = "chats",
) => {
  if (!chatId || !userId) return;

  try {
    await updateDoc(doc(db, collectionName, chatId), {
      [`typing.${userId}`]: isTyping,
    });
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
};
