const PING_INTERVAL_MS = 10 * 60 * 1000;
const RETRY_INTERVAL_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 10000;

const startKeepAlive = () => {
  const enableSelfPing = process.env.ENABLE_SELF_PING;
  const renderExternalUrl = process.env.RENDER_EXTERNAL_URL;

  // Explicit opt-in outside Render. Render deployments default to enabled.
  if (enableSelfPing === 'false' || (!renderExternalUrl && enableSelfPing !== 'true')) {
    return;
  }

  if (!renderExternalUrl) {
    console.warn('Keep-alive is enabled but RENDER_EXTERNAL_URL is not set.');
    return;
  }

  const ping = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let nextInterval = PING_INTERVAL_MS;
    try {
      const response = await fetch(`${renderExternalUrl}/ping`, {
        signal: controller.signal,
        headers: { 'user-agent': 'spotus-render-keepalive/1.0' },
      });
      if (response.ok) {
        console.log('Keep-alive ping successful', {
          nextPingMinutes: PING_INTERVAL_MS / 60000,
        });
      } else {
        console.error(`Keep-alive ping failed with status: ${response.status}`);
        nextInterval = RETRY_INTERVAL_MS;
      }
    } catch (error) {
      console.error(`Keep-alive ping failed: ${error.message}`);
      nextInterval = RETRY_INTERVAL_MS;
    } finally {
      clearTimeout(timeoutId);
    }

    setTimeout(ping, nextInterval);
  };

  console.log(`Keep-alive enabled for ${renderExternalUrl} (10-minute interval).`);
  // Confirm the public route shortly after startup, then begin the regular cadence.
  setTimeout(ping, 30000);
};

module.exports = { startKeepAlive };
