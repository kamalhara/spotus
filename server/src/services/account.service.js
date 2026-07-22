const { createClerkClient } = require('@clerk/express');
const { db, admin } = require('../config/firebase');
const { deleteRoom } = require('./rooms.service');

async function deleteAccount(userId) {
  const [hostedRooms, joinedRooms, directChats, authoredMessages] = await Promise.all([
    db.collection('rooms').where('createdBy', '==', userId).get(),
    db.collection('rooms').where('participants', 'array-contains', userId).get(),
    db.collection('chats').where('participants', 'array-contains', userId).get(),
    db.collectionGroup('messages').where('senderId', '==', userId).get(),
  ]);

  const hostedIds = new Set(hostedRooms.docs.map((snapshot) => snapshot.id));
  for (const snapshot of hostedRooms.docs) {
    await deleteRoom(userId, snapshot.id);
  }

  const writer = db.bulkWriter();
  joinedRooms.docs.forEach((snapshot) => {
    if (hostedIds.has(snapshot.id)) return;
    writer.update(snapshot.ref, {
      participants: admin.firestore.FieldValue.arrayRemove(userId),
      participantCount: admin.firestore.FieldValue.increment(-1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  authoredMessages.docs.forEach((snapshot) => {
    // Hosted room messages and direct chats are deleted separately. Messages
    // left in other rooms are retained for conversation continuity, anonymized.
    const path = snapshot.ref.path;
    const isHostedRoomMessage = [...hostedIds].some((roomId) => path.startsWith(`rooms/${roomId}/`));
    const isDirectMessage = path.startsWith('chats/');
    if (!isHostedRoomMessage && !isDirectMessage) {
      writer.update(snapshot.ref, { user: 'Deleted user', profilePic: null });
    }
  });

  await writer.close();

  for (const snapshot of directChats.docs) {
    await db.recursiveDelete(snapshot.ref);
  }

  await db.collection('users').doc(userId).delete();

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  await clerk.users.deleteUser(userId);
}

module.exports = { deleteAccount };
