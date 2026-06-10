import * as Haptics from "expo-haptics";
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

let GlassView, isLiquidGlassAvailable;
try {
  const glassModule = require("expo-glass-effect");
  GlassView = glassModule.GlassView;
  isLiquidGlassAvailable = glassModule.isLiquidGlassAvailable;
} catch {
  GlassView = null;
  isLiquidGlassAvailable = () => false;
}

const hasGlass =
  Platform.OS === "ios" && GlassView && isLiquidGlassAvailable();

/**
 * A navigation-chrome button that renders with iOS 26 liquid glass
 * on supported devices, and falls back to the existing opaque style
 * on Android / older iOS.
 *
 * Usage:
 *   <GlassButton onPress={handleBack} shape="circle">
 *     <Ionicons name="chevron-back" size={20} />
 *   </GlassButton>
 *
 * Props:
 *   - onPress        callback
 *   - children       icon / text inside the button
 *   - shape          "circle" (default) | "pill"
 *   - size           number, default 40
 *   - style          extra styles for the outer wrapper
 *   - className      NativeWind class for the fallback View
 *   - isInteractive  enable liquid-glass drag effect (default true)
 *   - haptic         enable haptic feedback (default true)
 */
export default function GlassButton({
  onPress,
  children,
  shape = "circle",
  size = 40,
  style,
  className,
  isInteractive = true,
  haptic = true,
  disabled = false,
}) {
  const handlePress = () => {
    if (disabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const borderRadius = shape === "circle" ? size / 2 : 16;

  const glassStyle = {
    width: shape === "pill" ? undefined : size,
    height: size,
    borderRadius,
    alignItems: "center",
    justifyContent: "center",
    ...(shape === "pill" && { paddingHorizontal: 14, minWidth: size }),
  };

  const fallbackClassName =
    className ||
    `items-center justify-center bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36]`;

  if (hasGlass) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[{ width: shape === "pill" ? undefined : size, height: size }, style]}
      >
        <GlassView
          style={glassStyle}
          glassEffectStyle="regular"
          isInteractive={isInteractive}
        >
          {children}
        </GlassView>
      </Pressable>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.75}
      className={fallbackClassName}
      style={[
        {
          width: shape === "pill" ? undefined : size,
          height: size,
          borderRadius,
          ...(shape === "pill" && { paddingHorizontal: 14, minWidth: size }),
        },
        styles.fallbackShadow,
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fallbackShadow: {
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});
