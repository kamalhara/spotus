const {
  authorizeNotification,
  getUser,
  getUsersBatch,
  removePushToken,
  incrementNotificationsSent,
} = require('../services/firestore.service');
const { sendPushNotification, sendBatchPushNotifications } = require('../services/expo.service');
const { consumeRateLimit } = require('../services/rate-limit.service');
const { notificationPayload } = require('../utils/validation');

const sendNotification = async (req, res, next) => {
  try {
    await consumeRateLimit(req.userId, 'send-notification', { limit: 60, windowMs: 10 * 60 * 1000 });
    const { recipientUserId, title, body, data } = notificationPayload(req.body);
    
    // Always trust the authenticated user's ID as the sender, ignoring client-provided senderUserId
    const senderUserId = req.userId;

    // Prevent self-notifications
    if (recipientUserId === senderUserId) {
      return res.status(200).json({ message: 'Self-notification skipped' });
    }

    // Fetch the recipient's preferences
    const recipientData = await getUser(recipientUserId);
    if (!recipientData) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    if (!await authorizeNotification(senderUserId, [recipientUserId], data, recipientData)) {
      return res.status(403).json({ error: 'Notification is not authorized' });
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

    // Increment analytics (fire-and-forget)
    incrementNotificationsSent().catch((err) =>
      console.error('Failed to increment notifications sent:', err)
    );

    return res.status(200).json({ message: 'Notification sent successfully', ticket: result.ticket });
  } catch (error) {
    console.error('Error in sendNotification controller:', error);
    return next(error);
  }
};

/**
 * Batch notification controller.
 * Accepts multiple recipient user IDs and sends notifications in a single Expo batch.
 */
const sendBatchNotification = async (req, res, next) => {
  try {
    await consumeRateLimit(req.userId, 'send-batch-notification', { limit: 20, windowMs: 10 * 60 * 1000 });
    const { recipientUserIds, title, body, data } = notificationPayload(req.body, { batch: true });

    // Always trust the authenticated user's ID as the sender
    const senderUserId = req.userId;

    // Fetch all recipient users in a single batch Firestore read
    const usersMap = await getUsersBatch(recipientUserIds);
    if (!await authorizeNotification(senderUserId, recipientUserIds, data)) {
      return res.status(403).json({ error: 'Notification is not authorized' });
    }

    const messagesToSend = [];
    const tokenToUserIdMap = {};
    let skipped = 0;

    for (const recipientUserId of recipientUserIds) {
      // Prevent self-notifications
      if (recipientUserId === senderUserId) {
        skipped++;
        continue;
      }

      const recipientData = usersMap[recipientUserId];
      if (!recipientData) {
        skipped++;
        continue;
      }

      const pushToken = recipientData.expoPushToken || recipientData.pushToken;
      if (!pushToken) {
        skipped++;
        continue;
      }

      // Respect notification preferences
      if (recipientData.notificationsEnabled === false) {
        skipped++;
        continue;
      }
      if (data.type === 'message' && recipientData.messageNotifications === false) {
        skipped++;
        continue;
      }
      if (data.type === 'room' && recipientData.roomNotifications === false) {
        skipped++;
        continue;
      }
      if (data.type === 'nearby_room' && recipientData.nearbyRoomNotifications === false) {
        skipped++;
        continue;
      }

      // Skip if online
      if (recipientData.isOnline === true) {
        skipped++;
        continue;
      }

      const sound = data.type === 'nearby_room' ? null : 'default';
      messagesToSend.push({
        pushToken,
        title,
        body,
        data: { ...data, senderId: senderUserId },
        sound,
      });
      tokenToUserIdMap[pushToken] = recipientUserId;
    }

    if (messagesToSend.length === 0) {
      return res.status(200).json({ sent: 0, skipped, failed: 0 });
    }

    // Send all valid push notifications in a single Expo batch call
    const results = await sendBatchPushNotifications(messagesToSend);

    let sent = 0;
    let failed = 0;

    // Handle DeviceNotRegistered errors per-ticket
    for (const result of results) {
      if (result.success) {
        sent++;
      } else {
        failed++;
        if (result.error === 'DeviceNotRegistered') {
          const userId = tokenToUserIdMap[result.pushToken];
          if (userId) {
            console.log(`DeviceNotRegistered for user ${userId}. Cleaning up token.`);
            removePushToken(userId).catch((err) =>
              console.error(`Failed to remove push token for ${userId}:`, err)
            );
          }
        }
      }
    }

    // Fire-and-forget the analytics increment
    if (sent > 0) {
      incrementNotificationsSent(sent).catch((err) =>
        console.error('Failed to increment notifications sent:', err)
      );
    }

    return res.status(200).json({ sent, skipped, failed });
  } catch (error) {
    console.error('Error in sendBatchNotification controller:', error);
    return next(error);
  }
};

module.exports = {
  sendNotification,
  sendBatchNotification
};
