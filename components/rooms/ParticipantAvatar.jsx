import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { db } from "../../config/firebase.config";

export default function ParticipantAvatar({ userId, size = 28, index = 0 }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [initial, setInitial] = useState("");

  const AVATAR_COLORS = [
    "#6366F1",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#3B82F6",
    "#8B5CF6",
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && isMounted) {
          const data = userDoc.data();
          const avatarUrl = data.profilePic || data.imageUrl;
          const name = data.userName || data.fullName;
          
          if (avatarUrl) {
            setImageUrl(avatarUrl);
          } else if (name) {
            setInitial(name.charAt(0).toUpperCase());
          } else {
            setInitial(String.fromCharCode(65 + index)); // Fallback to A, B, C
          }
        }
      } catch (err) {
        console.warn("Failed to fetch user avatar", err);
      }
    };
    if (userId) fetchUser();
    return () => { isMounted = false; };
  }, [userId, index]);

  return (
    <View
      className="rounded-full border-2 border-white dark:border-[#1A1A22] items-center justify-center overflow-hidden bg-surface dark:bg-[#1A1A22]"
      style={{
        width: size,
        height: size,
        backgroundColor: imageUrl ? "transparent" : AVATAR_COLORS[index % AVATAR_COLORS.length],
      }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <Text
          className="text-white font-display font-black"
          style={{ fontSize: size * 0.4 }}
        >
          {initial || String.fromCharCode(65 + index)}
        </Text>
      )}
    </View>
  );
}
