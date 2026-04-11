import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const RoomDetailsSheet = forwardRef(({ room, members, currentUserId }, ref) => {
  const bottomSheetModalRef = useRef(null);
  const router = useRouter();
  useImperativeHandle(ref, () => ({
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
    present: () => bottomSheetModalRef.current?.present(),
  }));

  const snapPoints = useMemo(() => ["50%", "75%"], []);

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

  const handleProfilePress = (id) => {
    if (id === currentUserId) {
      router.push("/profile");
    } else {
      router.push({
        pathname: `/users/${id}`,
        params: { roomId: room?.id },
      });
    }

    bottomSheetModalRef.current?.dismiss();
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
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        {/* Header section */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 mr-4">
            <View className="bg-primary/10 self-start px-3 py-1.5 rounded-xl mb-3">
              <Text className="text-primary font-black text-[10px] uppercase tracking-[2px]">
                {room?.category || "Discovery Circle"}
              </Text>
            </View>
            <Text className="text-secondary text-3xl font-black leading-tight tracking-tighter">
              {room?.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDismiss}
            className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
          >
            <Ionicons name="close" size={20} color="#18181B" />
          </TouchableOpacity>
        </View>

        {/* Room Description */}
        <View className="mb-8">
          <Text className="text-gray-400 text-[13px] font-bold uppercase tracking-widest mb-2">
            Description
          </Text>
          <Text className="text-gray-500 leading-5 font-medium">
            This discovery circle is dedicated to exploring{" "}
            {room?.category || "new experiences"} and sharing local vibes with
            fellow members in your area.
          </Text>
        </View>

        {/* Members Section */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-secondary text-xl font-black tracking-tight">
              Members
            </Text>
            <View className="bg-gray-50 px-3 py-1 rounded-lg">
              <Text className="text-gray-400 font-black text-[11px] uppercase tracking-widest">
                {room?.participants?.length || 0} Total
              </Text>
            </View>
          </View>

          <View className="flex flex-col gap-4">
            {members && members.length > 0 ? (
              members.map((member) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleProfilePress(member.id)}
                  key={member.id}
                  className="flex-row items-center justify-between bg-gray-50/50 p-3 rounded-2xl border border-gray-50"
                >
                  <View className="flex-row items-center flex-1">
                    <Image
                      source={{
                        uri: member.profilePic || "https://picsum.photos/200",
                      }}
                      className="w-10 h-10 rounded-xl mr-3 border border-white"
                    />
                    <View>
                      <Text className="text-secondary font-black text-sm tracking-tight">
                        {member.userName || "Unknown Member"}
                      </Text>
                      <View className="flex-row items-center mt-1.5 gap-2">
                        {member.trustScore > 0 && (
                          <View className="bg-green-50 px-2 py-0.5 rounded-md flex-row items-center border border-green-100">
                            <Ionicons
                              name="checkmark-circle"
                              size={10}
                              color="#10B981"
                            />
                            <Text className="text-[#059669] font-black text-[8px] uppercase tracking-widest ml-1">
                              Trust {Math.min(member.trustScore * 10, 100)}%
                            </Text>
                          </View>
                        )}
                        {member.id === room.createdBy && (
                          <View className="bg-amber-50 px-2 py-0.5 rounded-md flex-row items-center border border-amber-100">
                            <Ionicons name="star" size={10} color="#D97706" />
                            <Text className="text-[#D97706] font-black text-[8px] uppercase tracking-widest ml-1">
                              Creator
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  {member.id === currentUserId && (
                    <View className="bg-indigo-100 px-2 py-1 rounded-md">
                      <Text className="text-primary font-black text-[9px] uppercase tracking-widest">
                        You
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-4 items-center">
                <Text className="text-gray-400 font-bold italic">
                  Loading circle members...
                </Text>
              </View>
            )}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

RoomDetailsSheet.displayName = "RoomDetailsSheet";

export default RoomDetailsSheet;
