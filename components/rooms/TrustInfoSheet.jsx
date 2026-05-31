import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import { useTheme } from "../../context/ThemeContext";

const TRUST_TIERS = [
  {
    range: "0 – 2",
    label: "New Member",
    icon: "alert-circle",
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.08)",
    description:
      "You just joined. Keep chatting to build trust with the group.",
  },
  {
    range: "3 – 6",
    label: "Getting Known",
    icon: "people",
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.08)",
    description:
      "You're becoming a familiar face. Members are starting to recognise you.",
  },
  {
    range: "7 – 9",
    label: "Trusted",
    icon: "shield-checkmark",
    color: "#10B981",
    bgColor: "rgba(16,185,129,0.08)",
    description: "Almost there! You're a trusted member of this room.",
  },
  {
    range: "10",
    label: "Full Trust",
    icon: "ribbon",
    color: "#6366F1",
    bgColor: "rgba(99,102,241,0.08)",
    description:
      "You've unlocked full trust — you can now send direct messages to anyone in this room.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    icon: "chatbubble-ellipses",
    title: "Send messages",
    detail:
      "Every message you send in the room increases your trust score by 1.",
  },
  {
    icon: "trending-up",
    title: "Grow your score",
    detail:
      "Your trust meter fills up as you participate more in the conversation.",
  },
  {
    icon: "lock-open",
    title: "Unlock DMs at 10",
    detail:
      "Once you reach a trust score of 10, you can send direct messages to any member.",
  },
];

const TrustInfoSheet = forwardRef(({ trust = 0 }, ref) => {
  const bottomSheetModalRef = useRef(null);
  const { isDark } = useTheme();

  useImperativeHandle(ref, () => ({
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
    present: () => bottomSheetModalRef.current?.present(),
  }));

  const snapPoints = useMemo(() => ["70%", "90%"], []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    [],
  );

  const handleDismiss = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const trustColor =
    trust < 3
      ? "#EF4444"
      : trust < 7
        ? "#F59E0B"
        : trust < 10
          ? "#10B981"
          : "#6366F1";
  const trustLabel =
    trust < 3
      ? "New Member"
      : trust < 7
        ? "Getting Known"
        : trust < 10
          ? "Trusted"
          : "Full Trust";
  const clampedTrust = Math.min(trust, 10);

  // Determine which tier the user is currently in
  const activeTierIndex = trust < 3 ? 0 : trust < 7 ? 1 : trust < 10 ? 2 : 3;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: "#E2E8F0",
        width: 40,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{ borderRadius: 32, backgroundColor: isDark ? "#1A1A22" : "#FFFFFF" }}
      enableDynamicSizing={false}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 48,
        }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 mr-4">
            <View
              className="self-start px-3.5 py-2 rounded-xl mb-3 flex-row items-center"
              style={{ backgroundColor: "rgba(99,102,241,0.08)" }}
            >
              <Ionicons
                name="shield-checkmark"
                size={12}
                color="#4F46E5"
                style={{ marginRight: 6 }}
              />
              <Text className="text-primary font-black text-[10px] uppercase tracking-[1.5px]">
                Trust System
              </Text>
            </View>
            <Text className="text-secondary dark:text-gray-100 text-2xl font-black leading-tight tracking-tighter">
              How Trust Works
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDismiss}
            className="w-10 h-10 bg-surface-alt dark:bg-[#23232E] rounded-2xl items-center justify-center"
          >
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Current Trust Status Card */}
        <View
          className="rounded-3xl p-5 mb-6"
          style={{
            backgroundColor: trustColor + "0A",
            borderWidth: 1,
            borderColor: trustColor + "20",
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: trustColor + "18" }}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={trustColor}
                />
              </View>
              <View>
                <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[1.5px]">
                  Your Trust Level
                </Text>
                <Text
                  className="text-base font-black tracking-tight"
                  style={{ color: trustColor }}
                >
                  {trustLabel}
                </Text>
              </View>
            </View>
            <View
              className="px-3.5 py-2 rounded-xl"
              style={{ backgroundColor: trustColor + "18" }}
            >
              <Text
                className="font-black text-sm"
                style={{ color: trustColor }}
              >
                {clampedTrust}/10
              </Text>
            </View>
          </View>

          <Progress.Bar
            progress={clampedTrust / 10}
            width={null}
            color={trustColor}
            unfilledColor={trustColor + "15"}
            borderWidth={0}
            height={6}
            borderRadius={3}
            animated={true}
          />

          {trust < 10 && (
            <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold mt-2.5">
              {10 - clampedTrust} more message
              {10 - clampedTrust !== 1 ? "s" : ""} to unlock DMs
            </Text>
          )}
        </View>

        {/* How It Works Section */}
        <View className="mb-6">
          <Text className="text-secondary dark:text-gray-100 text-lg font-black tracking-tight mb-4">
            How It Works
          </Text>

          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <View className="w-10 h-10 rounded-full bg-primary-surface dark:bg-primary-surface items-center justify-center mr-3.5 mt-0.5">
                <Ionicons name={step.icon} size={18} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text className="text-secondary dark:text-gray-100 text-sm font-black tracking-tight">
                  {step.title}
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium leading-[18px] mt-1">
                  {step.detail}
                </Text>
              </View>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <View
                  className="absolute left-[19px] top-[44px] w-[2px] h-3 bg-border-light dark:bg-[#2A2A36]"
                />
              )}
            </View>
          ))}
        </View>

        {/* Why Trust Matters */}
        <View
          className="rounded-2xl p-4 mt-4"
          style={{
            backgroundColor: isDark ? "#23232E" : "#F8FAFC",
            borderWidth: 1,
            borderColor: isDark ? "#2A2A36" : "#F1F5F9",
          }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="heart"
              size={14}
              color="#4F46E5"
              style={{ marginRight: 6 }}
            />
            <Text className="text-secondary dark:text-gray-100 font-black text-sm tracking-tight">
              Why Trust Matters
            </Text>
          </View>
          <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium leading-[18px]">
            Trust keeps Spotus safe and authentic. By participating in rooms
            first, you show you&apos;re a genuine member before sliding into
            DMs. It helps everyone feel comfortable connecting.
          </Text>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

TrustInfoSheet.displayName = "TrustInfoSheet";

export default TrustInfoSheet;
