import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "nativewind";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE_MAP = {
  small: 24,
  medium: 32,
  large: 64,
  hero: 96,
};

export default function SpotUsLoader({
  size = "small",
  color,
  accessibilityLabel = "Loading",
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const dimension =
    typeof size === "number" ? size : SIZE_MAP[size] || SIZE_MAP.small;

  const defaultActiveColor = isDark ? "#F5F5F5" : "#111113";
  // Use passed color for the main nodes, otherwise use theme color
  const ACTIVE_COLOR = color || defaultActiveColor;
  const INACTIVE_COLOR = "#FF8566";

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      -1,
      false,
    );
  }, [progress]);

  const inputRange = [0, 0.3333, 0.6666, 1];

  // Node Left
  const nodeLeftProps = useAnimatedProps(() => {
    return {
      stroke: interpolateColor(
        progress.value,
        inputRange,
        [ACTIVE_COLOR, INACTIVE_COLOR, INACTIVE_COLOR, ACTIVE_COLOR]
      ),
      fillOpacity: interpolate(progress.value, inputRange, [1, 0, 0, 1]),
      r: interpolate(progress.value, [0, 0.08, 0.22, 1], [91, 95.55, 91, 91]),
    };
  });

  // Node Top
  const nodeTopProps = useAnimatedProps(() => {
    return {
      stroke: interpolateColor(
        progress.value,
        inputRange,
        [INACTIVE_COLOR, ACTIVE_COLOR, INACTIVE_COLOR, INACTIVE_COLOR]
      ),
      fillOpacity: interpolate(progress.value, inputRange, [0, 1, 0, 0]),
      r: interpolate(progress.value, [0, 0.3333, 0.4133, 0.5533, 1], [91, 91, 95.55, 91, 91]),
    };
  });

  // Node Right
  const nodeRightProps = useAnimatedProps(() => {
    return {
      stroke: interpolateColor(
        progress.value,
        inputRange,
        [INACTIVE_COLOR, INACTIVE_COLOR, ACTIVE_COLOR, INACTIVE_COLOR]
      ),
      fillOpacity: interpolate(progress.value, inputRange, [0, 0, 1, 0]),
      r: interpolate(progress.value, [0, 0.6666, 0.7466, 0.8866, 1], [91, 91, 95.55, 91, 91]),
    };
  });

  // Line Bottom (Left to Right)
  const lineBottomProps = useAnimatedProps(() => {
    return {
      stroke: interpolateColor(
        progress.value,
        inputRange,
        [ACTIVE_COLOR, INACTIVE_COLOR, INACTIVE_COLOR, ACTIVE_COLOR]
      ),
    };
  });

  // Line Left Diag (Top to Left)
  const lineLeftDiagProps = useAnimatedProps(() => {
    return {
      stroke: interpolateColor(
        progress.value,
        inputRange,
        [INACTIVE_COLOR, ACTIVE_COLOR, INACTIVE_COLOR, INACTIVE_COLOR]
      ),
    };
  });

  // Line Right Diag (Top to Right)
  const lineRightDiagProps = useAnimatedProps(() => {
    return {
      stroke: interpolateColor(
        progress.value,
        inputRange,
        [INACTIVE_COLOR, INACTIVE_COLOR, ACTIVE_COLOR, INACTIVE_COLOR]
      ),
    };
  });

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      style={{ width: dimension, height: dimension }}
      className="items-center justify-center"
    >
      <Svg
        viewBox="0 0 708 652"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <AnimatedPath
          animatedProps={lineRightDiagProps}
          d="M425.5 169L588.5 448.5"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <AnimatedPath
          animatedProps={lineBottomProps}
          d="M200 552L507 552"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <AnimatedPath
          animatedProps={lineLeftDiagProps}
          d="M286 169L135 452"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <AnimatedCircle
          animatedProps={nodeTopProps}
          cx="354"
          cy="100"
          fill={ACTIVE_COLOR}
          strokeWidth="18"
        />
        <AnimatedCircle
          animatedProps={nodeRightProps}
          cx="608"
          cy="552"
          fill={ACTIVE_COLOR}
          strokeWidth="18"
        />
        <AnimatedCircle
          animatedProps={nodeLeftProps}
          cx="100"
          cy="552"
          fill={ACTIVE_COLOR}
          strokeWidth="18"
        />
      </Svg>
    </View>
  );
}
