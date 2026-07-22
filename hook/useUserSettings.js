import { doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "../config/firebase.config";
import useFirestoreUser from "./useFireStoreUser";

export default function useUserSettings(defaults) {
  const defaultsRef = useRef(defaults);
  const { firestoreUser, loading } = useFirestoreUser();
  const [settings, setSettings] = useState(defaults);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    if (!firestoreUser) return;
    setSettings((current) => {
      const loaded = { ...current };
      Object.entries(defaultsRef.current).forEach(([key, fallback]) => {
        loaded[key] = firestoreUser[key] ?? fallback;
      });
      return loaded;
    });
  }, [firestoreUser]);

  const updateSetting = useCallback(async (key, value) => {
    if (!firestoreUser?.id) return false;
    const previous = settings[key];
    setSettings((current) => ({ ...current, [key]: value }));
    setSaving((current) => ({ ...current, [key]: true }));
    try {
      await updateDoc(doc(db, "users", firestoreUser.id), { [key]: value });
      return true;
    } catch (error) {
      setSettings((current) => ({ ...current, [key]: previous }));
      console.error(`Error saving ${key}:`, error);
      return false;
    } finally {
      setSaving((current) => ({ ...current, [key]: false }));
    }
  }, [firestoreUser?.id, settings]);

  return { firestoreUser, loading, settings, saving, updateSetting };
}
