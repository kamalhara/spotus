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

const incrementNotificationsSent = async () => {
  await db.collection('stats').doc('notifications').set({
    notificationsSent: admin.firestore.FieldValue.increment(1)
  }, { merge: true });
};

module.exports = {
  getUser,
  removePushToken,
  incrementNotificationsSent
};
