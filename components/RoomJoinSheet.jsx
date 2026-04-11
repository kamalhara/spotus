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

const RoomJoinSheet = forwardRef(({ room, onConfirm }, ref) => {
  const bottomSheetModalRef = useRef(null);
  const router = useRouter();
  // Expose the dismiss and present methods to the parent
  useImperativeHandle(ref, () => ({
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
    present: () => bottomSheetModalRef.current?.present(),
  }));

  // variables
  const snapPoints = useMemo(() => ["45%"], []);

  // renders
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
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

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 40 }}
      backgroundStyle={{ borderRadius: 40, backgroundColor: "#FFFFFF" }}
      enableDynamicSizing={false}
    >
      <BottomSheetView className="px-8 pt-6 pb-12">
        <View>
          {/* Header */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <View className="bg-indigo-50 self-start px-3 py-1 rounded-full mb-3">
                <Text className="text-primary font-bold text-[10px] uppercase tracking-wider">
                  {room?.category || "General"}
                </Text>
              </View>
              <Text className="text-secondary text-3xl font-black leading-tight tracking-tight">
                {room?.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDismiss}
              className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
            >
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Room Details Info */}
          <View className="flex-row items-center gap-6 mb-8">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center mr-2">
                <Ionicons name="people" size={16} color="#4F46E5" />
              </View>
              <Text className="text-gray-500 font-semibold">
                {room?.participants?.length || 1} Members
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center mr-2">
                <Ionicons name="location" size={16} color="#4F46E5" />
              </View>
              <Text className="text-gray-500 font-semibold">
                0.5 miles away
              </Text>
            </View>
          </View>

          <Text className="text-gray-400 text-sm leading-5">
            By joining this room, you&apos;ll be able to chat and share
            experiences with others in this discovery circle.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 justify-between mt-8">
          <View className="flex-1">
            <CustomButton title="Cancel" type="ghost" onPress={handleDismiss} />
          </View>
          <View className="flex-[2]">
            <CustomButton title="Confirm Join" onPress={handleConfirm} />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

RoomJoinSheet.displayName = "RoomJoinSheet";

export default RoomJoinSheet;
