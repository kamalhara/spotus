import { useUser } from"@clerk/expo";
import { useEffect } from"react";
import syncUserToFirebase from"../lib/syncUser";

export default function useSyncUser() {
 const { user, isLoaded } = useUser();

 // Automatically sync Clerk user profile to Firestore on login or update
 useEffect(() => {
 if (!isLoaded || !user) return;

 syncUserToFirebase(user);
 }, [isLoaded, user]);
}
