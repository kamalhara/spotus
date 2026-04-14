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
        opacity={0.4}
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
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* Header section */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 mr-4">
            <View className="bg-surface-alt self-start px-3.5 py-2 rounded-xl mb-4 flex-row items-center">
              <Ionicons
                name={categoryIcon}
                size={12}
                color="#4F46E5"
                style={{ marginRight: 6 }}
              />
              <Text className="text-primary font-black text-[10px] uppercase tracking-[1.5px]">
                {room?.category || "Discovery Circle"}
              </Text>
            </View>
            <Text className="text-secondary text-3xl font-black leading-tight tracking-tighter">
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

        {/* Room Description */}
        <View className="mb-8 pb-8 border-b border-border-light">
          <Text className="text-muted text-[10px] font-bold uppercase tracking-[2px] mb-2.5">
            Description
          </Text>
          <Text className="text-slate-500 leading-[22px] font-medium text-[14px]">
            This discovery circle is dedicated to exploring{" "}
            {room?.category || "new experiences"} and sharing local vibes with
            fellow members in your area.
          </Text>
        </View>

        {/* Members Section */}
        <View>
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-secondary text-xl font-black tracking-tight">
              Members
            </Text>
            <View className="bg-surface-alt px-3.5 py-1.5 rounded-xl">
              <Text className="text-muted font-black text-[10px] uppercase tracking-[1.5px]">
                {room?.participants?.length || 0} Total
              </Text>
            </View>
          </View>

          <View className="flex flex-col gap-3">
            {members && members.length > 0 ? (
              members.map((member) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleProfilePress(member.id)}
                  key={member.id}
                  className="flex-row items-center justify-between bg-surface-alt p-3.5 rounded-2xl"
                >
                  <View className="flex-row items-center flex-1">
                    <Image
                      source={{
                        uri: member.profilePic || "https://picsum.photos/200",
                      }}
                      className="w-11 h-11 rounded-xl mr-3.5 border-2 border-white"
                    />
                    <View>
                      <Text className="text-secondary font-black text-sm tracking-tight">
                        {member.userName || "Unknown Member"}
                      </Text>
                      <View className="flex-row items-center mt-2 gap-2">
                        {member.trustScore > 0 && (
                          <View className="bg-success/10 px-2.5 py-1 rounded-lg flex-row items-center">
                            <Ionicons
                              name="checkmark-circle"
                              size={10}
                              color="#10B981"
                            />
                            <Text className="text-success font-black text-[8px] uppercase tracking-widest ml-1">
                              Trust {Math.min(member.trustScore * 10, 100)}%
                            </Text>
                          </View>
                        )}
                        {member.id === room.createdBy && (
                          <View className="bg-warning/10 px-2.5 py-1 rounded-lg flex-row items-center">
                            <Ionicons name="star" size={10} color="#F59E0B" />
                            <Text className="text-warning font-black text-[8px] uppercase tracking-widest ml-1">
                              Creator
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  {member.id === currentUserId && (
                    <View className="bg-primary/10 px-2.5 py-1.5 rounded-xl">
                      <Text className="text-primary font-black text-[9px] uppercase tracking-widest">
                        You
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-8 items-center">
                <View className="w-14 h-14 bg-surface-alt rounded-2xl items-center justify-center mb-3">
                  <Ionicons name="people-outline" size={24} color="#CBD5E1" />
                </View>
                <Text className="text-muted font-bold text-sm">
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
