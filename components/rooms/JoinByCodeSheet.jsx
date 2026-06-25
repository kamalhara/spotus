import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { joinRoomByCode } from "../../lib/joinRoom";
import CustomButton from "../ui/CustomButton";
import GlassContainer from "../ui/GlassContainer";

const JoinByCodeSheet = forwardRef(({ currentUserId, onJoinSuccess }, ref) => {
  const bottomSheetModalRef = useRef(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useImperativeHandle(ref, () => ({
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
      setCode("");
      setError(null);
    },
    present: () => {
      bottomSheetModalRef.current?.present();
      setCode("");
      setError(null);
    },
  }));

  const snapPoints = useMemo(() => ["50%"], []);

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

  const renderBackground = useCallback(
    (props) => (
      <View style={props.style} pointerEvents="none">
        <GlassContainer
          style={{ flex: 1 }}
          borderRadius={32}
          glassEffectStyle="regular"
        />
      </View>
    ),
    [],
  );

  const handleJoin = async () => {
    if (!code || code.length < 5) {
      setError("Please enter a valid invite code.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError(null);

    try {
      const roomId = await joinRoomByCode(code, currentUserId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onJoinSuccess?.(roomId);
      bottomSheetModalRef.current?.dismiss();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message || "Failed to join event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundComponent={renderBackground}
      handleIndicatorStyle={{
        backgroundColor: "#E2E8F0",
        width: 40,
        height: 4,
        borderRadius: 2,
      }}
    >
      <BottomSheetView className="px-8 pt-4 pb-12 flex-1">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 mr-4">
            <Text className="text-secondary dark:text-gray-100 text-3xl font-display font-black leading-tight tracking-tight">
              Join Event
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Got an invite code? Enter it below to join the private event room.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => bottomSheetModalRef.current?.dismiss()}
            className="w-10 h-10 bg-surface-alt dark:bg-[#23232E] rounded-2xl items-center justify-center"
          >
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <GlassContainer
            borderRadius={16}
            fallbackClassName="bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36]"
          >
            <View className="flex-row items-center px-4 py-2 h-[60px]">
              <Ionicons
                name="key-outline"
                size={20}
                color="#94A3B8"
                style={{ marginRight: 12 }}
              />
              <TextInput
                value={code}
                onChangeText={(text) => {
                  setCode(text.toUpperCase());
                  setError(null);
                }}
                placeholder="Enter 6-character code"
                placeholderTextColor="#94A3B8"
                className="flex-1 text-secondary dark:text-gray-100 text-lg font-bold uppercase tracking-widest"
                autoCapitalize="characters"
                maxLength={8}
                returnKeyType="join"
                onSubmitEditing={handleJoin}
              />
            </View>
          </GlassContainer>
          {error && (
            <Text className="text-red-500 text-sm mt-3 ml-2 font-medium">
              {error}
            </Text>
          )}
        </View>

        <View className="flex-1 justify-end">
          <CustomButton
            title="Join Event"
            onPress={handleJoin}
            loading={loading}
            icon={<Ionicons name="arrow-forward" size={20} color="white" />}
            disabled={!code || code.length < 5}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

JoinByCodeSheet.displayName = "JoinByCodeSheet";

export default JoinByCodeSheet;
