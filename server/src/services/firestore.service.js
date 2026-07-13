const { db, admin } = require('../config/firebase');

const getUser = async (userId) => {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return null;
  return userDoc.data();
};

const removePushToken = async (userId) => {
  await db.collection('users').doc(userId).set({
    expoPushToken: null,
    pushToken: null
  }, { merge: true });
};

const getUsersBatch = async (userIds) => {
  if (!userIds || userIds.length === 0) return {};
  const refs = userIds.map((id) => db.collection('users').doc(id));
  const docs = await db.getAll(...refs);
  const result = {};
  docs.forEach((doc) => {
    result[doc.id] = doc.exists ? doc.data() : null;
  });
  return result;
};

const incrementNotificationsSent = async (count = 1) => {
  await db.collection('stats').doc('notifications').set({
    notificationsSent: admin.firestore.FieldValue.increment(count)
  }, { merge: true });
};

function distanceInKm(a, b) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = radians(b.latitude - a.latitude);
  const longitudeDelta = radians(b.longitude - a.longitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) *
    Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

const authorizeNotification = async (senderUserId, recipientUserIds, data, recipientData) => {
  if (data.type === 'message') {
    if (!data.chatDocId) return false;
    const chat = await db.collection('chats').doc(data.chatDocId).get();
    if (!chat.exists) return false;
    const participants = chat.data().participants || [];
    return participants.includes(senderUserId) && recipientUserIds.every((id) => participants.includes(id));
  }

  if (!data.roomId) return false;
  const room = await db.collection('rooms').doc(data.roomId).get();
  if (!room.exists) return false;
  const roomData = room.data();
  if (data.type === 'room') {
    const participants = roomData.participants || [];
    return participants.includes(senderUserId) && recipientUserIds.every((id) => participants.includes(id));
  }

  if (data.type === 'nearby_room') {
    if (
      recipientUserIds.length !== 1 ||
      roomData.createdBy !== senderUserId ||
      roomData.visibility !== 'public' ||
      !recipientData
    ) return false;
    const coordinates = [
      roomData.latitude,
      roomData.longitude,
      recipientData.latitude,
      recipientData.longitude,
    ];
    if (!coordinates.every(Number.isFinite)) return false;
    return distanceInKm(roomData, recipientData) <= 2.5;
  }
  return false;
};

module.exports = {
  authorizeNotification,
  getUser,
  getUsersBatch,
  removePushToken,
  incrementNotificationsSent,
};
