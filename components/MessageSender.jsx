import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { setTyping } from "../lib/chatTyping";

const MEDIA_OPTIONS = [
  {
    key: "camera",
    icon: "camera",
    label: "Camera",
    bgColor: "#EEF2FF",
    iconColor: "#4F46E5",
  },
  {
    key: "photo",
    icon: "image",
    label: "Gallery",
    bgColor: "#F0FDF4",
    iconColor: "#10B981",
  },
  {
    key: "file",
    icon: "document-text",
    label: "File",
    bgColor: "#FFF7ED",
    iconColor: "#F59E0B",
  },
  {
    key: "location",
    icon: "location",
    label: "Location",
    bgColor: "#FDF2F8",
    iconColor: "#EC4899",
  },
];

export default function MessageSender({
  handleSend,
  chatId,
  currentUserId,
  handleSendImage,
}) {
  const [message, setMessage] = useState("");
  const [showMediaMenu, setShowMediaMenu] = useState(false);

  const isActive = message.trim().length > 0;

  const typingTimeout = useRef(null);
  const isTypingLocal = useRef(false);

  const [image, setImage] = useState(null);

  const toggleMediaMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMediaMenu((prev) => !prev);
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
    handleSend(message);
    setMessage("");
  };

  const handleMediaOption = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const pickImage = async () => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access the media library.",
        );
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],

        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setShowMediaMenu(false);
        handleSendImage(uri);
      }
    };

    if (key === "camera") {
      // Handle camera functionality
    }
    if (key === "photo") {
      pickImage();
    }
    if (key === "file") {
      // Handle file functionality
    }
    if (key === "location") {
      // Handle location functionality
    }
    // Placeholder — each key can route to actual functionality later
  };

  return (
    <View>
      {/* Backdrop overlay to dismiss the menu */}
      {showMediaMenu && (
        <Pressable
          onPress={() => setShowMediaMenu(false)}
          className="absolute -top-[1000px] -left-5 -right-5 bottom-0 z-[1]"
        />
      )}

      {/* Media Menu Popup */}
      {showMediaMenu && (
        <View className="absolute bottom-[60px] left-0 right-0 z-10">
          <View className="bg-white rounded-3xl py-5 px-4 mx-1 shadow-lg shadow-black/10 border border-border-light">
            <View className="flex-row justify-around items-center">
              {MEDIA_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleMediaOption(option.key)}
                  activeOpacity={0.7}
                  className="items-center w-[72px]"
                >
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: option.bgColor }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={option.iconColor}
                    />
                  </View>
                  <Text className="text-[11px] font-semibold text-gray-500 tracking-tight">
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Input Bar */}
      <View className="flex-row items-center w-full bg-white rounded-full p-1.5 border border-border shadow-sm shadow-slate-100">
        <TouchableOpacity
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-alt ml-0.5"
          onPress={toggleMediaMenu}
        >
          <Ionicons
            name={showMediaMenu ? "close" : "add"}
            size={22}
            color="#94A3B8"
          />
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

        <TouchableOpacity
          disabled={!isActive}
          onPress={onSend}
          className={`w-[42px] h-[42px] rounded-full items-center justify-center mr-0.5 ${isActive ? "bg-primary" : "bg-surface-alt"}`}
        >
          <Ionicons
            name="send"
            size={17}
            color={isActive ? "white" : "#CBD5E1"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
