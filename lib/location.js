import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trackEvent } from "./analytics";

export const GHOST_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194, // San Francisco Center
};

export async function getCurrentLocation() {
  const isGhost = await AsyncStorage.getItem("isGhostBrowsing");
  if (isGhost === "true") {
    trackEvent("browse_without_location_permission", { method: "ghost_browsing" });
    return GHOST_LOCATION;
  }

  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  const location = await Location.getCurrentPositionAsync({});

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function getSilentLocation() {
  try {
    const isGhost = await AsyncStorage.getItem("isGhostBrowsing");
    if (isGhost === "true") {
      return GHOST_LOCATION;
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      return null;
    }

    const location = await Location.getLastKnownPositionAsync({}) || await Location.getCurrentPositionAsync({});
    if (!location) return null;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    return null;
  }
}
