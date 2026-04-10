import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase.config";

export const getRooms = async () => {
  const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
