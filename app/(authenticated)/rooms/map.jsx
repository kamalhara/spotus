import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, SafeAreaView, Text, View } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RoomCard from "../../../components/rooms/RoomCard";
import RoomJoinSheet from "../../../components/rooms/RoomJoinSheet";
import ExploreInterceptModal from "../../../components/shared/ExploreInterceptModal";
import GhostBrowsingBanner from "../../../components/shared/GhostBrowsingBanner";
import LocationPermissionDenied from "../../../components/shared/LocationPermissionDenied";
import GlassButton from "../../../components/ui/GlassButton";
import SpotUsLoader from "../../../components/ui/SpotUsLoader";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../../constants/categories";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { trackEvent } from "../../../lib/analytics";
import { getExploreRooms } from "../../../lib/getExploreRooms";
import { subscribeNearbyRooms } from "../../../lib/getNearbyRoom";
import { getCurrentLocation } from "../../../lib/location";
import { joinRoomById } from "../../../lib/joinRoom";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78; // Narrower to show adjacent cards
const ITEM_MARGIN = 8;
const ITEM_WIDTH = CARD_WIDTH + ITEM_MARGIN * 2;
const SNAP_INTERVAL = ITEM_WIDTH;

function EmptyRooms() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <View className="w-24 h-24 bg-info-surface rounded-full items-center justify-center mb-6">
        <Ionicons name="compass" size={40} color="#FF6B47" />
      </View>
      <Text className="text-secondary dark:text-gray-100 text-xl font-display font-black tracking-tight text-center mb-2.5">
        No rooms nearby
      </Text>
      <Text className="text-muted text-[15px] font-medium text-center leading-6 px-4 mb-10">
        Keep exploring or enable location to join conversations.
      </Text>

      <GlassButton
        onPress={() => router.push("/rooms/create-rooms")}
        shape="pill"
        size="regular"
      >
        <View className="flex-row items-center justify-center gap-2 py-3.5 px-6">
          <Ionicons
            name="add-outline"
            size={20}
            color={isDark ? "#FFAB99" : "#FF6B47"}
          />
          <Text className="text-primary dark:text-primary-light font-bold text-lg">
            Create Room
          </Text>
        </View>
      </GlassButton>

      <View style={{ position: "absolute", top: insets.top + 16, left: 16 }}>
        <GlassButton onPress={() => router.back()} size={44} shape="circle">
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "#F3F4F6" : "#18181B"}
          />
        </GlassButton>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

