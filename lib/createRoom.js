import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase.config";

export const createRoom = async (title, category, ageSimilarity, userId) => {
  if (!title || !category) return;

  await addDoc(collection(db, "rooms"), {
    title,
    category,
    ageSimilarity,
    createdBy: userId,
    participants: [userId],
    createdAt: serverTimestamp(),
  });
};
