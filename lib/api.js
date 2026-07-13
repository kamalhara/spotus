import { API_BASE_URL } from "../constants/api";

// Render free instances can take tens of seconds to wake after inactivity.
const DEFAULT_TIMEOUT_MS = 45000;

export class ApiError extends Error {
  constructor(message, { code, status, requestId, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

export async function apiRequest(path, { token, timeoutMs = DEFAULT_TIMEOUT_MS, ...options } = {}) {
  if (!token) {
    throw new ApiError("Your session has expired. Please sign in again.", {
      code: "UNAUTHENTICATED",
      status: 401,
    });
  }

  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const payload = response.status === 204
      ? null
      : await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(
        payload?.error?.message || "The request could not be completed.",
        {
          code: payload?.error?.code,
          status: response.status,
          requestId: payload?.requestId,
          details: payload?.error?.details,
        },
      );
    }
    return payload;
  } catch (error) {
    if (didTimeout || error?.name === "AbortError") {
      throw new ApiError("SpotUs is waking up. Please wait a moment and try again.", {
        code: "TIMEOUT",
      });
    }
    if (error instanceof ApiError) throw error;
    if (__DEV__) {
      console.warn("SpotUs API connection failed", {
        baseUrl: API_BASE_URL,
        path,
        message: error?.message,
      });
    }
    throw new ApiError("Unable to reach SpotUs. Check your connection and try again.", {
      code: "NETWORK_ERROR",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Starts waking the API when the app launches. This is intentionally best-effort
 * and never blocks rendering or shows an error to the user.
 */
export async function warmApi() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  try {
    await fetch(`${API_BASE_URL}/ping`, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } catch {
    // The next authenticated request still performs its own error handling.
  } finally {
    clearTimeout(timeoutId);
  }
}
