import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useModal } from "../../../context/ModalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExploreInterceptModal from "../../../components/shared/ExploreInterceptModal";
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../../components/ui/CustomButton";
import CustomInput from "../../../components/ui/CustomInput";
import GlassButton from "../../../components/ui/GlassButton";
import CreateRoomOptions from "../../../components/rooms/create/CreateRoomOptions";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { createRoom } from "../../../lib/createRoom";
import { trackEvent } from "../../../lib/analytics";

const MAX_TITLE = 60;

// Threshold at which the inline title scrolls out of view
const TITLE_SCROLL_THRESHOLD = 70;

export default function CreateRooms() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { firestoreUser: user } = useFirestoreUser();
  const { isDark } = useTheme();
  const { showAlert } = useModal();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(3); // Default 3 hours
  const [isCreating, setIsCreating] = useState(false);
  const [showOnMap, setShowOnMap] = useState(true); // Default to Public
  const trimmedTitle = title.trim();
  const canCreateRoom =
    trimmedTitle.length > 0 && !!selectedCategory && !!user?.id && !isCreating;

  const [isGhostBrowsing, setIsGhostBrowsing] = useState(false);
  const [interceptModal, setInterceptModal] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("isGhostBrowsing").then((val) => {
      setIsGhostBrowsing(val === "true");
    });
  }, []);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated style for the compact header title (fades + slides in)
  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [TITLE_SCROLL_THRESHOLD - 20, TITLE_SCROLL_THRESHOLD + 10],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [TITLE_SCROLL_THRESHOLD - 20, TITLE_SCROLL_THRESHOLD + 10],
      [8, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Animated style for the header bottom border (appears on scroll)
  const headerBorderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 30],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
    };
  });

  // Animated style for the inline title (fades out as it scrolls away)
  const inlineTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, TITLE_SCROLL_THRESHOLD],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
    };
  });

  const proceedWithCreation = async () => {
    setIsCreating(true);
    try {
      const token = await getToken();
      const { roomId } = await createRoom(
        trimmedTitle,
        description,
        selectedCategory,
        user.id,
        showOnMap,
        duration,
        token
      );

      trackEvent("room_created", {
        category: selectedCategory,
        duration,
      });

      router.replace(`/rooms/${roomId}`);
    } catch (err) {
      console.error("Error creating room:", err);
      showAlert("Could not create room", err?.message || "Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!trimmedTitle || !selectedCategory) {
      showAlert(
        "Room details needed",
        "Add a room name and choose a category before creating it.",
      );
      return;
    }

    if (!user?.id) {
      showAlert("Profile still loading", "Please try again in a moment.");
      return;
    }

    if (isGhostBrowsing) {
      setInterceptModal(true);
      return;
    }

    await proceedWithCreation();
  };

  return (
    <SafeAreaView className="bg-bg dark:bg-[#111113] flex-1">
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          {/* Glass Back Button */}
          <GlassButton onPress={() => router.back()} size={40} shape="circle">
            <Ionicons
              name="chevron-back"
              size={20}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </GlassButton>

          {/* Animated compact title — slides in on scroll */}
          <Animated.View
            style={[styles.headerTitleContainer, headerTitleStyle]}
          >
            <Text
              className="text-secondary dark:text-gray-100 text-[17px] font-bold tracking-tight"
              numberOfLines={1}
            >
              Create room
            </Text>
          </Animated.View>

          {/* Spacer to balance the back button */}
          <View style={{ width: 40 }} />
        </View>

        {/* Animated border — fades in on scroll */}
        <Animated.View
          style={[
            styles.headerBorder,
            { backgroundColor: isDark ? "#2C2C30" : "#F1F5F9" },
            headerBorderStyle,
          ]}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: 1,
            paddingHorizontal: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              entering={FadeInDown.duration(380).delay(60)}
              className="flex-1"
            >
              {/* Inline Title — fades out on scroll */}
              <Animated.View className="mt-4 mb-8" style={inlineTitleStyle}>
                <Text className="text-secondary dark:text-gray-100 text-[28px] font-display font-extrabold tracking-tight leading-[34px]">
                  Name the room
                </Text>
                <Text className="text-muted text-sm leading-5 mt-2">
                  Be specific about the topic, place, or plan people are joining.
                </Text>
              </Animated.View>

              {/* Room Title Input */}
              <View className="mb-1">
                <CustomInput
                  label="Room name"
                  placeholder="e.g. Chess at the library"
                  value={title}
                  onChangeText={(text) => {
                    if (text.length <= MAX_TITLE) setTitle(text);
                  }}
                />
                <Text className="text-gray-300 dark:text-gray-600 text-xs self-end mt-1.5 mr-1">
                  {title.length}/{MAX_TITLE}
                </Text>
              </View>

              <View>
                <CustomInput
                  label="Notes (optional)"
                  placeholder="Time, landmark, or what to bring"
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                />
              </View>

              <CreateRoomOptions
                duration={duration}
                onDurationChange={setDuration}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                title={title}
                showOnMap={showOnMap}
                onShowOnMapChange={setShowOnMap}
                user={user}
                isDark={isDark}
              />
              {/* Create Button */}
              <View className="flex-1 justify-end mt-10">
                <CustomButton
                  title="Create room"
                  onPress={handleCreateRoom}
                  disabled={!canCreateRoom}
                  loading={isCreating}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <ExploreInterceptModal
        visible={interceptModal}
        actionName="create a room"
        onClose={() => setInterceptModal(false)}
        onEnableLocation={async () => {
          setInterceptModal(false);
          await AsyncStorage.setItem("isGhostBrowsing", "false");
          setIsGhostBrowsing(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});
