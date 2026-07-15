import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import GlassContainer from "../ui/GlassContainer";

export default function GhostModeBanner({
  room,
  showGhostBanner = true,
  setShowGhostBanner,
  onShare,
  variant = "full",
}) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [copiedItem, setCopiedItem] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  if (room?.visibility !== "ghost" || !room?.inviteCode || !showGhostBanner) {
    return null;
  }

  const inviteLink = Linking.createURL(`join/${room.inviteCode}`);

  const handleCopy = async (value, item) => {
    await Clipboard.setStringAsync(value);
    setCopiedItem(item);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    handleCopy(inviteLink, "link");
  };

  const invitePanel = (
    <GlassContainer
      borderRadius={variant === "compact" ? 30 : 20}
      glassEffectStyle="regular"
      fallbackClassName="bg-[#FFF8F6] dark:bg-[#211B1A] border border-primary/15 dark:border-primary/15"
      style={{
        width: "100%",
        ...(variant === "compact" && {
          maxWidth: 560,
          alignSelf: "center",
        }),
      }}
    >
      {variant === "compact" ? (
        <View className="items-center pt-2.5">
          <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </View>
      ) : null}
      <View className="px-4 py-4 flex-row items-start border-b border-border-light dark:border-[#2A2A2E]">
        <View className="w-10 h-10 rounded-xl bg-primary-surface items-center justify-center mr-3">
          <Ionicons name="key-outline" size={19} color="#FF6B47" />
        </View>
        <View className="flex-1 pr-2">
          <Text className="text-secondary dark:text-gray-100 text-[16px] font-semibold">
            Invite people to this room
          </Text>
          <Text className="text-muted dark:text-gray-400 text-[12px] leading-[18px] mt-0.5">
            This room is invite-only. Share the code or link below.
          </Text>
        </View>
        {variant === "compact" ? (
          <TouchableOpacity
            onPress={() => setInviteOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close invite"
            className="w-8 h-8 items-center justify-center"
          >
            <Ionicons name="close" size={19} color="#8A8A8A" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View className="p-4">
        <Text className="text-muted dark:text-gray-400 text-[11px] font-medium mb-2">
          Room code
        </Text>
        <TouchableOpacity
          onPress={() => handleCopy(room.inviteCode, "code")}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Copy room code ${room.inviteCode}`}
          className="h-[58px] rounded-xl bg-surface-alt dark:bg-[#252529] border border-border-light dark:border-[#303034] px-4 flex-row items-center"
        >
          <Text className="flex-1 text-secondary dark:text-gray-100 text-[23px] font-display tracking-[4px]">
            {room.inviteCode}
          </Text>
          <View className="flex-row items-center ml-3">
            {copiedItem === "code" ? (
              <Text className="text-primary text-[12px] font-semibold mr-1.5">
                Copied
              </Text>
            ) : null}
            <Ionicons
              name={copiedItem === "code" ? "checkmark-circle" : "copy-outline"}
              size={19}
              color="#FF6B47"
            />
          </View>
        </TouchableOpacity>

        <Text className="text-muted dark:text-gray-400 text-[11px] font-medium mt-4 mb-2">
          Invite link
        </Text>
        <TouchableOpacity
          onPress={() => handleCopy(inviteLink, "link")}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Copy room invite link"
          className="h-[50px] rounded-xl border border-border dark:border-[#303034] px-3.5 flex-row items-center"
        >
          <Ionicons name="link-outline" size={16} color="#8A8A8A" />
          <Text
            className="flex-1 text-secondary dark:text-gray-200 text-[12px] font-medium mx-2.5"
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {inviteLink}
          </Text>
          {copiedItem === "link" ? (
            <Text className="text-primary text-[11px] font-semibold mr-1.5">
              Copied
            </Text>
          ) : null}
          <Ionicons
            name={copiedItem === "link" ? "checkmark" : "copy-outline"}
            size={16}
            color="#FF6B47"
          />
        </TouchableOpacity>

        <View className="flex-row mt-4 gap-3">
          <TouchableOpacity
            onPress={() => handleCopy(room.inviteCode, "code")}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Copy room code"
            className="flex-1 h-11 rounded-xl border border-border dark:border-[#303034] flex-row items-center justify-center"
          >
            <Ionicons name="copy-outline" size={15} color="#FF6B47" />
            <Text className="text-primary text-[13px] font-semibold ml-2">
              Copy code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Share room invite"
            className="flex-1 h-11 rounded-xl bg-primary flex-row items-center justify-center"
          >
            <Ionicons name="share-outline" size={16} color="white" />
            <Text className="text-white text-[13px] font-semibold ml-2">
              Share invite
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GlassContainer>
  );

  if (variant === "compact") {
    return (
      <>
        <View className="px-5 pt-2 pb-1">
          <GlassContainer
            borderRadius={14}
            glassEffectStyle="regular"
            fallbackClassName="bg-[#FFF8F6] dark:bg-[#211B1A] border border-primary/15 dark:border-primary/15"
            style={{ width: "100%", minHeight: 56 }}
          >
            <View className="min-h-[56px] px-3 flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-primary-surface items-center justify-center mr-3">
                <Ionicons name="key-outline" size={16} color="#FF6B47" />
              </View>
              <TouchableOpacity
                onPress={() => setInviteOpen(true)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Open room invite"
                className="flex-1 py-2"
              >
                <Text className="text-muted dark:text-gray-400 text-[10px] font-medium">
                  Invite-only · room code
                </Text>
                <Text className="text-secondary dark:text-gray-100 text-[15px] font-display tracking-[2px] mt-0.5">
                  {room.inviteCode}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInviteOpen(true)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Open invite options"
                className="h-9 px-3 rounded-lg bg-primary-surface flex-row items-center justify-center"
              >
                <Text className="text-primary text-[12px] font-semibold mr-1">
                  Invite
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#FF6B47" />
              </TouchableOpacity>
              {setShowGhostBanner ? (
                <TouchableOpacity
                  onPress={() => setShowGhostBanner(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss room code"
                  className="w-8 h-9 items-center justify-center ml-1"
                >
                  <Ionicons name="close" size={17} color="#8A8A8A" />
                </TouchableOpacity>
              ) : null}
            </View>
          </GlassContainer>
        </View>

        <Modal
          visible={inviteOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setInviteOpen(false)}
        >
          <View
            className="flex-1 justify-end"
            style={{
              backgroundColor: isDark
                ? "rgba(0,0,0,0.68)"
                : "rgba(17,17,18,0.42)",
              paddingHorizontal: 12,
              paddingBottom: Math.max(insets.bottom, 12),
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setInviteOpen(false)}
              className="absolute inset-0"
              accessibilityRole="button"
              accessibilityLabel="Close invite"
            />
            {invitePanel}
          </View>
        </Modal>
      </>
    );
  }

  return <View className="mb-8">{invitePanel}</View>;
}
