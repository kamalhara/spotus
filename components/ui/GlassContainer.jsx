import { Platform, StyleSheet, View } from "react-native";

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

/**
 * A reusable container that renders with iOS 26 liquid glass on supported devices,
 * and falls back to a standard opaque style on Android / older iOS.
 *
 * Usage:
 *   <GlassContainer borderRadius={24} fallbackClassName="bg-white dark:bg-gray-800">
 *     <Text>Content inside glass</Text>
 *   </GlassContainer>
 *
 * Props:
 *   - children           Content inside the container
 *   - style              Extra styles for the container (e.g., margins, padding)
 *   - fallbackClassName  NativeWind class applied to the fallback View (for dark/light mode bg)
 *   - glassEffectStyle   "regular" | "prominent" (default: "regular")
 *   - isInteractive      Enable liquid-glass drag effect (default: false)
 *   - borderRadius       Border radius applied to both glass and fallback (default: 16)
 */
export default function GlassContainer({
  children,
  className,
  style,
  fallbackClassName,
  glassEffectStyle = "regular",
  isInteractive = false,
  borderRadius = 16,
}) {
  const containerStyle = {
    borderRadius,
    overflow: "hidden",
    ...StyleSheet.flatten(style),
  };

  if (hasGlass) {
    return (
      <GlassView
        style={containerStyle}
        glassEffectStyle={glassEffectStyle}
        isInteractive={isInteractive}
      >
        {children}
      </GlassView>
    );
  }

  const defaultFallback =
    "bg-white dark:bg-[#1C1C20] border border-gray-100 dark:border-[#2C2C30]";

  return (
    <View
      className={`${className} ${fallbackClassName || defaultFallback}`}
      style={[
        { borderRadius, overflow: "hidden" },
        styles.fallbackShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});
