import { apiRequest } from "./api";

const RETRY_DELAYS_MS = [600, 1500];

function isRetryable(error) {
  return (
    error?.code === "NETWORK_ERROR" ||
    error?.code === "TIMEOUT" ||
    error?.status >= 500
  );
}

export async function sendRoomMessage(roomId, payload, token) {
  const canRetry = Boolean(payload?.clientMessageId);
  const attempts = canRetry ? RETRY_DELAYS_MS.length + 1 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await apiRequest(
        `/api/rooms/${encodeURIComponent(roomId)}/messages`,
        {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        },
      );
    } catch (error) {
      const shouldRetry = attempt < attempts - 1 && isRetryable(error);
      if (!shouldRetry) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAYS_MS[attempt]),
      );
    }
  }
}
