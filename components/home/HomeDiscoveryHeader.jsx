import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRef } from "react";
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CATEGORY_ICONS } from "../../constants/categories";
import CategoryChips from "./CategoryChips";
import NearbyPulse from "./NearbyPulse";
import GlassButton from "../ui/GlassButton";

function getHeadline(roomCount, isLoading) {
  if (isLoading) return "Looking nearby...";
  if (roomCount === 0) return "Quiet for now";
  if (roomCount === 1) return "1 room nearby";
  if (roomCount <= 3) return `${roomCount} rooms nearby`;
  return `${roomCount} rooms buzzing`;
}

export default function HomeDiscoveryHeader({
  roomsCount,
  peopleCount,
  displayDistance,
  filteredRoomCount,
  loading,
  roomCountLabel,
  isDark,
  fadeInContent,
  slideUpContent,
  onDistanceChange,
  onCreateRoom,
  onJoinByCode,
  onCategoryChange,
  onMapPress,
  activeCategory,
  onCreateLayout,
}) {
  const sliderWidth = useRef(0);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipContainerRef = useRef(null);
  const tooltipTextRef = useRef(null);

  const animatedStyle = {
    opacity: fadeInContent,
    transform: [{ translateY: slideUpContent }],
  };

  return (
    <>
      <NearbyPulse
        roomsCount={roomsCount}
        peopleCount={peopleCount}
        radius={displayDistance}
      />

      <Animated.View className="mt-4 mb-1" style={animatedStyle}>
        <Text className="text-secondary dark:text-gray-100 text-[26px] font-display tracking-tight">
          {getHeadline(filteredRoomCount, loading)}
        </Text>
        {!loading && filteredRoomCount > 0 && (
          <Text className="text-muted text-[14px] font-body mt-1">
            {roomCountLabel} within {displayDistance}km
          </Text>
        )}
      </Animated.View>

      <Animated.View className="mt-5" style={animatedStyle}>
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
            onLayout={(event) => {
              sliderWidth.current = event.nativeEvent.layout.width;
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
                Animated.timing(tooltipOpacity, {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true,
                }).start();
              }}
              onValueChange={(value) => {
                const rounded = Math.round(value);
                const left =
                  ((rounded - 1) / 39) * (sliderWidth.current - 28) + 14 - 22;
                tooltipContainerRef.current?.setNativeProps({
                  style: { left },
                });
                tooltipTextRef.current?.setNativeProps({
                  text: String(rounded),
                });
              }}
              onSlidingComplete={(value) => {
                Animated.timing(tooltipOpacity, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
                onDistanceChange(Math.round(value));
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

      <Animated.View
        className="mt-5"
        onLayout={onCreateLayout}
        style={animatedStyle}
      >
        <TouchableOpacity
          onPress={onCreateRoom}
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

      <Animated.View className="mt-3 mb-5" style={animatedStyle}>
        <TouchableOpacity
          onPress={onJoinByCode}
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
        onSelectCategory={onCategoryChange}
      />

      <View className="mb-2">
        <View className="flex flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <Text className="text-secondary dark:text-gray-100 text-[20px] font-heading tracking-tight">
              {activeCategory === "all" ? "Nearby" : activeCategory}
            </Text>
            {filteredRoomCount > 0 && (
              <Text className="text-muted text-[13px] font-medium">
                {filteredRoomCount}
              </Text>
            )}
          </View>
          <GlassButton onPress={onMapPress} shape="pill" size={32}>
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
}
