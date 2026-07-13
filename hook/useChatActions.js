import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { arrayUnion, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { useModal } from "../context/ModalContext";

export const useChatActions = (collectionName, chatDocId, currentUserId) => {
  const { showAlert } = useModal();

  const onCopy = async (message) => {
    if (message?.text) {
      await Clipboard.setStringAsync(message.text);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const onDeleteForMe = async (message) => {
    if (!message?.id || !chatDocId || !collectionName) return;
    try {
      const messageRef = doc(
        db,
        collectionName,
        chatDocId,
        "messages",
        message.id,
      );
      await updateDoc(messageRef, {
        deletedFor: arrayUnion(currentUserId),
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error("Error deleting message for me:", err);
      showAlert("Error", "Could not delete the message.");
    }
  };

  const onUnsend = async (message) => {
    if (!message?.id || !chatDocId || !collectionName) return;
    try {
      const messageRef = doc(
        db,
        collectionName,
        chatDocId,
        "messages",
        message.id,
      );
      await deleteDoc(messageRef);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error("Error unsending message:", err);
      showAlert("Error", "Could not unsend the message.");
    }
  };

 return { onCopy, onDeleteForMe, onUnsend };
};
