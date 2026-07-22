import { ScrollView, Text, View } from "react-native";
import { useAuth } from "@clerk/expo";
import { useState } from "react";
import { useModal } from "../../../context/ModalContext";
import CustomButton from "../../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";
import { apiRequest } from "../../../lib/api";

const ACCENT = "#EF4444";

export default function DeleteAccount() {
  const { getToken, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showConfirm, showAlert } = useModal();

  const handleDelete = () => {
    showConfirm({
      title: "Delete Account",
      message: "Are you absolutely sure? This action cannot be undone.",
      confirmText: "Delete",
      confirmButtonStyle: "bg-red-500",
      icon: "trash-outline",
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          const token = await getToken();
          await apiRequest("/api/account", { method: "DELETE", token, timeoutMs: 120000 });
          await signOut();
        } catch (error) {
          setIsDeleting(false);
          console.error("Error deleting account:", error);
          showAlert(
            "Error",
            "There was an error deleting your account. Please try again."
          );
        }
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="Delete Account" subtitle="Before you go" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <View className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-4 mb-4">
          <Text className="text-red-600 dark:text-red-400 text-[13px] font-bold mb-1">
            This is permanent
          </Text>
          <Text className="text-red-500/70 dark:text-red-400/60 text-xs leading-4">
            Deleting your account cannot be undone. All your data, rooms, and history will be gone forever.
          </Text>
        </View>

        <SettingsSection title="What happens">
          <SettingsRow
            icon="person-remove-outline"
            title="Profile erased"
            description="Your name, username, photo, and profile are permanently deleted."
            color={ACCENT}
          />
          <SettingsRow
            icon="chatbubbles-outline"
            title="Active rooms removed"
            description="Rooms you created are immediately deleted. Participants are kicked."
            color={ACCENT}
          />
          <SettingsRow
            icon="text-outline"
            title="Messages anonymized"
            description="Your messages in other rooms remain until expiry, but show as sent by a deleted user."
            color={ACCENT}
          />
          <SettingsRow
            icon="log-out-outline"
            title="Logged out"
            description="You are signed out immediately and cannot recover this account."
            color={ACCENT}
            isLast
          />
        </SettingsSection>

        <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-5 mt-3">
          <Text className="text-secondary dark:text-gray-100 text-[15px] font-bold mb-3">
            How to delete
          </Text>
          <View className="gap-2.5">
            {[
              "Go to your Profile tab",
              "Tap the Settings icon",
              "Scroll to the bottom",
              "Tap Delete Account and confirm",
            ].map((step, i) => (
              <View key={step} className="flex-row items-start">
                <Text className="text-gray-300 dark:text-gray-600 text-xs font-bold w-5 mt-0.5">
                  {i + 1}.
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm leading-5 flex-1">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-8 mb-4">
          <CustomButton
            title="Delete Account"
            onPress={handleDelete}
            loading={isDeleting}
            type="primary"
            style={{ backgroundColor: ACCENT }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
