import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassContainer from "../../components/ui/GlassContainer";
import { setTyping } from "../../lib/chatTyping";

const MEDIA_OPTIONS = [
  {
    key: "camera",
    icon: "camera",
    label: "Camera",
    bgColor: "#EEF2FF",
    iconColor: "#FF6B47",
  },
  {
    key: "photo",
    icon: "image",
    label: "Gallery",
    bgColor: "#F0FDF4",
    iconColor: "#10B981",
  },
];

export default function MessageSender({
  handleSend,
  chatId,
  currentUserId,
  handleSendImage,
  replyTo,
  onCancelReply,
  editingMessage,
  setEditingMessage,
  handleEditMessage,
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const isActive = message.trim().length > 0;
  const canSend = isActive;

  const typingTimeout = useRef(null);
  const isTypingLocal = useRef(false);
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();
  
  const sendScale = useRef(new Animated.Value(1)).current;

  // Auto-focus input when replying or editing
  useEffect(() => {
    if (replyTo || editingMessage) {
      inputRef.current?.focus();
    }
  }, [replyTo, editingMessage]);

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.text || "");
    }
  }, [editingMessage]);

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
    if (!canSend) return;

    // Trigger elastic bounce and heavy haptic on send
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.timing(sendScale, { toValue: 1.2, duration: 50, useNativeDriver: true }),
      Animated.spring(sendScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
    ]).start();

    setIsSending(true);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    isTypingLocal.current = false;
    setTyping(chatId, currentUserId, false);

    if (editingMessage && handleEditMessage) {
      handleEditMessage(editingMessage.id, message);
      setEditingMessage(null);
    } else if (handleSend) {
      handleSend(message);
    }

    setMessage("");
    onCancelReply?.();
    setIsSending(false);
  };

  const handleCancelEdit = () => {
    setEditingMessage?.(null);
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

    const pickCamera = async () => {
      if (!cameraPermission?.granted) {
        const permission = await requestCameraPermission();
        if (!permission?.granted) {
          Alert.alert(
            "Permission Required",
            "Please grant permission to access the camera.",
          );
          return;
        }
      }
      let result = await ImagePicker.launchCameraAsync({
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
      pickCamera();
    }
    if (key === "photo") {
      pickImage();
    }
  };

  return (
    <View style={{ paddingBottom: insets.bottom }}>
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
          <GlassContainer
            borderRadius={16}
            fallbackClassName="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30]"
            style={{
              padding: 12,
              marginHorizontal: 4,
              shadowColor: "#94A3B8",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row gap-3">
              {MEDIA_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleMediaOption(option.key)}
                  activeOpacity={0.7}
                  className="flex-1 flex-row items-center bg-gray-50 dark:bg-[#242428] rounded-2xl p-3 border border-gray-100 dark:border-[#2C2C30]"
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: option.bgColor }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={option.iconColor}
                    />
                  </View>
                  <Text className="text-sm font-bold text-secondary dark:text-gray-100 tracking-tight">
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassContainer>
        </View>
      )}

      {/* Edit Preview Banner */}
      {editingMessage && (
        <View className="mb-2">
          <GlassContainer
            borderRadius={16}
            fallbackClassName="bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30]"
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center mr-3">
              <Ionicons name="create-outline" size={15} color="#FF6B47" />
            </View>
            <View className="flex-1">
              <Text className="text-primary text-xs font-bold">
                Editing message
              </Text>
              <Text
                className="text-gray-400 dark:text-gray-500 text-xs mt-0.5"
                numberOfLines={1}
              >
                {editingMessage.text}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCancelEdit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-8 h-8 rounded-xl bg-surface-alt dark:bg-[#242428] items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </GlassContainer>
        </View>
      )}

      {/* Reply Preview Banner */}
      {replyTo && (
        <View className="mb-2">
          <GlassContainer
            borderRadius={16}
            fallbackClassName="bg-white dark:bg-[#1C1C20] border-l-4 border-l-primary border-y border-r border-border-light dark:border-y-[#2C2C30] dark:border-r-[#2C2C30]"
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#FF6B47",
            }}
          >
            <View className="mr-2">
              <Ionicons name="arrow-undo" size={16} color="#FF6B47" />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-[11px] font-bold text-primary mb-0.5">
                {replyTo.user || "Unknown"}
              </Text>
              <Text
                numberOfLines={1}
                className="text-[13px] text-muted dark:text-gray-400"
              >
                {replyTo.imageUrl ? "📷 Photo" : replyTo.text}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onCancelReply}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-7 h-7 rounded-full bg-surface-alt dark:bg-[#242428] items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </GlassContainer>
        </View>
      )}

      {/* Input Bar */}
      <GlassContainer
        borderRadius={30}
        fallbackClassName="bg-white dark:bg-[#1C1C20] border border-border dark:border-[#2C2C30]"
        style={{
          padding: 6,
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-alt dark:bg-[#242428] ml-0.5"
          onPress={toggleMediaMenu}
        >
          <Ionicons
            name={showMediaMenu ? "close" : "add"}
            size={22}
            color="#94A3B8"
          />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            handleTyping();
          }}
          placeholder="Type a message..."
          placeholderTextColor="#CBD5E1"
          className="flex-1 px-3.5 text-[15px] text-secondary dark:text-gray-100 tracking-tight h-11"
          returnKeyType="send"
          onSubmitEditing={onSend}
          underlineColorAndroid="transparent"
        />

        {/* Send Button */}
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <TouchableOpacity
            disabled={!canSend || isSending}
            onPress={onSend}
            activeOpacity={0.7}
            className={`w-[42px] h-[42px] rounded-full items-center justify-center mr-0.5 ${isActive ? "bg-primary" : "bg-surface-alt dark:bg-[#242428]"}`}
          >
            {isSending ? (
              <ActivityIndicator
                size="small"
                color={isActive ? "white" : "#94A3B8"}
              />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={isActive ? "white" : "#94A3B8"}
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </GlassContainer>
    </View>
  );
}
