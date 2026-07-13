import { useAuth } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeDiscoveryHeader from "../../../components/home/HomeDiscoveryHeader";
import HomeEmptyRooms from "../../../components/home/HomeEmptyRooms";
import JoinByCodeSheet from "../../../components/rooms/JoinByCodeSheet";
import RoomCard from "../../../components/rooms/RoomCard";
import RoomCardSkeleton from "../../../components/rooms/RoomCardSkeleton";
import RoomJoinSheet from "../../../components/rooms/RoomJoinSheet";
import ExploreInterceptModal from "../../../components/shared/ExploreInterceptModal";
import LocationPermissionDenied from "../../../components/shared/LocationPermissionDenied";
import SpotUsLoader from "../../../components/ui/SpotUsLoader";
import { useFloatingButton } from "../../../context/FloatingButtonContext";
import { useTheme } from "../../../context/ThemeContext";
import { useModal } from "../../../context/ModalContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { trackEvent } from "../../../lib/analytics";
import { getExploreRooms } from "../../../lib/getExploreRooms";
import { getNearbyRooms } from "../../../lib/getNearbyRoom";
import { joinRoomById } from "../../../lib/joinRoom";

export default function Home() {
  const [displayDistance, setDisplayDistance] = useState(5);
  const [searchDistance, setSearchDistance] = useState(5);
  const [activeCategory, setActiveCategory] = useState("all");
  const debounceTimer = useRef(null);
  const [ctaHidden, setCtaHidden] = useState(false);
  const ctaBottomY = useRef(0);
  const scrollOffsetY = useRef(0);
  const router = useRouter();
  const { isDark } = useTheme();
  const { getToken } = useAuth();
  const { firestoreUser } = useFirestoreUser();
  const { setFloatingButtonOverride, clearFloatingButtonOverride } =
    useFloatingButton();
  const { showAlert } = useModal();

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
      showAlert(
        "Unable to join",
        "Your profile or the selected room is still loading. Please try again.",
      );
      return;
    }

    try {
      const token = await getToken();
      await joinRoomById(
        roomToJoin.id,
        firestoreUser.id,
        firestoreUser.userName,
        token,
      );

      bottomSheetModalRef.current?.dismiss();
      router.push(`/rooms/${roomToJoin.id}`);
    } catch (error) {
      console.error("Error joining room:", error);
      showAlert("Could not join room", "Please try again in a moment.");
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
  }, [loadRooms, refreshing]);

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

  const handleCreateLayout = useCallback((event) => {
    ctaBottomY.current =
      event.nativeEvent.layout.y + event.nativeEvent.layout.height;
  }, []);

  const handleMapPress = useCallback(() => {
    router.push({
      pathname: "/rooms/map",
      params: { distance: displayDistance },
    });
  }, [displayDistance, router]);
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
            ListHeaderComponent={
              <HomeDiscoveryHeader
                roomsCount={nearbyRooms.length}
                peopleCount={totalPeopleChatting}
                displayDistance={displayDistance}
                filteredRoomCount={filteredRooms.length}
                loading={loading}
                roomCountLabel={roomCountLabel}
                isDark={isDark}
                fadeInContent={fadeInContent}
                slideUpContent={slideUpContent}
                onDistanceChange={setDisplayDistance}
                onCreateRoom={handleCreateRoom}
                onJoinByCode={handleJoinByCode}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onMapPress={handleMapPress}
                onCreateLayout={handleCreateLayout}
              />
            }
            ListFooterComponent={null}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? null : (
                <HomeEmptyRooms
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
