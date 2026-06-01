import { addDoc, collection, serverTimestamp } from"firebase/firestore";
import { db } from"../config/firebase.config";

export const createRoom = async (
 title,
 description,
 category,
 userId,
) => {
 if (!title || !category) return;

 await addDoc(collection(db,"rooms"), {
 title,
 description,
 category,
 createdBy: userId,
 participants: [userId],
 createdAt: serverTimestamp(),
 });
};
