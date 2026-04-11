import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

export default function MessageSender({ handleSend }) {
  const [message, setMessage] = useState("");

  const isActive = message.trim().length > 0;

  return (
    <View className="flex-row items-center w-full bg-white rounded-full p-1.5 border border-slate-200 shadow-sm shadow-slate-100">
      <TouchableOpacity
        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 ml-0.5"
        onPress={() => {}}
      >
        <Ionicons name="add" size={22} color="#6B7280" />
      </TouchableOpacity>

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        placeholderTextColor="#9CA3AF"
        className="flex-1 px-3 text-[15px] text-secondary tracking-wide h-10"
        returnKeyType="send"
      />

      <TouchableOpacity
        disabled={!isActive}
        onPress={() => {
          if (handleSend) {
            handleSend(message);
            setMessage(""); // Clear input on send
          }
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 2,
          backgroundColor: isActive ? "#4F46E5" : "#F3F4F6",
        }}
      >
        <Ionicons
          name="send"
          size={16}
          color={isActive ? "white" : "#9CA3AF"}
          style={{ marginLeft: isActive ? 2 : 0 }}
        />
      </TouchableOpacity>
    </View>
  );
}
