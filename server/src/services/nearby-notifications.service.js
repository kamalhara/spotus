const { distanceBetween, geohashQueryBounds } = require('geofire-common');
const { db } = require('../config/firebase');
const {
  getUsersBatch,
  incrementNotificationsSent,
  removePushToken,
} = require('./firestore.service');
const { sendBatchPushNotifications } = require('./expo.service');

const MAX_NEARBY_RECIPIENTS = 100;

async function notifyNearbyUsers(roomId, creatorId, radiusKm = 2) {
  const roomSnapshot = await db.collection('rooms').doc(roomId).get();
  if (!roomSnapshot.exists) return;
  const room = roomSnapshot.data();
  if (room.visibility !== 'public') return;

  const center = [room.latitude, room.longitude];
  const bounds = geohashQueryBounds(center, radiusKm * 1000);
  const snapshots = await Promise.all(
    bounds.map(([start, end]) => db
      .collection('users')
      .orderBy('geohash')
      .startAt(start)
      .endAt(end)
      .get()),
  );

  const recipientIds = [];
  const seen = new Set([creatorId]);
  for (const snapshot of snapshots) {
    for (const userDocument of snapshot.docs) {
      if (recipientIds.length >= MAX_NEARBY_RECIPIENTS) break;
      if (seen.has(userDocument.id)) continue;
      seen.add(userDocument.id);
      const user = userDocument.data();
      if (!Number.isFinite(user.latitude) || !Number.isFinite(user.longitude)) continue;
      if (distanceBetween(center, [user.latitude, user.longitude]) <= radiusKm) {
        recipientIds.push(userDocument.id);
      }
    }
  }
  if (recipientIds.length === 0) return;

  const users = await getUsersBatch(recipientIds);
  const tokenToUser = new Map();
  const messages = recipientIds.flatMap((userId) => {
    const user = users[userId];
    const pushToken = user?.expoPushToken || user?.pushToken;
    if (
      !pushToken ||
      user.notificationsEnabled === false ||
      user.nearbyRoomNotifications === false ||
      user.isOnline === true
    ) return [];
    tokenToUser.set(pushToken, userId);
    return [{
      pushToken,
      title: 'A room just opened nearby',
      body: `“${room.title}” is live within ${radiusKm} km.`,
      data: { type: 'nearby_room', screen: 'room', roomId, senderId: creatorId },
      sound: null,
    }];
  });
  if (messages.length === 0) return;

  const results = await sendBatchPushNotifications(messages);
  let sent = 0;
  for (const result of results) {
    if (result.success) sent += 1;
    if (result.error === 'DeviceNotRegistered' || result.error === 'InvalidPushToken') {
      const userId = tokenToUser.get(result.pushToken);
      if (userId) removePushToken(userId).catch(() => {});
    }
  }
  if (sent > 0) await incrementNotificationsSent(sent);
}

module.exports = { notifyNearbyUsers };
