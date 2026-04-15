import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase.config";

export default function useTypingIndicator(chatId, currentUserId) {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!chatId || !currentUserId) {
      setIsTyping(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "chats", chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const typingMap = data?.typing || {};

        let someoneElseIsTyping = false;
        // Check if ANYONE in the room other than us is currently typing
        for (const [key, val] of Object.entries(typingMap)) {
          if (key !== currentUserId && val === true) {
            someoneElseIsTyping = true;
            break;
          }
        }

        setIsTyping(someoneElseIsTyping);
      }
    });

    return unsub;
  }, [chatId, currentUserId]);

  return isTyping;
}
