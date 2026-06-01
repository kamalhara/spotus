import { useEffect, useRef } from"react";
import { Animated } from"react-native";

export default function Skeleton({ width, height, borderRadius = 8, style, className }) {
 const opacity = useRef(new Animated.Value(0.3)).current;

 useEffect(() => {
 const animation = Animated.loop(
 Animated.sequence([
 Animated.timing(opacity, {
 toValue: 0.7,
 duration: 800,
 useNativeDriver: true,
 }),
 Animated.timing(opacity, {
 toValue: 0.3,
 duration: 800,
 useNativeDriver: true,
 }),
 ])
 );
 animation.start();

 return () => animation.stop();
 }, [opacity]);

 return (
 <Animated.View
 style={[
 { width, height, borderRadius, backgroundColor:"#E2E8F0", opacity },
 style,
 ]}
 className={className}
 />
 );
}
