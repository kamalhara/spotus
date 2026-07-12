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

module.exports = { sendPushNotification };
