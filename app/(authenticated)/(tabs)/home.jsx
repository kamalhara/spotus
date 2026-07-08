import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryChips from "../../../components/home/CategoryChips";
import NearbyPulse from "../../../components/home/NearbyPulse";
import JoinByCodeSheet from "../../../components/rooms/JoinByCodeSheet";
import RoomCard from "../../../components/rooms/RoomCard";
import RoomCardSkeleton from "../../../components/rooms/RoomCardSkeleton";
import RoomJoinSheet from "../../../components/rooms/RoomJoinSheet";
import ExploreInterceptModal from "../../../components/shared/ExploreInterceptModal";
import LocationPermissionDenied from "../../../components/shared/LocationPermissionDenied";
import GlassButton from "../../../components/ui/GlassButton";
import SpotUsLoader from "../../../components/ui/SpotUsLoader";
import { db } from "../../../config/firebase.config";
import { CATEGORY_ICONS } from "../../../constants/categories";
import { useFloatingButton } from "../../../context/FloatingButtonContext";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { trackEvent } from "../../../lib/analytics";
import { getExploreRooms } from "../../../lib/getExploreRooms";
import { getNearbyRooms } from "../../../lib/getNearbyRoom";
import { sendPushNotification } from "../../../lib/notification";

function getHeadline(roomCount, isLoading) {
  if (isLoading) return "Looking nearby...";
  if (roomCount === 0) return "Quiet for now";
  if (roomCount === 1) return "1 room nearby";
  if (roomCount <= 3) return `${roomCount} rooms nearby`;
  return `${roomCount} rooms buzzing`;
}

function EmptyRooms({ activeCategory, isGhostBrowsing }) {
  const isFiltered = activeCategory !== "all";

  return (
    <View className="items-center justify-center py-16 px-6">
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(255, 107, 71, 0.08)" }}
      >
        <Ionicons name="radio-outline" size={22} color="#FF6B47" style={{ opacity: 0.6 }} />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-lg font-heading tracking-tight text-center mb-2">
        {isFiltered ? `No ${activeCategory} rooms` : "Nothing open nearby"}
      </Text>
      <Text className="text-muted text-[14px] font-body text-center leading-5 px-4">
        {isGhostBrowsing
          ? "Exploring mode only shows public samples. Turn on location to see rooms around you."
          : isFiltered
            ? "Try another category or widen the radius."
            : "Start one for the people around you or widen the radius."}
      </Text>
    </View>
  );
}

