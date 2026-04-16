import { deleteField, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";

export async function toggleReaction(collectionName, chatId, messageId, userId, emoji) {
  const ref = doc(db, collectionName, chatId, "messages", messageId);

  // Use deleteField if emoji is empty to keep Firestore clean
  await updateDoc(ref, {
    [`reactions.${userId}`]: emoji ? emoji : deleteField(),
  });
}
