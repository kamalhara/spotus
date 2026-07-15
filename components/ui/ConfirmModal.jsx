import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import GlassContainer from "./GlassContainer";

function ActionButton({ label, onPress, style = "default", fullWidth = false }) {
  const isCancel = style === "cancel";
  const backgroundClass =
    style === "destructive"
      ? "bg-danger"
      : style === "info"
        ? "bg-info"
        : style === "success"
          ? "bg-success"
      : isCancel
        ? "bg-surface-alt dark:bg-[#2A2A2E]"
        : "bg-primary";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`${fullWidth ? "w-full" : "flex-1"} h-12 rounded-xl items-center justify-center active:opacity-75 ${backgroundClass}`}
    >
      <Text
        className={`text-[14px] font-semibold ${isCancel ? "text-secondary dark:text-gray-200" : "text-white"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

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
  const { isDark } = useTheme();
  const confirmStyle = confirmButtonStyle.includes("red")
    ? "destructive"
    : confirmButtonStyle.includes("blue")
      ? "info"
      : confirmButtonStyle.includes("green")
        ? "success"
        : "default";

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center px-6"
        style={{
          backgroundColor: isDark
            ? "rgba(0,0,0,0.68)"
            : "rgba(17,17,18,0.42)",
        }}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
          className="absolute inset-0"
        />

        <GlassContainer
          borderRadius={28}
          glassEffectStyle="regular"
          fallbackClassName="bg-white dark:bg-[#1C1C20] border border-border dark:border-[#303034]"
          style={{ width: "100%", maxWidth: 380, alignSelf: "center" }}
        >
          <View className="px-6 pt-6 pb-6">
            <View className="flex-row items-start mb-6">
              <View className="flex-1 pr-4">
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: `${iconColor}14` }}
                >
                  <Ionicons name={icon} size={22} color={iconColor} />
                </View>
                <Text className="text-[24px] leading-8 font-display text-secondary dark:text-gray-100 tracking-tight">
                  {title}
                </Text>
                {message ? (
                  <Text className="text-[14px] text-muted dark:text-gray-400 leading-5 mt-2">
                    {message}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                className="w-10 h-10 rounded-2xl bg-surface-alt dark:bg-[#2A2A2E] items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#8A8A8A" />
              </Pressable>
            </View>

            {options ? (
              <View className="gap-2.5">
                {options.map((option, index) => (
                  <ActionButton
                    key={`${option.text}-${index}`}
                    label={option.text}
                    style={option.style || "default"}
                    fullWidth
                    onPress={option.onPress}
                  />
                ))}
              </View>
            ) : cancelText ? (
              <View className="flex-row gap-3">
                <ActionButton
                  label={cancelText}
                  style="cancel"
                  onPress={onClose}
                />
                <ActionButton
                  label={confirmText}
                  style={confirmStyle}
                  onPress={onConfirm}
                />
              </View>
            ) : (
              <ActionButton
                label={confirmText}
                style={confirmStyle}
                fullWidth
                onPress={onConfirm}
              />
            )}
          </View>
        </GlassContainer>
      </View>
    </Modal>
  );
}
