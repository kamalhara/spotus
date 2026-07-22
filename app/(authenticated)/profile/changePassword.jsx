import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../../../components/ui/CustomInput";
import { useTheme } from "../../../context/ThemeContext";
import { useModal } from "../../../context/ModalContext";

export default function ChangePassword() {
  const router = useRouter();
  const { user } = useUser();
  const { showAlert } = useModal();
  const { isDark } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [formError, setFormError] = useState("");

  const handleUpdatePassword = async () => {
    setFormError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError("Complete all password fields.");
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setFormError("Use at least 8 characters with a letter and a number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setFormError("Choose a password different from your current password.");
      return;
    }

    try {
      setIsUpdating(true);
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.back();
      showAlert("Password updated", "Your password was changed and other sessions were signed out.");
    } catch (error) {
      const message = error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
      setFormError(message || "Could not update your password. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView className="bg-bg flex-1" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
              {/* Header */}
              <View className="flex-row items-center gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1C1C20] items-center justify-center border border-transparent dark:border-[#2C2C30]"
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={isDark ? "#FFAB99" : "#FF6B47"}
                  />
                </TouchableOpacity>
                <Text className="text-secondary dark:text-gray-100 font-display font-extrabold text-xl">
                  Change Password
                </Text>
              </View>

              {/* Progress/Step Indicator */}
              <View className="flex-row gap-2 mt-8 mb-8">
                <View className="h-1.5 rounded-full bg-primary w-10" />
                <View className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 w-6" />
              </View>

              <View className="flex flex-col gap-4">
                <CustomInput
                  label="Current Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  icon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                  }
                />

                <CustomInput
                  label="New Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon={
                    <Ionicons name="shield-outline" size={20} color="#9CA3AF" />
                  }
                />

                <CustomInput
                  label="Confirm New Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon={
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                  }
                />

                <TouchableOpacity
                  className={`bg-primary py-4 rounded-2xl mt-4 items-center ${isUpdating ? "opacity-60" : ""}`}
                  activeOpacity={0.8}
                  disabled={isUpdating}
                  onPress={handleUpdatePassword}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Update Password</Text>
                  )}
                </TouchableOpacity>
                {formError ? (
                  <Text className="text-red-500 text-sm text-center mt-1">{formError}</Text>
                ) : null}
              </View>

              <Text className="text-gray-400 dark:text-gray-500 text-xs text-center mt-8 px-4">
                Your password must be at least 8 characters long and include a
                mix of letters and numbers.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
