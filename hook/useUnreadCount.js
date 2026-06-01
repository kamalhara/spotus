import { collection, onSnapshot, query, where } from"firebase/firestore";
import { useEffect, useState } from"react";
import { db } from"../config/firebase.config";
import { isChatUnseen } from"../lib/chatSeen";

/**
 * Hook to listen to the total number of unread chat threads for the current user.
 * @param {string} userId - The current user's ID
 * @returns {number} The total count of chats with unread messages
 */
export default function useUnreadCount(userId) {
 const [unreadCount, setUnreadCount] = useState(0);

 useEffect(() => {
 if (!userId) {
 setUnreadCount(0);
 return;
 }

 const q = query(
 collection(db,"chats"),
 where("participants","array-contains", userId)
 );

 const unsubscribe = onSnapshot(
 q,
 (snapshot) => {
 let count = 0;
 snapshot.forEach((doc) => {
 const chat = { id: doc.id, ...doc.data() };
 if (isChatUnseen(chat, userId)) {
 count++;
 }
 });
 setUnreadCount(count);
 },
 (error) => {
 console.error("Error listening to unread chats:", error);
 }
 );

 return () => unsubscribe();
 }, [userId]);

 return unreadCount;
}
