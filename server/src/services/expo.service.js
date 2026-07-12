const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true
});

const sendPushNotification = async (pushToken, title, body, data, sound = 'default') => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return { success: false, error: 'DeviceNotRegistered' }; // Treat invalid token format same as not registered for cleanup
  }

  const messages = [{
    to: pushToken,
    sound: sound,
    title: title,
    body: body,
    data: data,
    priority: "high",
    badge: 1,
  }];

  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(messages);
    const ticket = ticketChunk[0];

    if (ticket.status === 'error') {
      console.error(`Error sending push notification: ${ticket.message}`);
      if (ticket.details && ticket.details.error) {
        return { success: false, error: ticket.details.error };
      }
      return { success: false, error: ticket.message };
    }

    return { success: true, ticket };
  } catch (error) {
    console.error("Failed to send notification via Expo Server SDK", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notifications to multiple recipients in a single batch.
 * Uses Expo's chunking API for efficient delivery.
 * @param {Array<{pushToken: string, title: string, body: string, data: object, sound: string}>} messages
 * @returns {Promise<Array<{pushToken: string, success: boolean, ticket?: object, error?: string}>>}
 */
const sendBatchPushNotifications = async (messages) => {
  const results = [];
  const validMessages = [];

  // Validate tokens and separate invalid ones
  for (const msg of messages) {
    if (!Expo.isExpoPushToken(msg.pushToken)) {
      console.error(`Push token ${msg.pushToken} is not a valid Expo push token`);
      results.push({ pushToken: msg.pushToken, success: false, error: 'InvalidPushToken' });
    } else {
      validMessages.push(msg);
    }
  }

  if (validMessages.length === 0) {
    return results;
  }

  // Build Expo message objects
  const expoMessages = validMessages.map((msg) => ({
    to: msg.pushToken,
    sound: msg.sound || 'default',
    title: msg.title,
    body: msg.body,
    data: msg.data || {},
    priority: 'high',
    badge: 1,
  }));

  // Chunk and send
  const chunks = expo.chunkPushNotifications(expoMessages);
  let ticketIndex = 0;

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of ticketChunk) {
        const originalMsg = validMessages[ticketIndex];
        if (ticket.status === 'error') {
          console.error(`Batch push error for ${originalMsg.pushToken}: ${ticket.message}`);
          results.push({
            pushToken: originalMsg.pushToken,
            success: false,
            error: ticket.details?.error || ticket.message,
          });
        } else {
          results.push({
            pushToken: originalMsg.pushToken,
            success: true,
            ticket,
          });
        }
        ticketIndex++;
      }
    } catch (error) {
      console.error('Failed to send batch chunk via Expo Server SDK:', error);
      // Mark remaining messages in this chunk as failed
      const chunkSize = chunk.length;
      for (let i = 0; i < chunkSize; i++) {
        if (ticketIndex < validMessages.length) {
          results.push({
            pushToken: validMessages[ticketIndex].pushToken,
            success: false,
            error: error.message,
          });
          ticketIndex++;
        }
      }
    }
  }

  return results;
};

module.exports = { sendPushNotification, sendBatchPushNotifications };
