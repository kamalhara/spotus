import { collection, onSnapshot, query, where } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../config/firebase.config";
import useFirestoreUser from "../hook/useFireStoreUser";
import { isChatUnseen } from "../lib/chatSeen";
import { fetchUserBatch } from "../lib/userCache";

const ChatContext = createContext({
  chats: [],
  unreadCount: 0,
  loading: true,
});

export const ChatProvider = ({ children }) => {
  const { firestoreUser } = useFirestoreUser();
  const currentUserId = firestoreUser?.id;

  const [chats, setChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUserId)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const chatDocs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Use the batching cache instead of individual getDoc calls.
      // This collapses N separate reads into 1-2 batched queries.
      const enriched = await Promise.all(
        chatDocs.map(async (chat) => {
          const otherUserId = chat.participants?.find((id) => id !== currentUserId);
          if (!otherUserId) return { ...chat, otherUser: null };

          const userData = await fetchUserBatch(otherUserId);
          return {
            ...chat,
            otherUser: userData
              ? { id: otherUserId, ...userData }
              : null,
          };
        })
      );

      const blocked = firestoreUser?.blockedUsers || [];
      const filteredChats = enriched.filter((c) => !blocked.includes(c.otherUser?.id));

      setChats(filteredChats);

      let unread = 0;
      filteredChats.forEach((chat) => {
        if (isChatUnseen(chat, currentUserId)) {
          unread++;
        }
      });
      setUnreadCount(unread);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chats in context:", error);
      setLoading(false);
    });

    return unsub;
  }, [currentUserId, firestoreUser?.blockedUsers]);

  return (
    <ChatContext.Provider value={{ chats, unreadCount, loading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChats = () => useContext(ChatContext);
