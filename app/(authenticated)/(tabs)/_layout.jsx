import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs, usePathname } from "expo-router";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
} from "expo-router/unstable-native-tabs";
import { useEffect, useRef } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FloatingGlassButton from "../../../components/ui/FloatingGlassButton";
import {
  FloatingButtonProvider,
  useFloatingButton,
} from "../../../context/FloatingButtonContext";
import { useTheme } from "../../../context/ThemeContext";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import useUnreadCount from "../../../hook/useUnreadCount";

// ---------------------------------------------------------------------------
// Liquid Glass Tab Bar (Android)
// ---------------------------------------------------------------------------
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_MARGIN = 16;
const TAB_BAR_WIDTH = SCREEN_WIDTH - TAB_BAR_MARGIN * 2;
const TAB_BAR_HEIGHT = 65;

const LiquidTabBar = ({ state, descriptors, navigation, unreadCount }) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const tabWidth = TAB_BAR_WIDTH / state.routes.length;
  const bubbleX = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    bubbleX.value = withSpring(state.index * tabWidth, {
      damping: 16,
      stiffness: 120,
      mass: 0.8,
    });
  }, [state.index, bubbleX, tabWidth]);

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: bubbleX.value }],
    };
  });

  return (
    <View
      style={{
        position: "absolute",
        bottom: 20 + insets.bottom,
        left: TAB_BAR_MARGIN,
        right: TAB_BAR_MARGIN,
        height: TAB_BAR_HEIGHT,
        backgroundColor: isDark
          ? "rgba(24, 24, 27, 0.85)"
          : "rgba(255, 255, 255, 0.85)",
        borderRadius: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 15,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* Animated Sliding Bubble */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            width: tabWidth,
            height: TAB_BAR_HEIGHT - 12,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
          },
          bubbleStyle,
        ]}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            borderRadius: 30,
          }}
        />
      </Animated.View>

      {/* Tab Items */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconColor = isFocused
          ? isDark
            ? "#818CF8"
            : "#4F46E5"
          : isDark
            ? "#6B7280"
            : "#9CA3AF";

        let iconName = "home";
        if (route.name === "home")
          iconName = isFocused ? "home" : "home-outline";
        if (route.name === "rooms_tab")
          iconName = isFocused ? "people" : "people-outline";
        if (route.name === "chat_tab")
          iconName = isFocused ? "chatbubbles" : "chatbubbles-outline";
        if (route.name === "profile")
          iconName = isFocused ? "person" : "person-outline";

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <AnimatedIcon
              isFocused={isFocused}
              iconName={iconName}
              color={iconColor}
              label={options.title}
              showBadge={route.name === "chat_tab" && unreadCount > 0}
              badgeCount={unreadCount}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const AnimatedIcon = ({
  isFocused,
  iconName,
  color,
  label,
  showBadge,
  badgeCount,
}) => {
  const scale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      damping: 14,
      stiffness: 150,
    });
  }, [isFocused, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    const s = interpolate(scale.value, [0, 1], [1, 1.1]);
    const y = interpolate(scale.value, [0, 1], [0, -2]);
    return {
      transform: [{ scale: s }, { translateY: y }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, { alignItems: "center" }]}>
      <View>
        <Ionicons name={iconName} size={22} color={color} />
        {showBadge && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -8,
              backgroundColor: "#EF4444",
              borderRadius: 10,
              minWidth: 16,
              height: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 4,
              borderWidth: 1.5,
              borderColor: "white",
            }}
          >
            <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>
              {badgeCount}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={{ fontSize: 10, color: color, fontWeight: "600", marginTop: 2 }}
      >
        {label}
      </Text>
    </Animated.View>
  );
};



// ── Resolve active tab name from pathname ─────────────────────────────────
function getActiveTab(pathname) {
  // pathname is e.g. "/(authenticated)/(tabs)/home" or "/home"
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  // Handle tab names directly
  if (["home", "rooms_tab", "chat_tab", "profile"].includes(lastSegment)) {
    return lastSegment;
  }
  return "home"; // default
}

// ── Inner layout that can access the floating button context ──────────────
function TabsLayoutInner() {
  const { firestoreUser } = useFirestoreUser();
  const { isDark } = useTheme();
  const unreadCount = useUnreadCount(firestoreUser?.id);
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);
  const { override } = useFloatingButton();

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === "android" ? (
        <Tabs
          screenOptions={{
            headerShown: false,
          }}
          tabBar={(props) => <LiquidTabBar {...props} unreadCount={unreadCount} />}
        >
          <Tabs.Screen name="home" options={{ title: "Home" }} />
          <Tabs.Screen name="rooms_tab" options={{ title: "Rooms" }} />
          <Tabs.Screen name="chat_tab" options={{ title: "Chat" }} />
          <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
      ) : (
        <NativeTabs>
          <NativeTabs.Trigger name="home">
            <Label>Home</Label>
            <Icon
              selectedColor={isDark ? "#818CF8" : "#4F46E5"}
              sf={{ default: "house", selected: "house.fill" }}
            />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="rooms_tab">
            <Label>Rooms</Label>
            <Icon
              selectedColor={isDark ? "#818CF8" : "#4F46E5"}
              sf={{ default: "person.2", selected: "person.2.fill" }}
            />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="chat_tab">
            <Label>Chat</Label>
            <Icon
              selectedColor={isDark ? "#818CF8" : "#4F46E5"}
              sf={{ default: "message", selected: "message.fill" }}
            />
            {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="profile">
            <Label>Profile</Label>
            <Icon
              selectedColor={isDark ? "#818CF8" : "#4F46E5"}
              sf={{
                default: "person.crop.circle",
                selected: "person.crop.circle.fill",
              }}
            />
          </NativeTabs.Trigger>
        </NativeTabs>
      )}

      {/* Persistent morphing glass button — floats above all tabs */}
      <FloatingGlassButton activeTab={activeTab} override={override} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <FloatingButtonProvider>
      <TabsLayoutInner />
    </FloatingButtonProvider>
  );
}
