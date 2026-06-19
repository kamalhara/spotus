import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import GlassButton from "./GlassButton";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function ImageViewer({
  visible,
  imageUrl,
  onClose,
  senderName,
  timestamp,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const initialPinchDistance = useRef(0);
  const initialPinchScale = useRef(1);
  const lastTapTime = useRef(0);

  const [isZoomed, setIsZoomed] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!imageUrl) return;
    try {
      setIsSharing(true);

      const fileUri = `${FileSystem.cacheDirectory}shared_image_${Date.now()}.jpg`;
      const downloadRes = await FileSystem.downloadAsync(imageUrl, fileUri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert("Error", "Sharing is not available on your device");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share the image.");
    } finally {
      setIsSharing(false);
    }
  };

  const resetPosition = useCallback(() => {
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
    setIsZoomed(false);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
    ]).start();
  }, [scale, translateX, translateY]);

  const handleDoubleTap = useCallback(() => {
    if (lastScale.current > 1.1) {
      resetPosition();
    } else {
      lastScale.current = 2.5;
      setIsZoomed(true);
      Animated.spring(scale, {
        toValue: 2.5,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    }
  }, [scale, resetPosition]);

  const getDistance = (touches) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: (evt) => {
        const now = Date.now();
        if (
          evt.nativeEvent.changedTouches.length === 1 &&
          now - lastTapTime.current < 300
        ) {
          handleDoubleTap();
        }
        lastTapTime.current = now;

        if (evt.nativeEvent.touches.length === 2) {
          initialPinchDistance.current = getDistance(evt.nativeEvent.touches);
          initialPinchScale.current = lastScale.current;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          const currentDistance = getDistance(evt.nativeEvent.touches);
          if (initialPinchDistance.current > 0) {
            const newScale =
              initialPinchScale.current *
              (currentDistance / initialPinchDistance.current);
            const clampedScale = Math.min(Math.max(newScale, 0.5), 5);
            scale.setValue(clampedScale);
            lastScale.current = clampedScale;
            setIsZoomed(clampedScale > 1.1);
          }
        } else if (lastScale.current > 1.1) {
          // Pan when zoomed in
          const newX = lastTranslateX.current + gestureState.dx;
          const newY = lastTranslateY.current + gestureState.dy;
          translateX.setValue(newX);
          translateY.setValue(newY);
        } else {
          // Vertical drag to dismiss when not zoomed
          translateY.setValue(gestureState.dy);
          const opacity = Math.max(
            0,
            1 - Math.abs(gestureState.dy) / (SCREEN_H * 0.35),
          );
          backdropOpacity.setValue(opacity);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length > 0) return;

        if (lastScale.current < 1) {
          resetPosition();
          return;
        }

        if (lastScale.current > 1.1) {
          lastTranslateX.current += gestureState.dx;
          lastTranslateY.current += gestureState.dy;
        } else {
          // Dismiss if swiped down/up far enough
          if (
            Math.abs(gestureState.dy) > 120 ||
            Math.abs(gestureState.vy) > 0.5
          ) {
            handleClose();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 6,
              }),
              Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      },
    }),
  ).current;

  const handleClose = useCallback(() => {
    Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      resetPosition();
      backdropOpacity.setValue(0);
      onClose?.();
    });
  }, [backdropOpacity, resetPosition, onClose]);

  const handleShow = useCallback(() => {
    resetPosition();
    backdropOpacity.setValue(0);
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [backdropOpacity, resetPosition]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
      onShow={handleShow}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />

        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: isZoomed ? 0 : backdropOpacity }]}
        >
          <GlassButton onPress={handleClose}>
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={22} color="#fff" />
            </View>
          </GlassButton>

          {senderName && (
            <View style={styles.headerInfo}>
              <Text style={styles.senderName} numberOfLines={1}>
                {senderName}
              </Text>
              {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
            </View>
          )}

          <GlassButton onPress={handleShare} disabled={isSharing}>
            <View style={styles.closeButtonInner}>
              {isSharing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="share-outline" size={20} color="#fff" />
              )}
            </View>
          </GlassButton>
        </Animated.View>

        {/* Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: backdropOpacity,
              transform: [{ translateX }, { translateY }, { scale }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    marginRight: 14,
  },
  closeButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  senderName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  timestamp: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  imageContainer: {
    width: SCREEN_W,
    height: SCREEN_H,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H * 0.75,
  },
});
