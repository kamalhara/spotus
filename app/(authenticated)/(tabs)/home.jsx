import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
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

function EmptyRooms() {
  return (
    <View className="items-center justify-center py-16 px-6">
      <View className="w-16 h-16 bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30] rounded-2xl items-center justify-center mb-5">
        <Ionicons name="radio-outline" size={28} color="#FF6B47" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-xl font-display font-extrabold tracking-tight text-center mb-2.5">
        Nothing nearby
      </Text>
      <Text className="text-muted text-[15px] font-medium text-center leading-6 px-4">
        Keep exploring or enable location to join conversations.
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
  const [retryTrigger, setRetryTrigger] = useState(0);
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

  const handleJoinRoom = async () => {
    if (isGhostBrowsing) {
      setInterceptModal({ visible: true, action: "join conversations" });
      trackEvent("Tried to join while exploring");
      return;
    }
    const roomRef = doc(db, "rooms", selectedRoom.id);

    const wasAlreadyInRoom = selectedRoom.participants?.includes(
      firestoreUser?.id,
    );

    await updateDoc(roomRef, {
      participants: arrayUnion(firestoreUser?.id),
    });

    if (!wasAlreadyInRoom && selectedRoom.participants) {
      const otherParticipants = selectedRoom.participants.filter(
        (uid) => uid !== firestoreUser?.id,
      );
      otherParticipants.forEach((uid) => {
        sendPushNotification(
          uid,
          firestoreUser?.id,
          selectedRoom.title || "Room",
          `${firestoreUser?.userName || "Someone"} joined the room!`,
          { type: "room", screen: "room", roomId: selectedRoom.id },
        );
      });
    }

    bottomSheetModalRef.current?.dismiss();
    router.push(`/rooms/${selectedRoom.id}`);
  };

  const handleJoinByCode = () => {
    if (isGhostBrowsing) {
      setInterceptModal({ visible: true, action: "join conversations" });
      trackEvent("Tried to join by code while exploring");
      return;
    }
    joinSheetRef.current?.present();
  };

  // Debounce: when displayDistance changes, wait 300ms then commit to searchDistance
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchDistance(displayDistance);
    }, 300);
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
        // slider is in km, getNearbyRooms expects km
        const data = await getNearbyRooms(searchDistance, firestoreUser?.id);
        setRooms(data);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      if (
        error.message.includes("permission denied") ||
        error.message.includes("Not authorized") ||
        error.message.includes("Location permission")
      ) {
        setLocationError(true);
      }
    }
  }, [searchDistance, firestoreUser?.id, retryTrigger]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRooms().finally(() => setLoading(false));
    }, [loadRooms]),
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadRooms();
    setRefreshing(false);
  }, [loadRooms]);

  const nearbyRooms = rooms.filter(
    (r) => !r.participants?.includes(firestoreUser?.id),
  );

  const filteredRooms = nearbyRooms.filter(
    (r) => activeCategory === "all" || r.category === activeCategory,
  );

  const totalPeopleChatting = nearbyRooms.reduce(
    (acc, room) => acc + (room.participants?.length || 0),
    0,
  );

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

      {/* Dynamic context header */}
      <Animated.View
        className="mt-5 mb-1"
        style={{
          opacity: fadeInContent,
          transform: [{ translateY: slideUpContent }],
        }}
      >
        <Text className="text-secondary dark:text-gray-100 text-[28px] font-display font-extrabold tracking-tight">
          {loading
            ? "Looking nearby"
            : filteredRooms.length > 0
              ? `${filteredRooms.length} room${filteredRooms.length === 1 ? "" : "s"} nearby`
              : "Quiet for now"}
        </Text>
      </Animated.View>

      {/* Slider Card — elevated */}
      <Animated.View
        className="mt-6"
        style={{
          opacity: fadeInContent,
          transform: [{ translateY: slideUpContent }],
        }}
      >
        <View className="bg-white dark:bg-[#1C1C20] rounded-3xl px-6 py-5 border border-border-light dark:border-[#2C2C30]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-7 h-7 bg-primary/10 rounded-lg items-center justify-center mr-2.5">
                <Ionicons name="locate" size={14} color="#FF6B47" />
              </View>
              <Text className="text-secondary dark:text-gray-100 text-sm font-bold">
                How far?
              </Text>
            </View>
            <View className="bg-primary px-3 py-1.5 rounded-xl">
              <Text className="text-white text-sm font-display font-black">
                {displayDistance} km
              </Text>
            </View>
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
              style={{ width: "100%", height: 40 }}
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
              maximumTrackTintColor={isDark ? "#2C2C30" : "#E8E6E1"}
              thumbTintColor={isDark ? "#FFAB99" : "#FF6B47"}
            />
          </View>
          <View className="flex flex-row justify-between mt-1">
            <Text className="text-muted text-xs font-semibold">1 km</Text>
            <Text className="text-muted text-xs font-semibold">40 km</Text>
          </View>
        </View>
      </Animated.View>

      {/* Create Room CTA */}
      <Animated.View
        className="mt-7"
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
          className="bg-primary py-5 px-6 rounded-3xl flex-row items-center"
          style={{
            shadowColor: "#FF6B47",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View className="w-11 h-11 bg-white/20 rounded-xl items-center justify-center mr-4">
            <Ionicons name="add" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-display font-extrabold text-lg tracking-tight">
              Create a room
            </Text>
            <Text className="text-white/70 text-[13px] font-semibold mt-0.5">
              Hang out with people nearby
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Join via Invite Code */}
      <Animated.View
        className="mt-3 mb-6"
        style={{
          opacity: fadeInContent,
          transform: [{ translateY: slideUpContent }],
        }}
      >
        <TouchableOpacity
          onPress={handleJoinByCode}
          activeOpacity={0.8}
          className="flex-row items-center justify-center py-3.5 bg-white dark:bg-[#1C1C20] rounded-2xl border border-border-light dark:border-[#2C2C30]"
        >
          <Ionicons
            name="key-outline"
            size={16}
            color="#FF6B47"
            style={{ marginRight: 6 }}
          />
          <Text className="text-secondary dark:text-gray-200 font-semibold text-[13px]">
            Have an invite code?
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
          <View className="flex-row items-center gap-2.5">
            <Text className="text-secondary dark:text-gray-100 text-[22px] font-display font-extrabold tracking-tight">
              Nearby
            </Text>
            {nearbyRooms.length > 0 && (
              <View className="bg-primary-surface px-2.5 py-1 rounded-full">
                <Text className="text-primary text-[12px] font-display font-black">
                  {nearbyRooms.length}
                </Text>
              </View>
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
            size={34}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="map"
                size={14}
                color={isDark ? "#E2E8F0" : "#4B5563"}
                style={{ marginRight: 4 }}
              />
              <Text className="text-gray-600 dark:text-gray-300 text-xs font-bold">
                Map View
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
    : nearbyRooms;

  return (
    <>
      <SafeAreaView className="bg-bg dark:bg-[#111113] h-screen px-6">
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
              className="w-12 h-12 rounded-2xl border-2 border-white dark:border-gray-800"
            />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-secondary dark:text-gray-100 tracking-tighter text-[22px] font-display font-black">
              Spot Us
            </Text>
            <View className="w-2 h-2 rounded-full bg-primary ml-1 -mt-2" />
          </View>
          {/* Spacer to preserve layout — button is now the shared FloatingGlassButton */}
          <View style={{ width: 48 }} />
        </Animated.View>

        {/* Custom Pull to Refresh Loader */}
        <Animated.View
          style={{
            position: "absolute",
            top: 100, // Further below header to prevent overlap
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
            className="bg-white dark:bg-[#1C1C20] p-2.5 rounded-full"
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

        {/* Scrollable content — greeting, slider, CTA, and rooms all scroll together */}
        {locationError ? (
          <LocationPermissionDenied
            onEnableGhostMode={() => {
              setLocationError(false);
              setRetryTrigger((prev) => prev + 1);
            }}
          />
        ) : (
          <Animated.FlatList
            data={listData}
            renderItem={({ item }) =>
              item._skeleton ? (
                <RoomCardSkeleton />
              ) : (
                <RoomCard
                  room={item}
                  onPress={() => handlePresentModalPress(item)}
                  isExploreMode={isGhostBrowsing}
                />
              )
            }
            keyExtractor={(item, index) =>
              item._skeleton ? `skel-${index}` : item.id
            }
            ListHeaderComponent={ListHeader}
            ListFooterComponent={null}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={loading ? null : <EmptyRooms />}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: true,
                listener: (e) => {
                  const offset = e.nativeEvent.contentOffset.y;
                  scrollOffsetY.current = offset;
                  const hidden = offset > ctaBottomY.current;
                  if (hidden !== ctaHidden) setCtaHidden(hidden);
                },
              }
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="transparent"
                colors={["transparent"]}
                progressBackgroundColor="transparent"
                progressViewOffset={-5000}
              />
            }
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
          setRetryTrigger((prev) => prev + 1);
        }}
      />
    </>
  );
}
