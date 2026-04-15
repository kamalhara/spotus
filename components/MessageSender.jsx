import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Animated, TextInput, TouchableOpacity, View } from "react-native";
import { setTyping } from "../lib/chatTyping";

export default function MessageSender({ handleSend, chatId, currentUserId }) {
  const [message, setMessage] = useState("");
  const sendScaleAnim = useRef(new Animated.Value(1)).current;

  const isActive = message.trim().length > 0;

  const typingTimeout = useRef(null);
  const isTypingLocal = useRef(false);

  const animateSend = () => {
    Animated.sequence([
      Animated.spring(sendScaleAnim, {
        toValue: 0.7,
        useNativeDriver: true,
        speed: 80,
      }),
      Animated.spring(sendScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 12,
      }),
    ]).start();
  };

  const handleTyping = () => {
    if (!chatId || !currentUserId) return;

    if (!isTypingLocal.current) {
      isTypingLocal.current = true;
      setTyping(chatId, currentUserId, true);
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      isTypingLocal.current = false;
      setTyping(chatId, currentUserId, false);
    }, 1500);
  };

  const onSend = () => {
    if (!isActive || !handleSend) return;

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    isTypingLocal.current = false;
    setTyping(chatId, currentUserId, false);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateSend();
    handleSend(message);
    setMessage("");
  };

  return (
    <View className="flex-row items-center w-full bg-white rounded-full p-1.5 border border-border shadow-sm shadow-slate-100">
      <TouchableOpacity
        className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-alt ml-0.5"
        onPress={() => {}}
      >
        <Ionicons name="add" size={22} color="#94A3B8" />
      </TouchableOpacity>

      <TextInput
        value={message}
        onChangeText={(text) => {
          setMessage(text);
          handleTyping();
        }}
        placeholder="Type a message..."
        placeholderTextColor="#CBD5E1"
        className="flex-1 px-3.5 text-[15px] text-secondary font-medium tracking-wide h-11"
        returnKeyType="send"
        onSubmitEditing={onSend}
      />

      <Animated.View style={{ transform: [{ scale: sendScaleAnim }] }}>
        <TouchableOpacity
          disabled={!isActive}
          onPress={onSend}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 2,
            backgroundColor: isActive ? "#4F46E5" : "#F1F5F9",
          }}
        >
          <Ionicons
            name="send"
            size={17}
            color={isActive ? "white" : "#CBD5E1"}
            style={{ marginLeft: isActive ? 2 : 0 }}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
