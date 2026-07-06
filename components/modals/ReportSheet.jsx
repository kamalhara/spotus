import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebase.config";
import { useTheme } from "../../context/ThemeContext";
import { trackEvent } from "../../lib/analytics";
import GlassContainer from "../ui/GlassContainer";

const REPORT_CATEGORIES = [
  {
    label: "Spam",
    icon: "mail-unread",
    description: "Unwanted promotional content or repeated messages.",
  },
  {
    label: "Harassment or Bullying",
    icon: "alert-circle",
    description: "Targeted abuse, insults, or intimidation.",
  },
  {
    label: "Hate Speech",
    icon: "megaphone",
    description: "Slurs, racism, or attacks on protected groups.",
  },
  {
    label: "Violence or Threats",
    icon: "warning",
    description: "Threats of physical harm or inciting violence.",
  },
  {
    label: "Inappropriate Content",
    icon: "eye-off",
    description: "Nudity, sexual content, or graphic material.",
  },
  {
    label: "Fake Account",
    icon: "person-remove",
    description: "Impersonation or deceptive profiles.",
  },
  {
    label: "Child Safety",
    icon: "shield-checkmark",
    description: "Report exploitation, grooming, or content involving minors.",
  },
  {
    label: "Scam or Fraud",
    icon: "cash",
    description: "Financial scams, phishing, or deceptive links.",
  },
  {
    label: "Other",
    icon: "help-circle",
    description: "Any other issue that violates community guidelines.",
  },
];

const ReportSheet = forwardRef(({ currentUserId, targetId, type }, ref) => {
  const bottomSheetModalRef = useRef(null);
  const { isDark } = useTheme();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
    present: () => {
      setStep(1);
      setSelectedCategory(null);
      setDescription("");
      bottomSheetModalRef.current?.present();
    },
  }));

  const snapPoints = useMemo(() => ["60%", "90%"], []);

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

  const validateDescription = () => {
    if (!selectedCategory) return false;
    const cat = selectedCategory.label;
    if (
      cat === "Child Safety" ||
      cat === "Harassment or Bullying" ||
      cat === "Violence or Threats"
    ) {
      if (description.trim().length < 5) {
        Alert.alert(
          "More Details Needed",
          "Please provide at least 5 characters describing the issue so we can investigate properly.",
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateDescription()) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isChildSafety = selectedCategory.label === "Child Safety";
    const reportId = `${currentUserId}_${type}_${targetId}`;

    const reportData = {
      id: reportId,
      type,
      targetId,
      reportedBy: currentUserId,
      category: selectedCategory.label,
      description: description.trim(),
      attachments: [],
      createdAt: serverTimestamp(),
      status: isChildSafety ? "urgent" : "pending",
      priority: isChildSafety ? "high" : "normal",
      reviewedBy: null,
      reviewedAt: null,
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version || "unknown",
    };

    try {
      await setDoc(doc(db, "reports", reportId), reportData, { merge: true });

      trackEvent("report_created");
      trackEvent("report_category_selected", {
        category: selectedCategory.label,
      });
      if (isChildSafety) {
        trackEvent("child_safety_report_created");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(3);
    } catch (err) {
      console.error("Error submitting report:", err);
      Alert.alert("Error", "Could not submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {REPORT_CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.label}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedCategory(cat);
            setStep(2);
          }}
          activeOpacity={0.7}
          className="flex-row items-center p-4 rounded-2xl mb-3 bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30]"
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{
              backgroundColor:
                cat.label === "Child Safety"
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(156, 163, 175, 0.1)",
            }}
          >
            <Ionicons
              name={cat.icon}
              size={20}
              color={cat.label === "Child Safety" ? "#EF4444" : "#9CA3AF"}
            />
          </View>
          <View className="flex-1">
            <Text
              className={`font-semibold text-base mb-0.5 ${cat.label === "Child Safety" ? "text-red-500" : "text-secondary dark:text-gray-100"}`}
            >
              {cat.label}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs">
              {cat.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>
      ))}
    </BottomSheetScrollView>
  );

  const renderStep2 = () => (
    <BottomSheetView className="flex-1 px-6">
      <View className="flex-row items-center mb-6 bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 mt-[50px]">
        <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-primary/10">
          <Ionicons name={selectedCategory?.icon} size={20} color="#FF6B47" />
        </View>
        <View className="flex-1">
          <Text className="text-secondary dark:text-gray-100 font-bold text-sm">
            {selectedCategory?.label}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">
            {selectedCategory?.description}
          </Text>
        </View>
      </View>

      <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold mb-3 tracking-tight">
        Tell us more (optional)
      </Text>

      <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4 mb-2">
        <BottomSheetTextInput
          placeholder="Describe what happened..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={(text) => {
            if (text.length <= 500) setDescription(text);
          }}
          multiline
          numberOfLines={6}
          className="text-secondary dark:text-gray-100 text-sm min-h-[120px]"
          style={{ textAlignVertical: "top" }}
        />
      </View>
      <Text className="text-right text-xs text-gray-400 mb-6">
        {description.length}/500
      </Text>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => setStep(1)}
          className="flex-1 py-4 rounded-2xl items-center justify-center bg-gray-100 dark:bg-gray-800"
        >
          <Text className="font-bold text-secondary dark:text-gray-100">
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="flex-1 py-4 rounded-2xl items-center justify-center bg-primary"
          style={{
            shadowColor: "#FF6B47",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="font-bold text-white">
            {loading ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );

  const renderStep3 = () => (
    <BottomSheetView className="flex-1 items-center justify-center pt-8 pb-12 ">
      <View className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-6 px-6 ">
        <Ionicons name="checkmark-circle" size={36} color="#10B981" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-2xl font-display font-extrabold text-center mb-2">
        Thank you.
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8 px-6">
        Your report has been submitted. Our team reviews reports as quickly as
        possible.
      </Text>
      <TouchableOpacity
        onPress={handleDismiss}
        className="w-full py-4 rounded-2xl items-center justify-center bg-gray-100 dark:bg-gray-800"
      >
        <Text className="font-bold text-secondary dark:text-gray-100">
          Done
        </Text>
      </TouchableOpacity>
    </BottomSheetView>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={step - 1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: "#E2E8F0",
        width: 40,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{
        borderRadius: 32,
        backgroundColor: isDark ? "#111113" : "#F9FAFB",
      }}
    >
      <View className="flex-1 px-6 pt-2 pb-6">
        {step !== 3 && (
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-secondary dark:text-gray-100 text-2xl font-display font-black leading-tight tracking-tighter">
                Report
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {step === 1
                  ? "Why are you reporting this?"
                  : "Provide optional details"}
              </Text>
            </View>
            <GlassContainer
              borderRadius={16}
              style={{
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.03)",
              }}
              fallbackClassName="bg-surface-alt dark:bg-[#242428]"
            >
              <TouchableOpacity
                onPress={handleDismiss}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </GlassContainer>
          </View>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </BottomSheetModal>
  );
});

ReportSheet.displayName = "ReportSheet";
export default ReportSheet;
