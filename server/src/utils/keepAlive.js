/**
 * TEMPORARY DEVELOPMENT-ONLY FEATURE
 * 
 * This module is intended to prevent Render free-tier instances from spinning down
 * due to inactivity by periodically pinging the application's own /ping endpoint.
 * 
 * TODO: Remove this module and its initialization once SpotUs is deployed on a 
 * paid, always-on production server.
 */

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

  console.log(`Keep-alive ping scheduled for ${renderExternalUrl} every 14 minutes.`);
  
  setInterval(async () => {
    try {
      const response = await fetch(`${renderExternalUrl}/ping`);
      if (response.ok) {
        console.log('Keep-alive ping successful');
      } else {
        console.error(`Keep-alive ping failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Keep-alive ping failed: ${error.message}`);
    }
  }, 14 * 60 * 1000); // 14 minutes
};

module.exports = { startKeepAlive };
