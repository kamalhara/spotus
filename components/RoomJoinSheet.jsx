import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CustomButton from "./CustomButton";

const CATEGORY_ICONS = {
  Music: "musical-notes",
  Coffee: "cafe",
  Art: "color-palette",
  Books: "book",
  Tech: "code-slash",
  Food: "restaurant",
  Fashion: "shirt",
  Sports: "football",
  "Local Events": "calendar",
};

const RoomJoinSheet = forwardRef(({ room, onConfirm }, ref) => {
  const bottomSheetModalRef = useRef(null);
  const router = useRouter();
  // Expose the dismiss and present methods to the parent
  useImperativeHandle(ref, () => ({
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
    present: () => bottomSheetModalRef.current?.present(),
  }));

  // variables
  const snapPoints = useMemo(() => ["48%"], []);

  // renders
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

  const handleConfirm = () => {
    onConfirm?.(room);
    handleDismiss();
  };

  const categoryIcon = CATEGORY_ICONS[room?.category] || "grid";

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
      backgroundStyle={{ borderRadius: 32, backgroundColor: "#FFFFFF" }}
      enableDynamicSizing={false}
    >
      <BottomSheetView className="px-8 pt-4 pb-12">
        <View>
          {/* Header */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <View className="bg-surface-alt self-start px-3.5 py-2 rounded-xl mb-4 flex-row items-center">
                <Ionicons
                  name={categoryIcon}
                  size={12}
                  color="#4F46E5"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-primary font-bold text-[10px] uppercase tracking-[1.5px]">
                  {room?.category || "General"}
                </Text>
              </View>
              <Text className="text-secondary text-3xl font-black leading-tight tracking-tight">
                {room?.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDismiss}
              className="w-10 h-10 bg-surface-alt rounded-2xl items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Room Details Info */}
          <View className="flex-row items-center gap-4 mb-7">
            <View className="flex-row items-center bg-surface-alt px-4 py-3 rounded-2xl flex-1">
              <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-2.5">
                <Ionicons name="people" size={15} color="#4F46E5" />
              </View>
              <View>
                <Text className="text-secondary font-bold text-sm">
                  {room?.participants?.length || 1}
                </Text>
                <Text className="text-muted text-[10px] font-bold uppercase tracking-wider">
                  Members
                </Text>
              </View>
            </View>
            <View className="flex-row items-center bg-surface-alt px-4 py-3 rounded-2xl flex-1">
              <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-2.5">
                <Ionicons name="location" size={15} color="#4F46E5" />
              </View>
              <View>
                <Text className="text-secondary font-bold text-sm">0.5 mi</Text>
                <Text className="text-muted text-[10px] font-bold uppercase tracking-wider">
                  Away
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-muted text-[13px] leading-5 font-medium">
            By joining this room, you&apos;ll be able to chat and share
            experiences with others in this discovery circle.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="h-px bg-gray-100 mt-6 mb-5" />
        <View className="flex-row gap-3.5 justify-between">
          <View className="flex-1">
            <CustomButton title="Cancel" type="ghost" onPress={handleDismiss} />
          </View>
          <View className="flex-[2]">
            <CustomButton title="Join Circle" onPress={handleConfirm} />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

RoomJoinSheet.displayName = "RoomJoinSheet";

export default RoomJoinSheet;