export default function Home() {
  const [displayDistance, setDisplayDistance] = useState(5);
  const [searchDistance, setSearchDistance] = useState(5);
  const [activeCategory, setActiveCategory] = useState("all");
  const debounceTimer = useRef(null);
  const sliderWidth = useRef(0);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipContainerRef = useRef(null);
  const tooltipTextRef = useRef(null);
  const isSlidingRef = useRef(false);
  const [ctaHidden, setCtaHidden] = useState(false);
  const ctaBottomY = useRef(0);
  const scrollOffsetY = useRef(0);
  const router = useRouter();
  const { isDark } = useTheme();
  const { firestoreUser } = useFirestoreUser();
  const { setFloatingButtonOverride, clearFloatingButtonOverride } =
    useFloatingButton();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isGhostBrowsing, setIsGhostBrowsing] = useState(false);

  const [interceptModal, setInterceptModal] = useState({
    visible: false,
    action: "",
  });

  // Entrance animations
  const fadeInHeader = useRef(new Animated.Value(0)).current;
  const fadeInContent = useRef(new Animated.Value(0)).current;
  const slideUpContent = useRef(new Animated.Value(20)).current;
  const customRefreshAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(customRefreshAnim, {
      toValue: refreshing ? 1 : 0,
      useNativeDriver: true,
      bounciness: 12,
      speed: 14,
    }).start();
  }, [refreshing, customRefreshAnim]);

  const scrollPullAnim = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const combinedAnim = Animated.add(customRefreshAnim, scrollPullAnim);

  const loaderOpacity = combinedAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 1],
  });

  const loaderTranslateY = combinedAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [-60, 20, 20],
  });

  const loaderScale = combinedAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.6, 1, 1],
  });

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeInHeader, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeInContent, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpContent, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeInHeader, fadeInContent, slideUpContent]);

  // Sheet Refs
  const bottomSheetModalRef = useRef(null);
  const joinSheetRef = useRef(null);

  const handlePresentModalPress = useCallback((room) => {
    setSelectedRoom(room);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleJoinRoom = async (roomToJoin = selectedRoom) => {
    if (isGhostBrowsing) {
      setInterceptModal({ visible: true, action: "join conversations" });
      trackEvent("Tried to join while exploring");
      return;
    }

    if (!roomToJoin?.id || !firestoreUser?.id) {
      Alert.alert(
        "Unable to join",
        "Your profile or the selected room is still loading. Please try again.",
      );
      return;
    }

    const roomRef = doc(db, "rooms", roomToJoin.id);
    const wasAlreadyInRoom = roomToJoin.participants?.includes(
      firestoreUser.id,
    );

    try {
      await updateDoc(roomRef, {
        participants: arrayUnion(firestoreUser.id),
      });

      if (!wasAlreadyInRoom && roomToJoin.participants) {
        const otherParticipants = roomToJoin.participants.filter(
          (uid) => uid !== firestoreUser.id,
        );
        void Promise.all(
          otherParticipants.map((uid) =>
            Promise.resolve().then(() =>
              sendPushNotification(
                uid,
                firestoreUser.id,
                roomToJoin.title || "Room",
                `${firestoreUser?.userName || "Someone"} joined the room`,
                { type: "room", screen: "room", roomId: roomToJoin.id },
              ),
            ),
          ),
        ).catch((error) => {
          console.error("Error notifying room participants:", error);
        });
      }

      bottomSheetModalRef.current?.dismiss();
      router.push(`/rooms/${roomToJoin.id}`);
    } catch (error) {
      console.error("Error joining room:", error);
      Alert.alert("Could not join room", "Please try again in a moment.");
    }
  };

  const handleJoinByCode = () => {
    if (isGhostBrowsing) {
      setInterceptModal({ visible: true, action: "join conversations" });
      trackEvent("Tried to join by code while exploring");
      return;
    }
    joinSheetRef.current?.present();
  };

  // Debounce: when displayDistance changes, wait 500ms then commit to searchDistance
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchDistance(displayDistance);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [displayDistance]);

  const loadRooms = useCallback(async () => {
    setLocationError(false);
    try {
      const isGhost = await AsyncStorage.getItem("isGhostBrowsing");
      if (isGhost === "true") {
        setIsGhostBrowsing(true);
        const data = await getExploreRooms();
        setRooms(data);
      } else {
        setIsGhostBrowsing(false);
        const data = await getNearbyRooms(searchDistance, firestoreUser?.id);
        setRooms(data);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      const message = String(error?.message || error || "");
      if (
        message.includes("permission denied") ||
        message.includes("Not authorized") ||
        message.includes("Location permission")
      ) {
        setLocationError(true);
      } else {
        setRooms([]);
      }
    }
  }, [searchDistance, firestoreUser?.id]);

  useFocusEffect(
    useCallback(() => {
      // Fetch new rooms silently on tab focus without showing skeleton loading effect
      loadRooms().finally(() => setLoading(false));
    }, [loadRooms]),
  );

  // Pull-to-refresh handler (guarded against double-refresh)
  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadRooms();
    setRefreshing(false);
  }, [loadRooms]);

  const nearbyRooms = useMemo(
    () => rooms.filter((r) => !r.participants?.includes(firestoreUser?.id)),
    [rooms, firestoreUser?.id],
  );

  const filteredRooms = useMemo(
    () =>
      nearbyRooms.filter(
        (r) => activeCategory === "all" || r.category === activeCategory,
      ),
    [nearbyRooms, activeCategory],
  );

  const totalPeopleChatting = useMemo(
    () =>
      nearbyRooms.reduce(
        (acc, room) => acc + (room.participants?.length || 0),
        0,
      ),
    [nearbyRooms],
  );

  const roomCountLabel =
    activeCategory === "all"
      ? `${filteredRooms.length} open room${
          filteredRooms.length === 1 ? "" : "s"
        }`
      : `${filteredRooms.length} ${activeCategory} room${
          filteredRooms.length === 1 ? "" : "s"
        }`;

  const handleCreateRoom = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isGhostBrowsing) {
      setInterceptModal({ visible: true, action: "create a room" });
      trackEvent("Tried to create room while exploring");
      return;
    }
    router.push("/rooms/create-rooms");
  }, [router, isGhostBrowsing]);

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/profile");
  };

  const handleRefreshPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRefresh();
  }, [onRefresh]);

  // ── Drive the shared floating button based on scroll position ──────
  useEffect(() => {
    if (ctaHidden) {
      setFloatingButtonOverride({
        icon: "add",
        iconSize: 22,
        tintColor: "#FF6B47",
        iconColor: "white",
        onPress: handleCreateRoom,
      });
    } else {
      setFloatingButtonOverride({
        icon: loading ? "refresh-circle" : "refresh",
        iconSize: 20,
        tintColor: null,
        iconColor: isDark ? "#F5F5F5" : "#18181B",
        onPress: handleRefreshPress,
      });
    }
  }, [
    ctaHidden,
    loading,
    isDark,
    handleCreateRoom,
    handleRefreshPress,
    setFloatingButtonOverride,
  ]);

  // Clear override when leaving this tab
  useFocusEffect(
    useCallback(() => {
      return () => clearFloatingButtonOverride();
    }, [clearFloatingButtonOverride]),
  );

  // ── Everything above the room list, rendered as list header ────────
  const ListHeader = () => (
    <>
      <NearbyPulse
        roomsCount={nearbyRooms.length}
        peopleCount={totalPeopleChatting}
        radius={displayDistance}
      />

      {/* Greeting + context */}
      <Animated.View
        className="mt-4 mb-1"
        style={{
          opacity: fadeInContent,
          transform: [{ translateY: slideUpContent }],
        }}
      >
        <Text className="text-secondary dark:text-gray-100 text-[26px] font-display tracking-tight">
          {getHeadline(filteredRooms.length, loading)}
        </Text>
        {!loading && filteredRooms.length > 0 && (
          <Text className="text-muted text-[14px] font-body mt-1">
            {roomCountLabel} within {displayDistance}km
          </Text>
        )}
      </Animated.View>

      {/* Slider — compact */}
      <Animated.View
        className="mt-5"
        style={{
          opacity: fadeInContent,
          transform: [{ translateY: slideUpContent }],
        }}
      >
        <View className="bg-white dark:bg-[#1A1A1E] rounded-2xl px-5 py-4 border border-border-light dark:border-[#2A2A2E]">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-secondary dark:text-gray-100 text-[13px] font-semibold">
              Discovery radius
            </Text>
            <Text className="text-primary text-[13px] font-heading">
              {displayDistance} km
            </Text>
          </View>
          <View
            onLayout={(e) => {
              sliderWidth.current = e.nativeEvent.layout.width;
            }}
            style={{ overflow: "visible" }}
          >
            <Animated.View
              ref={tooltipContainerRef}
              style={{
                position: "absolute",
                top: -36,
                left:
                  ((displayDistance - 1) / 39) * (sliderWidth.current - 28) +
                  14 -
                  22,
                opacity: tooltipOpacity,
                zIndex: 10,
              }}
              pointerEvents="none"
            >
              <View
                style={{
                  backgroundColor: isDark ? "#FFAB99" : "#FF6B47",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                  alignItems: "center",
                  minWidth: 44,
                }}
              >
                <TextInput
                  ref={tooltipTextRef}
                  editable={false}
                  defaultValue={String(displayDistance)}
                  style={{
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: "800",
                    padding: 0,
                    textAlign: "center",
                  }}
                />
              </View>
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 6,
                  borderRightWidth: 6,
                  borderTopWidth: 6,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: isDark ? "#FFAB99" : "#FF6B47",
                  alignSelf: "center",
                }}
              />
            </Animated.View>
            <Slider
              style={{ width: "100%", height: 36 }}
              minimumValue={1}
              maximumValue={40}
              step={1}
              value={displayDistance}
              onSlidingStart={() => {
                isSlidingRef.current = true;
                Animated.timing(tooltipOpacity, {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true,
                }).start();
              }}
              onValueChange={(val) => {
                const rounded = Math.round(val);
                const left =
                  ((rounded - 1) / 39) * (sliderWidth.current - 28) + 14 - 22;
                tooltipContainerRef.current?.setNativeProps({
                  style: { left },
                });
                tooltipTextRef.current?.setNativeProps({
                  text: String(rounded),
                });
              }}
              onSlidingComplete={(val) => {
                isSlidingRef.current = false;
                Animated.timing(tooltipOpacity, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
                setDisplayDistance(Math.round(val));
              }}
              minimumTrackTintColor="#FF6B47"
              maximumTrackTintColor={isDark ? "#2A2A2E" : "#EAE8E4"}
              thumbTintColor={isDark ? "#FFAB99" : "#FF6B47"}
            />
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-muted text-[10px] font-medium">1 km</Text>
            <Text className="text-muted text-[10px] font-medium">40 km</Text>
          </View>
        </View>
      </Animated.View>

      {/* Create Room CTA — more integrated, less banner-like */}
      <Animated.View
        className="mt-5"
        onLayout={(e) => {
          ctaBottomY.current =
            e.nativeEvent.layout.y + e.nativeEvent.layout.height;
        }}
        style={{
          opacity: fadeInContent,
          transform: [{ translateY: slideUpContent }],
        }}
      >
        <TouchableOpacity
          onPress={handleCreateRoom}
          activeOpacity={0.9}
          className="bg-primary py-4 px-5 rounded-2xl flex-row items-center"
        >
          <View className="w-9 h-9 bg-white/20 rounded-xl items-center justify-center mr-3">
            <Ionicons name="add" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-heading text-[15px] tracking-tight">
              Host a nearby room
            </Text>
            <Text className="text-white/60 text-[12px] font-body mt-0.5">
              Pick a topic, set a timer, share the invite code
            </Text>
          </View>
          <Ionicons
            name="arrow-forward"
            size={16}
            color="rgba(255,255,255,0.5)"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Join via Invite Code — inline link style */}
      <Animated.View
        className="mt-3 mb-5"
        style={{
          opacity: fadeInContent,
          transform: [{ translateY: slideUpContent }],
        }}
      >
        <TouchableOpacity
          onPress={handleJoinByCode}
          activeOpacity={0.7}
          className="flex-row items-center justify-center py-2.5"
        >
          <Ionicons
            name="key-outline"
            size={14}
            color="#FF6B47"
            style={{ marginRight: 5 }}
          />
          <Text className="text-primary font-semibold text-[13px]">
            Join with invite code
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <CategoryChips
        categories={Object.keys(CATEGORY_ICONS)}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Nearby Rooms Section Header */}
      <View className="mb-2">
        <View className="flex flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <Text className="text-secondary dark:text-gray-100 text-[20px] font-heading tracking-tight">
              {activeCategory === "all" ? "Nearby" : activeCategory}
            </Text>
            {filteredRooms.length > 0 && (
              <Text className="text-muted text-[13px] font-medium">
                {filteredRooms.length}
              </Text>
            )}
          </View>
          <GlassButton
            onPress={() =>
              router.push({
                pathname: "/rooms/map",
                params: { distance: displayDistance },
              })
            }
            shape="pill"
            size={32}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="map"
                size={13}
                color={isDark ? "#E2E8F0" : "#4B5563"}
                style={{ marginRight: 4 }}
              />
              <Text className="text-gray-600 dark:text-gray-300 text-[11px] font-semibold">
                Map
              </Text>
            </View>
          </GlassButton>
        </View>
      </View>
    </>
  );

  // ── Build the list data ────────────────────────────────────────────
  const listData = loading
    ? [
        { _skeleton: true, id: "s1" },
        { _skeleton: true, id: "s2" },
        { _skeleton: true, id: "s3" },
      ]
    : filteredRooms;

  return (
    <>
      <SafeAreaView className="bg-bg dark:bg-[#111112] h-screen px-6">
        {/* Header — stays pinned */}
        <Animated.View
          className="flex flex-row justify-between items-center my-3"
          style={{ opacity: fadeInHeader }}
        >
          <TouchableOpacity
            onPress={handleProfilePress}
            className="flex-row items-center"
          >
            <Image
              source={{
                uri: firestoreUser?.profilePic || "https://picsum.photos/200",
              }}
              className="w-11 h-11 rounded-2xl"
            />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-secondary dark:text-gray-100 tracking-tighter text-[20px] font-heading">
              Spot Us
            </Text>
          </View>
          {/* Spacer to preserve layout — button is now the shared FloatingGlassButton */}
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Custom Pull to Refresh Loader */}
        <Animated.View
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 50,
            opacity: loaderOpacity,
            transform: [
              { translateY: loaderTranslateY },
              { scale: loaderScale },
            ],
          }}
          pointerEvents="none"
        >
          <View
            className="bg-white dark:bg-[#1A1A1E] p-2.5 rounded-full"
            style={{
              shadowColor: isDark ? "#000" : "#FF6B47",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <SpotUsLoader size={26} />
          </View>
        </Animated.View>

        {/* Scrollable content */}
        {locationError ? (
          <LocationPermissionDenied
            onEnableGhostMode={() => {
              setLocationError(false);
              loadRooms();
            }}
          />
        ) : (
          <Animated.FlatList
            data={listData}
            renderItem={({ item, index }) =>
              item._skeleton ? (
                <RoomCardSkeleton />
              ) : (
                <Animated.View
                  style={{
                    opacity: fadeInContent,
                    transform: [
                      {
                        translateY: fadeInContent.interpolate({
                          inputRange: [0, 1],
                          outputRange: [12 + index * 4, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <RoomCard
                    room={item}
                    onPress={() => handlePresentModalPress(item)}
                    currentUserId={firestoreUser?.id}
                    isExploreMode={isGhostBrowsing}
                  />
                </Animated.View>
              )
            }
            keyExtractor={(item, index) =>
              item._skeleton ? `skel-${index}` : item.id
            }
            ListHeaderComponent={ListHeader}
            ListFooterComponent={null}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? null : (
                <EmptyRooms
                  activeCategory={activeCategory}
                  isGhostBrowsing={isGhostBrowsing}
                />
              )
            }
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: true,
                listener: (e) => {
                  const offset = e.nativeEvent.contentOffset.y;
                  scrollOffsetY.current = offset;
                  const hidden =
                    ctaBottomY.current > 0 && offset > ctaBottomY.current;
                  if (hidden !== ctaHidden) setCtaHidden(hidden);
                },
              },
            )}
            onScrollEndDrag={(e) => {
              if (e.nativeEvent.contentOffset.y < -80 && !refreshing) {
                onRefresh();
              }
            }}
            scrollEventThrottle={16}
          />
        )}
      </SafeAreaView>

      <RoomJoinSheet
        ref={bottomSheetModalRef}
        room={selectedRoom}
        onConfirm={handleJoinRoom}
      />

      <JoinByCodeSheet
        ref={joinSheetRef}
        currentUserId={firestoreUser?.id}
        onJoinSuccess={(id) => router.push(`/rooms/${id}`)}
      />

      <ExploreInterceptModal
        visible={interceptModal.visible}
        actionName={interceptModal.action}
        onClose={() => setInterceptModal({ visible: false, action: "" })}
        onEnableLocation={async () => {
          setInterceptModal({ visible: false, action: "" });
          await AsyncStorage.setItem("isGhostBrowsing", "false");
          setIsGhostBrowsing(false);
          loadRooms();
        }}
      />
    </>
  );
}
