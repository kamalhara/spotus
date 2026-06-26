import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { doc, getDoc } from "firebase/firestore";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebase.config";

import CustomButton from "../ui/CustomButton";
import GlassContainer from "../ui/GlassContainer";

import { CATEGORY_ICONS } from "../../constants/categories";

const RoomJoinSheet = forwardRef(({ room, onConfirm }, ref) => {
  const bottomSheetModalRef = useRef(null);

  const [creator, setCreator] = useState(null);

  // Fetch room creator profile
  useEffect(() => {
    if (!room?.createdBy) {
      setCreator(null);
      return;
    }
    const fetchCreator = async () => {
      try {
        const snap = await getDoc(doc(db, "users", room.createdBy));
        if (snap.exists()) setCreator({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("Error fetching room creator:", err);
      }
    };
    fetchCreator();
  }, [room?.createdBy]);
  // Expose the dismiss and present methods to the parent
  useImperativeHandle(ref, () => ({
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
    present: () => bottomSheetModalRef.current?.present(),
  }));

  // variables
  const snapPoints = useMemo(() => ["60%"], []);

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
    []
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
      backgroundComponent={renderBackground}
      enableDynamicSizing={false}
    >
      <BottomSheetView className="px-8 pt-4 pb-12">
        <View>
          {/* Header */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <View className="bg-surface-alt dark:bg-[#242428] self-start px-3.5 py-2 rounded-xl mb-4 flex-row items-center">
                <Ionicons
                  name={categoryIcon}
                  size={12}
                  color="#FF6B47"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-primary font-bold text-[10px] uppercase tracking-[1.5px]">
                  {room?.category || "General"}
                </Text>
              </View>
              <Text className="text-secondary dark:text-gray-100 text-3xl font-display font-black leading-tight tracking-tight">
                {room?.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDismiss}
              className="w-10 h-10 bg-surface-alt dark:bg-[#242428] rounded-2xl items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Room Details Info */}
          <View className="flex-row items-center gap-4 mb-7">
            <View className="flex-row items-center bg-surface-alt dark:bg-[#242428] px-4 py-3 rounded-2xl flex-1">
              <View className="w-8 h-8 bg-white dark:bg-[#1C1C20] rounded-xl items-center justify-center mr-2.5">
                <Ionicons name="people" size={15} color="#FF6B47" />
              </View>
              <View>
                <Text className="text-secondary dark:text-gray-100 font-bold text-sm">
                  {room?.participants?.length || 1}
                </Text>
                <Text className="text-muted text-[10px] font-bold uppercase tracking-wider">
                  Members
                </Text>
              </View>
            </View>
            <View className="flex-row items-center bg-surface-alt dark:bg-[#242428] px-4 py-3 rounded-2xl flex-1">
              <View className="w-8 h-8 bg-white dark:bg-[#1C1C20] rounded-xl items-center justify-center mr-2.5">
                <Ionicons name="location" size={15} color="#FF6B47" />
              </View>
              <View>
                <Text className="text-secondary dark:text-gray-100 font-bold text-sm">
                  {room?.distance !== undefined ? room.distance.toFixed(1) : "?"} km
                </Text>
                <Text className="text-muted text-[10px] font-bold uppercase tracking-wider">
                  Away
                </Text>
              </View>
            </View>
          </View>

          {/* Creator */}
          {creator && (
            <View className="flex-row items-center bg-surface-alt dark:bg-[#242428] px-4 py-3.5 rounded-2xl mb-6">
              <Image
                source={{
                  uri: creator.profilePic || "https://picsum.photos/200",
                }}
                className="w-11 h-11 rounded-2xl mr-3 border-[2px] border-white dark:border-[#1C1C20]"
              />
              <View className="flex-1">
                <Text className="text-secondary dark:text-gray-100 font-bold text-[15px]">
                  {creator.userName || "Unknown"}
                </Text>
                {creator.bio && (
                  <Text
                    className="text-muted dark:text-gray-400 text-xs mt-0.5 font-medium"
                    numberOfLines={1}
                  >
                    {creator.bio}
                  </Text>
                )}
              </View>
              <View className="bg-warning-surface dark:bg-warning-surface px-2.5 py-1.5 rounded-full flex-row items-center">
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text className="text-warning font-display font-black text-[9px] uppercase tracking-widest ml-1">
                  Creator
                </Text>
              </View>
            </View>
          )}

          {room?.description && (
            <View className="bg-surface-alt dark:bg-[#242428] p-4 rounded-2xl mb-4 border border-gray-100 dark:border-[#2C2C30]">
              <Text className="text-muted text-[10px] font-bold uppercase tracking-[2px] mb-1.5">
                Description
              </Text>
              <Text className="text-secondary dark:text-gray-100 text-[13px] leading-5 font-medium">
                {room.description}
              </Text>
            </View>
          )}

          <Text className="text-muted text-[13px] leading-5 font-medium text-center">
            Join to chat with the members in this room.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="h-px bg-border-light dark:bg-border-light mt-6 mb-5" />
        <View className="flex-row gap-3.5 justify-between">
          <View className="flex-1">
            <CustomButton title="Cancel" type="ghost" onPress={handleDismiss} />
          </View>
          <View className="flex-[2]">
            <CustomButton title="Join Room" onPress={handleConfirm} />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

RoomJoinSheet.displayName = "RoomJoinSheet";

export default RoomJoinSheet;
