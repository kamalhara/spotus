import { useUser } from "@clerk/expo";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase.config";

export default function useFirestoreUser() {
  const { user, isLoaded } = useUser();
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time listener for current user's Firestore profile.
  // Replaces the old getDoc (one-shot) approach so profile changes
  // (bio, pic, settings) are immediately reflected across all screens.
  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", user.id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setFirestoreUser({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore user snapshot error:", err);
        setLoading(false);
      }
    );

    return unsub;
  }, [isLoaded, user]);

  return { firestoreUser, loading };
}
