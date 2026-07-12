const { getUser, removePushToken, incrementNotificationsSent } = require('../services/firestore.service');
const { sendPushNotification } = require('../services/expo.service');

const sendNotification = async (req, res) => {
  try {
    const { recipientUserId, title, body, data = {} } = req.body;
    
    // Always trust the authenticated user's ID as the sender, ignoring client-provided senderUserId
    const senderUserId = req.auth.userId;

    if (!recipientUserId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prevent self-notifications
    if (recipientUserId === senderUserId) {
      return res.status(200).json({ message: 'Self-notification skipped' });
    }

    // Fetch the recipient's preferences
    const recipientData = await getUser(recipientUserId);
    if (!recipientData) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const pushToken = recipientData.expoPushToken || recipientData.pushToken;
    if (!pushToken) {
      return res.status(200).json({ message: 'Recipient has no push token' });
    }

    // Respect notification preferences
    if (recipientData.notificationsEnabled === false) {
      return res.status(200).json({ message: 'User disabled all notifications' });
    }
    if (data.type === 'message' && recipientData.messageNotifications === false) {
      return res.status(200).json({ message: 'User disabled message notifications' });
    }
    if (data.type === 'room' && recipientData.roomNotifications === false) {
      return res.status(200).json({ message: 'User disabled room notifications' });
    }
    if (data.type === 'nearby_room' && recipientData.nearbyRoomNotifications === false) {
      return res.status(200).json({ message: 'User disabled nearby room notifications' });
    }

    // Skip if online
    if (recipientData.isOnline === true) {
      return res.status(200).json({ message: 'User is online, skipping push' });
    }

    // Send via Expo
    const sound = data.type === 'nearby_room' ? null : 'default';
    const result = await sendPushNotification(pushToken, title, body, { ...data, senderId: senderUserId }, sound);

    if (!result.success) {
      if (result.error === 'DeviceNotRegistered') {
        console.log(`DeviceNotRegistered for user ${recipientUserId}. Cleaning up token.`);
        await removePushToken(recipientUserId);
        return res.status(200).json({ message: 'Token cleaned up due to DeviceNotRegistered' });
      }
      return res.status(500).json({ error: `Expo Error: ${result.error}` });
    }

    // Increment analytics
    await incrementNotificationsSent();

    return res.status(200).json({ message: 'Notification sent successfully', ticket: result.ticket });
  } catch (error) {
    console.error('Error in sendNotification controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendNotification
};
