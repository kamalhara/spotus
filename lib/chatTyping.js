import { doc, setDoc } from"firebase/firestore";
import { db } from"../config/firebase.config";

export const setTyping = async (chatId, userId, isTyping) => {
 try {
 await setDoc(doc(db,"chats", chatId), {
 typing: { [userId]: isTyping }
 }, { merge: true });
 } catch (error) {
 console.error("Error updating typing status:", error);
 }
};
