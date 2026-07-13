import { apiRequest } from "./api";
import { getCurrentLocation } from "./location";

export const createRoom = async (
  title,
  description,
  category,
  userId,
  showOnMap,
  duration,
  token,
) => {
  const trimmedTitle = title?.trim();
  const hours = Number(duration);

  if (!trimmedTitle || !category) {
    throw new Error("Title and category are required");
  }

  if (!userId) {
    throw new Error("User is required");
  }

  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error("Duration must be a positive number of hours");
  }

  const location = await getCurrentLocation();
  const roomData = {
    title: trimmedTitle,
    description: description?.trim() || "",
    category,
    showOnMap: !!showOnMap,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    capturedAt: location.capturedAt,
    duration: hours,
  };
  const result = await apiRequest("/api/rooms", {
    method: "POST",
    token,
    timeoutMs: 60000,
    body: JSON.stringify(roomData),
  });

  return result;
};
