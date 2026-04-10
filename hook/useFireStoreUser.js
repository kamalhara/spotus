import { useUser } from "@clerk/expo";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase.config";

export default function useFirestoreUser() {
  const { user, isLoaded } = useUser();
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !user) return;

      try {
        const ref = doc(db, "users", user.id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setFirestoreUser({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.log("Firestore user fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoaded, user]);

  return { firestoreUser, loading };
}
