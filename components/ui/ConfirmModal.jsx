import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import GlassContainer from "./GlassContainer";

export default function ConfirmModal({
  isVisible,
  onClose,
  title,
  message,
  onConfirm,
  icon = "alert-circle-outline",
  iconColor = "#EF4444",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonStyle = "bg-red-500",
  options,
}) {
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/40 px-6">
        <GlassContainer borderRadius={28}>
          <View className="items-center w-[320px] p-6">
            <View
              className="w-14 h-14 rounded-[20px] items-center justify-center mb-4"
              style={{ backgroundColor: `${iconColor}15` }}
            >
              <Ionicons name={icon} size={28} color={iconColor} />
            </View>

            {/* Text Content */}
            <Text className="text-[20px] font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
              {title}
            </Text>
            <Text className="text-[15px] text-gray-500 dark:text-gray-400 text-center leading-5 mb-6">
              {message}
            </Text>

            {/* Action Buttons */}
            {options ? (
              <View className="w-full gap-2">
                {options.map((opt, i) => (
                  <Pressable
                    key={i}
                    onPress={() => {
                      onClose();
                      if (opt.onPress) opt.onPress();
                    }}
                    className={`items-center justify-center py-3.5 rounded-[14px] active:opacity-80 ${
                      opt.style === "destructive"
                        ? "bg-red-500"
                        : opt.style === "cancel"
                        ? "bg-gray-100 dark:bg-[#2A2A2E]"
                        : "bg-blue-500"
                    }`}
                  >
                    <Text
                      className={`font-semibold text-[15px] ${
                        opt.style === "cancel"
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-white"
                      }`}
                    >
                      {opt.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="flex-row gap-3 w-full">
                {cancelText && (
                  <Pressable
                    onPress={onClose}
                    className="flex-1 items-center justify-center py-3.5 rounded-[14px] bg-gray-100 dark:bg-[#2A2A2E] active:opacity-80"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold text-[15px]">
                      {cancelText}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => {
                    onClose();
                    if (onConfirm) onConfirm();
                  }}
                  className={`flex-1 items-center justify-center py-3.5 rounded-[14px] ${confirmButtonStyle} active:opacity-80`}
                >
                  <Text className="text-white font-semibold text-[15px]">
                    {confirmText}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </GlassContainer>
      </View>
    </Modal>
  );
}
