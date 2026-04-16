import { useState, useEffect } from "react";
import { getStatus } from "../lib/getStatus";

/**
 * A hook that provides a real-time presence status string.
 * It refreshes every 30 seconds to ensure status transitions
 * (e.g., from "Active now" to "1 min ago") happen automatically.
 * 
 * @param {Timestamp} lastSeen - Firestore Timestamp of the user's last activity.
 * @returns {string} The formatted status string (e.g., "Active now", "5 min ago").
 */
export default function usePresenceStatus(lastSeen) {
  const [status, setStatus] = useState(() => getStatus(lastSeen));

  useEffect(() => {
    // Immediate update when lastSeen changes
    setStatus(getStatus(lastSeen));

    // Refersh every 30 seconds to keep relative time accurate
    const interval = setInterval(() => {
      setStatus(getStatus(lastSeen));
    }, 30000);

    return () => clearInterval(interval);
  }, [lastSeen]);

  return status;
}
