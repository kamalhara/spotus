/**
 * TEMPORARY DEVELOPMENT-ONLY FEATURE
 * 
 * This module is intended to prevent Render free-tier instances from spinning down
 * due to inactivity by periodically pinging the application's own /ping endpoint.
 * 
 * TODO: Remove this module and its initialization once SpotUs is deployed on a 
 * paid, always-on production server.
 */

const BASE_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes
const MAX_INTERVAL_MS = 28 * 60 * 1000;  // 28 minutes (max backoff)
const MAX_JITTER_MS = 60 * 1000;          // 60 seconds random jitter

const startKeepAlive = () => {
  const enableSelfPing = process.env.ENABLE_SELF_PING;
  const renderExternalUrl = process.env.RENDER_EXTERNAL_URL;

  if (enableSelfPing !== 'true') {
    return;
  }

  if (!renderExternalUrl) {
    console.warn('Keep-alive is enabled but RENDER_EXTERNAL_URL is not set.');
    return;
  }

  let consecutiveFailures = 0;

  /**
   * Calculate the next ping interval with exponential backoff and random jitter.
   * On success: base interval + jitter.
   * On failure: doubles the interval per consecutive failure (capped at MAX_INTERVAL_MS) + jitter.
   */
  const getNextInterval = () => {
    const backoff = Math.min(
      BASE_INTERVAL_MS * Math.pow(2, consecutiveFailures),
      MAX_INTERVAL_MS
    );
    const jitter = Math.floor(Math.random() * MAX_JITTER_MS);
    return backoff + jitter;
  };

  const ping = async () => {
    try {
      const response = await fetch(`${renderExternalUrl}/ping`);
      if (response.ok) {
        console.log('Keep-alive ping successful');
        consecutiveFailures = 0;
      } else {
        consecutiveFailures++;
        console.error(`Keep-alive ping failed with status: ${response.status}`);
        if (consecutiveFailures >= 3) {
          console.warn(
            `Keep-alive: ${consecutiveFailures} consecutive ping failures. Server may be unreachable.`
          );
        }
      }
    } catch (error) {
      consecutiveFailures++;
      console.error(`Keep-alive ping failed: ${error.message}`);
      if (consecutiveFailures >= 3) {
        console.warn(
          `Keep-alive: ${consecutiveFailures} consecutive ping failures. Server may be unreachable.`
        );
      }
    }

    // Schedule next ping with dynamic interval
    const nextInterval = getNextInterval();
    setTimeout(ping, nextInterval);
  };

  const initialInterval = getNextInterval();
  console.log(`Keep-alive ping scheduled for ${renderExternalUrl} (base interval: 14 minutes with jitter).`);
  setTimeout(ping, initialInterval);
};

module.exports = { startKeepAlive };