const AnimatedRoomMarker = React.memo(
  ({ room, isSelected, onPress, isDark }) => {
    const categoryColor = CATEGORY_COLORS[room.category] || "#FF6B47";
    const categoryIcon = CATEGORY_ICONS[room.category] || "grid";

    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    // Mount animation
    useEffect(() => {
      scale.value = withSpring(
        isSelected ? 1.15 : 1,
        { damping: 16, stiffness: 90 },
        () => {
          runOnJS(setTracksViewChanges)(false);
        },
      );
      opacity.value = withTiming(1, { duration: 300 });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update animation when participants change
    const prevParticipants = useRef(room.participants?.length || 1);
    useEffect(() => {
      const currentParticipants = room.participants?.length || 1;
      if (currentParticipants !== prevParticipants.current) {
        prevParticipants.current = currentParticipants;
        setTracksViewChanges(true);
        // Pulse animation
        const baseScale = isSelected ? 1.15 : 1;
        scale.value = withSequence(
          withTiming(baseScale * 1.3, { duration: 150 }),
          withSpring(baseScale, { damping: 14, stiffness: 100 }, () => {
            runOnJS(setTracksViewChanges)(false);
          }),
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room.participants?.length, isSelected]);

    // Handle selection state change specifically without re-running mount animation
    useEffect(() => {
      const targetScale = isSelected ? 1.15 : 1;
      if (scale.value !== targetScale && scale.value !== 0) {
        setTracksViewChanges(true);
        scale.value = withSpring(
          targetScale,
          { damping: 16, stiffness: 90 },
          () => {
            runOnJS(setTracksViewChanges)(false);
          },
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSelected]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <Marker
        coordinate={{
          latitude: room.latitude,
          longitude: room.longitude,
        }}
        onPress={onPress}
        tracksViewChanges={tracksViewChanges}
        style={{ zIndex: isSelected ? 10 : 1 }}
      >
        <Animated.View
          style={[
            { alignItems: "center", justifyContent: "center" },
            animatedStyle,
          ]}
        >
          <View
            style={{
              backgroundColor: isSelected
                ? categoryColor
                : isDark
                  ? "#1C1C20"
                  : "white",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: isSelected ? "white" : categoryColor,
              shadowColor: categoryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isSelected ? 0.6 : 0.2,
              shadowRadius: 6,
              elevation: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons
              name={categoryIcon}
              size={16}
              color={isSelected ? "white" : categoryColor}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "900",
                color: isSelected ? "white" : isDark ? "#F3F4F6" : "#18181B",
              }}
            >
              {room.participants?.length || 1}
            </Text>
          </View>
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 6,
              borderRightWidth: 6,
              borderTopWidth: 8,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: isSelected ? "white" : categoryColor,
              marginTop: -1,
            }}
          />
        </Animated.View>
      </Marker>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.room.id === nextProps.room.id &&
      prevProps.room.category === nextProps.room.category &&
      (prevProps.room.participants?.length || 1) ===
        (nextProps.room.participants?.length || 1) &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isDark === nextProps.isDark
    );
  },
);

AnimatedRoomMarker.displayName = "AnimatedRoomMarker";

export default function MapViewScreen() {
  const router = useRouter();
  const { distance } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { getToken } = useAuth();
  const { firestoreUser } = useFirestoreUser();
  const insets = useSafeAreaInsets();

  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const bottomSheetModalRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);
  const [isGhostBrowsing, setIsGhostBrowsing] = useState(false);
  const [showGhostBanner, setShowGhostBanner] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [interceptModal, setInterceptModal] = useState({
    visible: false,
    action: "",
  });

  const hasInitialRender = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let unsubscribe = null;
      let isMounted = true;

      const loadData = async () => {
        try {
          if (!hasInitialRender.current) {
            setLoading(true);
            hasInitialRender.current = true;
          }
          const isGhost = await AsyncStorage.getItem("isGhostBrowsing");
          if (!isMounted) return;
          if (isGhost === "true") {
            setIsGhostBrowsing(true);
            const exploreData = await getExploreRooms();
            if (!isMounted) return;
            setRooms(exploreData);
            setLoading(false);

            let centerLat = 37.7749;
            let centerLng = -122.4194;
            if (exploreData.length > 0) {
              centerLat = exploreData[0].latitude;
              centerLng = exploreData[0].longitude;
            }
            if (!region) {
              setRegion({
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              });
            }

            setSelectedRoomId((prev) => {
              if (!prev && exploreData.length > 0) return exploreData[0].id;
              return prev;
            });
            // We don't subscribe to updates when exploring to save reads
            return;
          } else {
            setIsGhostBrowsing(false);
          }

          const userLoc = await getCurrentLocation();
          if (!isMounted) return;
          setUserLocation({
            latitude: userLoc.latitude,
            longitude: userLoc.longitude,
          });
          if (!region) {
            setRegion({
              latitude: userLoc.latitude,
              longitude: userLoc.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }

          const radiusKm = distance ? parseFloat(distance) : 5;

          unsubscribe = await subscribeNearbyRooms(
            radiusKm,
            firestoreUser?.id,
            (allRooms) => {
              if (!isMounted) return;
              const mapRooms = allRooms.filter(
                (r) =>
                  r.showOnMap === true &&
                  !r.participants?.includes(firestoreUser?.id),
              );

              setRooms(mapRooms);
              setLoading(false);

              setSelectedRoomId((prev) => {
                if (!prev && mapRooms.length > 0) return mapRooms[0].id;
                return prev;
              });
            },
          );
        } catch (error) {
          console.error("Error loading map rooms", error);
          if (!isMounted) return;
          if (
            error.message.includes("permission denied") ||
            error.message.includes("Not authorized") ||
            error.message.includes("Location permission")
          ) {
            setLocationError(true);
          }
          setLoading(false);
        }
      };

      loadData();

      return () => {
        isMounted = false;
        if (unsubscribe) unsubscribe();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [distance, firestoreUser?.id, retryTrigger]),
  );

  const animateToRoom = (room) => {
    setSelectedRoomId(room.id);
    mapRef.current?.animateToRegion(
      {
        latitude: room.latitude - 0.005, // Offset slightly to account for bottom cards
        longitude: room.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500,
    );
  };

  const handleMarkerPress = (room, index) => {
    animateToRoom(room);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleCardPress = (room) => {
    setSelectedRoomToJoin(room);
    bottomSheetModalRef.current?.present();
  };

  const handleJoinRoom = async () => {
    if (!selectedRoomToJoin || !firestoreUser?.id) return;
    try {
      if (isGhostBrowsing) {
        setInterceptModal({ visible: true, action: "join conversations" });
        trackEvent("Tried to join while exploring");
        return;
      }
      const token = await getToken();
      await joinRoomById(
        selectedRoomToJoin.id,
        firestoreUser.id,
        firestoreUser.userName,
        token,
      );

      bottomSheetModalRef.current?.dismiss();
      router.push(`/rooms/${selectedRoomToJoin.id}`);
    } catch (err) {
      console.error("Error joining room:", err);
    }
  };

  if (loading && !region && !locationError) {
    return (
      <View className="flex-1 bg-bg dark:bg-[#111113] items-center justify-center">
        <SpotUsLoader size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg dark:bg-[#111113]">
      {locationError ? (
        <LocationPermissionDenied
          fullScreen
          onEnableGhostMode={() => {
            setLocationError(false);
            setRetryTrigger((prev) => prev + 1);
          }}
        />
      ) : rooms.length === 0 && !loading ? (
        <EmptyRooms />
      ) : (
        <>
          <GhostBrowsingBanner
            visible={isGhostBrowsing && showGhostBanner}
            onClose={() => setShowGhostBanner(false)}
            onEnableLocation={() => {
              setIsGhostBrowsing(false);
              setRetryTrigger((prev) => prev + 1);
            }}
          />
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={region}
            showsUserLocation={true}
            showsMyLocationButton={false}
            customMapStyle={isDark ? darkMapStyle : []}
            clusterColor="#FF6B47"
            mapPadding={{ top: insets.top, bottom: 200, left: 0, right: 0 }}
          >
            {userLocation && (
              <Marker
                coordinate={userLocation}
                tracksViewChanges={false}
                cluster={false}
                style={{ zIndex: 20 }}
              >
                <View className="items-center justify-center">
                  <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                    <View className="w-5 h-5 bg-primary rounded-full border-[2.5px] border-white dark:border-[#1C1C20]" />
                  </View>
                </View>
              </Marker>
            )}

            {rooms.map((room, index) => (
              <AnimatedRoomMarker
                key={room.id}
                room={room}
                isSelected={selectedRoomId === room.id}
                isDark={isDark}
                onPress={() => handleMarkerPress(room, index)}
              />
            ))}
          </MapView>

          {/* Floating Back Button & Room Count */}
          <SafeAreaView
            style={{ position: "absolute", top: 0, left: 0, right: 0 }}
            pointerEvents="box-none"
          >
            <View className="px-5 py-2 flex-row justify-between items-center mt-2">
              <GlassButton
                onPress={() => router.back()}
                size={44}
                shape="circle"
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={isDark ? "#F3F4F6" : "#18181B"}
                />
              </GlassButton>
              <GlassButton
                shape="pill"
                size={40}
                haptic={false}
                isInteractive={false}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View className="w-2 h-2 rounded-full bg-primary mr-2" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "900",
                      color: isDark ? "#F3F4F6" : "#18181B",
                    }}
                  >
                    {rooms.length} {rooms.length === 1 ? "Room" : "Rooms"}
                  </Text>
                </View>
              </GlassButton>
            </View>
          </SafeAreaView>

          {/* Bottom Cards Carousel */}
          <View
            style={{
              position: "absolute",
              bottom: 20 + insets.bottom,
              left: 0,
              right: 0,
            }}
          >
            <FlatList
              ref={flatListRef}
              data={rooms}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: (width - ITEM_WIDTH) / 2,
              }}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / SNAP_INTERVAL,
                );
                if (rooms[index] && rooms[index].id !== selectedRoomId) {
                  animateToRoom(rooms[index]);
                }
              }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={{ width: CARD_WIDTH, marginHorizontal: ITEM_MARGIN }}
                >
                  <RoomCard
                    room={item}
                    onPress={() => handleCardPress(item)}
                    currentUserId={firestoreUser?.id}
                    isExploreMode={isGhostBrowsing}
                  />
                </View>
              )}
            />
          </View>
        </>
      )}

      <RoomJoinSheet
        ref={bottomSheetModalRef}
        room={selectedRoomToJoin}
        onConfirm={handleJoinRoom}
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
    </View>
  );
}
