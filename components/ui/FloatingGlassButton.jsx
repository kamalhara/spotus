import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

let GlassView, isLiquidGlassAvailable;
try {
  const glassModule = require("expo-glass-effect");
  GlassView = glassModule.GlassView;
  isLiquidGlassAvailable = glassModule.isLiquidGlassAvailable;
} catch {
  GlassView = null;
  isLiquidGlassAvailable = () => false;
}

const hasGlass = Platform.OS === "ios" && GlassView && isLiquidGlassAvailable();

// ── Per-tab default configs ──────────────────────────────────────────────────
const TAB_CONFIGS = {
  home: {
    icon: "refresh",
    iconSize: 20,
    tintColor: null,
    getAction: (router) => null, // handled via override from home screen
  },
  rooms_tab: {
    icon: "add",
    iconSize: 22,
    tintColor: "#FF6B47",
    getAction: (router) => () => router.push("/rooms/create-rooms"),
  },
  chat_tab: {
    hidden: true,
  },
  profile: {
    icon: "settings-outline",
    iconSize: 20,
    tintColor: null,
    getAction: (router) => () => router.push("/profile/accountSetting"),
  },
};

const BUTTON_SIZE = 44;
const SPRING_CONFIG = { damping: 16, stiffness: 140, mass: 0.7 };

/**
 * Persistent floating GlassButton that lives in the tab layout.
 * Morphs its icon, tintColor, and action when switching tabs.
 *
 * Props:
 *   - activeTab   current focused tab route name
 *   - override    optional per-tab override from FloatingButtonContext
 */
export default function FloatingGlassButton({ activeTab, override }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark } = useTheme();

  // Resolve the current config (override takes priority)
  const tabConfig = TAB_CONFIGS[activeTab] || TAB_CONFIGS.home;
  const icon = override?.icon ?? tabConfig.icon;
  const iconSize = override?.iconSize ?? tabConfig.iconSize;
  const tintColor = override?.tintColor ?? tabConfig.tintColor;
  const iconColor =
    override?.iconColor ??
    (tintColor ? "white" : isDark ? "#F5F5F5" : "#18181B");
  const onPress = override?.onPress ?? tabConfig.getAction?.(router);

  // Track the previous icon for animation trigger
  const prevIconRef = useRef(icon);
  const prevTintRef = useRef(tintColor);

  // ── Animation shared values ──────────────────────────────────────────
  const morphProgress = useSharedValue(0);
  const iconScale = useSharedValue(1);

  // Tint color interpolation (drives a state update for the native prop)
  const tintProgress = useSharedValue(tintColor ? 1 : 0);
  const [resolvedTint, setResolvedTint] = useState(tintColor || "transparent");

  const animatedTint = useDerivedValue(() =>
    interpolateColor(
      tintProgress.value,
      [0, 1],
      ["transparent", tintColor || "#FF6B47"],
    ),
  );

  useAnimatedReaction(
    () => animatedTint.value,
    (color) => {
      runOnJS(setResolvedTint)(color);
    },
  );

  // Trigger animations when icon or tintColor change
  useEffect(() => {
    const iconChanged = prevIconRef.current !== icon;
    const tintChanged = prevTintRef.current !== tintColor;

    if (iconChanged) {
      // Pop-scale animation: shrink → grow
      iconScale.value = withSpring(0.6, { damping: 10, stiffness: 200 });
      setTimeout(() => {
        iconScale.value = withSpring(1, SPRING_CONFIG);
      }, 80);

      // Rotation morph
      morphProgress.value = 0;
      morphProgress.value = withSpring(1, SPRING_CONFIG);
    }

    if (tintChanged) {
      tintProgress.value = withTiming(tintColor ? 1 : 0, { duration: 250 });
    }

    prevIconRef.current = icon;
    prevTintRef.current = tintColor;
  }, [icon, tintColor, iconScale, morphProgress, tintProgress]);

  // ── Animated styles ────────────────────────────────────────────────────
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${morphProgress.value * 90}deg` },
    ],
    opacity: iconScale.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const borderRadius = BUTTON_SIZE / 2;

  // ── Render ─────────────────────────────────────────────────────────────
  if (tabConfig.hidden && !override) {
    return null;
  }

  const iconContent = (
    <Animated.View style={iconAnimatedStyle}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </Animated.View>
  );

  const positionStyle = {
    position: "absolute",
    top: insets.top + 14,
    right: 20,
    zIndex: 999,
  };

  if (hasGlass) {
    return (
      <View style={positionStyle}>
        <Pressable onPress={handlePress}>
          <GlassView
            style={{
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius,
              alignItems: "center",
              justifyContent: "center",
            }}
            glassEffectStyle="regular"
            isInteractive
            tintColor={
              resolvedTint !== "transparent" ? resolvedTint : undefined
            }
          >
            {iconContent}
          </GlassView>
        </Pressable>
      </View>
    );
  }

  // Fallback for Android / older iOS
  return (
    <View style={positionStyle}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.75}>
        <View
          style={[
            {
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark
                ? "rgba(28, 28, 32, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              borderWidth: 1,
              borderColor: isDark ? "#2C2C30" : "#E8E6E1",
            },
            styles.fallbackShadow,
          ]}
        >
          {iconContent}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackShadow: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
