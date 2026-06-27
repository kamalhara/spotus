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
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import GlassContainer from "../ui/GlassContainer";

import { CATEGORY_ICONS } from "../../constants/categories";

const RoomDetailsSheet = forwardRef(
  ({ room, members, currentUserId, isHost, onKickUser }, ref) => {
    const bottomSheetModalRef = useRef(null);
    const router = useRouter();
    const { isDark } = useTheme();
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
        backgroundStyle={{
          borderRadius: 32,
          backgroundColor: isDark ? "#1C1C20" : "#FFFFFF",
        }}
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
              <GlassContainer
                borderRadius={12}
                style={{
                  backgroundColor: isDark
                    ? "rgba(79, 70, 229, 0.15)"
                    : "rgba(79, 70, 229, 0.08)",
                  marginBottom: 16,
                  alignSelf: "flex-start",
                }}
                fallbackClassName="bg-indigo-50 dark:bg-[#242428]"
              >
                <View className="px-3.5 py-2 flex-row items-center">
                  <Ionicons
                    name={categoryIcon}
                    size={12}
                    color="#FF6B47"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-primary font-display font-black text-[10px] uppercase tracking-[1.5px]">
                    {room?.category || "Discovery Circle"}
                  </Text>
                </View>
              </GlassContainer>
              <Text className="text-secondary dark:text-gray-100 text-3xl font-display font-black leading-tight tracking-tighter">
                {room?.title}
              </Text>
              
              <TouchableOpacity
                onPress={() => {
                  bottomSheetModalRef.current?.dismiss();
                  router.push(`/rooms/roomInfo?roomId=${room?.id}`);
                }}
                className="mt-3 bg-primary/10 self-start px-4 py-2 rounded-xl flex-row items-center"
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle-outline" size={16} color="#FF6B47" />
                <Text className="text-primary font-bold text-xs ml-1">View Room Info</Text>
              </TouchableOpacity>
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

          {/* Members Section */}
          <View>
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-secondary dark:text-gray-100 text-xl font-display font-black tracking-tight">
                Members
              </Text>
              <GlassContainer
                borderRadius={12}
                style={{
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.03)",
                }}
                fallbackClassName="bg-surface-alt dark:bg-[#242428]"
              >
                <View className="px-3.5 py-1.5">
                  <Text className="text-muted font-display font-black text-[10px] uppercase tracking-[1.5px]">
                    {room?.participants?.length || 0} Total
                  </Text>
                </View>
              </GlassContainer>
            </View>

            <View className="flex flex-col gap-3">
              {members && members.length > 0 ? (
                members.map((member) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleProfilePress(member.id)}
                    key={member.id}
                    className="flex-row items-center justify-between bg-white dark:bg-[#242428] p-4 rounded-[24px] border border-border-light dark:border-[#2C2C30]"
                  >
                    <View className="flex-row items-center flex-1">
                      <Image
                        source={{
                          uri: member.profilePic || "https://picsum.photos/200",
                        }}
                        className="w-12 h-12 rounded-2xl mr-3.5 border-2 border-gray-50 dark:border-gray-700"
                      />
                      <View>
                        <Text className="text-secondary dark:text-gray-100 font-display font-black text-sm tracking-tight">
                          {member.userName || "Unknown Member"}
                        </Text>
                        <View className="flex-row items-center mt-2 gap-2">
                          {room?.createdBy === member.id && (
                            <View className="bg-purple-100 dark:bg-purple-500/20 px-2.5 py-1 rounded-full flex-row items-center">
                              <Ionicons name="star" size={10} color="#A855F7" />
                              <Text className="text-purple-600 dark:text-purple-400 font-display font-black text-[9px] uppercase tracking-widest ml-1">
                                Host
                              </Text>
                            </View>
                          )}
                          {member.trustScore > 0 && (
                            <View className="bg-success-surface dark:bg-success-surface px-2.5 py-1 rounded-full flex-row items-center">
                              <Ionicons
                                name="checkmark-circle"
                                size={10}
                                color="#10B981"
                              />
                              <Text className="text-success font-display font-black text-[9px] uppercase tracking-widest ml-1">
                                Trust {Math.min(member.trustScore * 10, 100)}%
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    {member.id === currentUserId ? (
                      <View className="bg-primary/10 px-2.5 py-1.5 rounded-xl">
                        <Text className="text-primary font-display font-black text-[9px] uppercase tracking-widest">
                          You
                        </Text>
                      </View>
                    ) : isHost ? (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Kick User?",
                            `Are you sure you want to kick ${member.userName} from the event? They will not be able to rejoin.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Kick",
                                style: "destructive",
                                onPress: () => onKickUser(member.id),
                              },
                            ],
                          );
                        }}
                        className="bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-full"
                      >
                        <Text className="text-red-500 font-bold text-xs">
                          Kick
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isDark ? "#4B5563" : "#9CA3AF"}
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View className="py-8 items-center">
                  <View className="w-14 h-14 bg-surface-alt rounded-2xl items-center justify-center mb-3">
                    <Ionicons name="people-outline" size={24} color="#CBD5E1" />
                  </View>
                  <Text className="text-muted font-bold text-sm">
                    Loading members...
                  </Text>
                </View>
              )}
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

RoomDetailsSheet.displayName = "RoomDetailsSheet";

export default RoomDetailsSheet;
