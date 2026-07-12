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

module.exports = {
  getUser,
  getUsersBatch,
  removePushToken,
  incrementNotificationsSent
};
