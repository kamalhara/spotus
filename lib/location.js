import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trackEvent } from "./analytics";

export const GHOST_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194, // San Francisco Center
};

const protectLocation = (coords, precise) => ({
  latitude: precise ? coords.latitude : Number(coords.latitude.toFixed(3)),
  longitude: precise ? coords.longitude : Number(coords.longitude.toFixed(3)),
});

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

  const precise = (await AsyncStorage.getItem("preciseLocation")) === "true";
  const location = await Location.getCurrentPositionAsync({
    accuracy: precise ? Location.Accuracy.High : Location.Accuracy.Balanced,
  });

  return {
    ...protectLocation(location.coords, precise),
    accuracy: location.coords.accuracy,
    capturedAt: location.timestamp,
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

    const precise = (await AsyncStorage.getItem("preciseLocation")) === "true";
    const location = await Location.getLastKnownPositionAsync({}) || await Location.getCurrentPositionAsync({
      accuracy: precise ? Location.Accuracy.High : Location.Accuracy.Balanced,
    });
    if (!location) return null;

    return {
      ...protectLocation(location.coords, precise),
    };
  } catch (_error) {
    return null;
  }
}
