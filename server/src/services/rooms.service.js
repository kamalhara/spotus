const crypto = require('crypto');
const { db, admin } = require('../config/firebase');
const { ApiError } = require('../utils/api-error');

const GEOHASH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

function geohashForLocation(latitude, longitude, precision = 10) {
  let latitudeRange = [-90, 90];
  let longitudeRange = [-180, 180];
  let hash = '';
  let hashValue = 0;
  let bits = 0;
  let evenBit = true;

  while (hash.length < precision) {
    const range = evenBit ? longitudeRange : latitudeRange;
    const value = evenBit ? longitude : latitude;
    const midpoint = (range[0] + range[1]) / 2;
    hashValue = (hashValue << 1) | (value >= midpoint ? 1 : 0);
    if (value >= midpoint) range[0] = midpoint;
    else range[1] = midpoint;
    evenBit = !evenBit;
    bits += 1;

    if (bits === 5) {
      hash += GEOHASH_BASE32[hashValue];
      bits = 0;
      hashValue = 0;
    }
  }
  return hash;
}

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function destroyCloudinaryImage(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!publicId || !cloudName || !apiKey || !apiSecret) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');
  const body = new URLSearchParams({ api_key: apiKey, public_id: publicId, signature, timestamp: String(timestamp) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body,
  });
  if (!response.ok) throw new Error(`Cloudinary cleanup failed with ${response.status}`);
}

async function cleanupRoomImages(roomRef) {
  if (!process.env.CLOUDINARY_API_SECRET) return;
  const messages = await roomRef.collection('messages').select('cloudinaryPublicId').get();
  const publicIds = [...new Set(messages.docs.map((doc) => doc.data().cloudinaryPublicId).filter(Boolean))];
  for (let index = 0; index < publicIds.length; index += 10) {
    const batch = publicIds.slice(index, index + 10);
    const results = await Promise.allSettled(batch.map((publicId) => destroyCloudinaryImage(publicId)));
    results.forEach((result, resultIndex) => {
      if (result.status === 'rejected') {
        console.error('Cloudinary image cleanup failed', {
          publicId: batch[resultIndex],
          message: result.reason?.message,
        });
      }
    });
  }
}

async function createRoom(userId, payload) {
  const inviteCode = generateInviteCode();
  const roomRef = db.collection('rooms').doc();
  const now = admin.firestore.Timestamp.now();
  const expiresAt = admin.firestore.Timestamp.fromMillis(
    now.toMillis() + payload.duration * 60 * 60 * 1000,
  );
  const room = {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    createdBy: userId,
    participants: [userId],
    participantCount: 1,
    messageCount: 0,
    visibility: payload.showOnMap ? 'public' : 'ghost',
    showOnMap: payload.showOnMap,
    inviteCode,
    geohash: geohashForLocation(payload.latitude, payload.longitude),
    latitude: payload.latitude,
    longitude: payload.longitude,
    locationAccuracy: payload.accuracy,
    locationCapturedAt: admin.firestore.Timestamp.fromMillis(payload.capturedAt),
    expiresAt,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await roomRef.create(room);
  return { roomId: roomRef.id, inviteCode, visibility: room.visibility };
}

async function joinRoom(userId, { roomId, inviteCode }) {
  let roomRef;
  if (roomId) {
    roomRef = db.collection('rooms').doc(roomId);
  } else {
    const snapshot = await db
      .collection('rooms')
      .where('inviteCode', '==', inviteCode)
      .limit(1)
      .get();
    if (snapshot.empty) {
      throw new ApiError(404, 'ROOM_NOT_FOUND', 'Room not found. Check the code and try again.');
    }
    roomRef = snapshot.docs[0].ref;
  }

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    const userSnapshot = await transaction.get(db.collection('users').doc(userId));
    if (!snapshot.exists) {
      throw new ApiError(404, 'ROOM_NOT_FOUND', 'This room no longer exists.');
    }

    const room = snapshot.data();
    if (room.isActive === false || room.expiresAt?.toMillis?.() <= Date.now()) {
      throw new ApiError(410, 'ROOM_EXPIRED', 'This room has expired.');
    }
    if (room.bannedUsers?.includes(userId)) {
      throw new ApiError(403, 'ROOM_ACCESS_DENIED', 'You cannot join this room.');
    }

    const participants = Array.isArray(room.participants) ? room.participants : [];
    const joined = !participants.includes(userId);
    if (joined) {
      transaction.update(roomRef, {
        participants: admin.firestore.FieldValue.arrayUnion(userId),
        participantCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      roomId: snapshot.id,
      joined,
      roomTitle: room.title || 'Room',
      participantIds: participants.filter((id) => id !== userId).slice(0, 100),
      senderName: userSnapshot.data()?.userName || 'Someone',
    };
  });
}

async function deleteRoom(userId, roomId) {
  const roomRef = db.collection('rooms').doc(roomId);
  const snapshot = await roomRef.get();
  if (!snapshot.exists) {
    throw new ApiError(404, 'ROOM_NOT_FOUND', 'This room no longer exists.');
  }
  if (snapshot.data().createdBy !== userId) {
    throw new ApiError(403, 'ROOM_ACCESS_DENIED', 'Only the host can delete this room.');
  }

  await cleanupRoomImages(roomRef);
  await db.recursiveDelete(roomRef);
}

async function sendMessage(userId, roomId, payload) {
  const roomRef = db.collection('rooms').doc(roomId);
  const userRef = db.collection('users').doc(userId);
  const messageRef = payload.clientMessageId
    ? roomRef.collection('messages').doc(payload.clientMessageId)
    : roomRef.collection('messages').doc();

  return db.runTransaction(async (transaction) => {
    const [roomSnapshot, userSnapshot, messageSnapshot] = await Promise.all([
      transaction.get(roomRef),
      transaction.get(userRef),
      transaction.get(messageRef),
    ]);
    if (!roomSnapshot.exists) {
      throw new ApiError(404, 'ROOM_NOT_FOUND', 'This room no longer exists.');
    }
    const room = roomSnapshot.data();
    if (messageSnapshot.exists) {
      if (messageSnapshot.data().senderId !== userId) {
        throw new ApiError(409, 'MESSAGE_ID_CONFLICT', 'Message could not be sent.');
      }
      return {
        messageId: messageRef.id,
        roomTitle: room.title || 'Room',
        participantIds: room.participants.filter((id) => id !== userId).slice(0, 100),
        senderName: userSnapshot.data()?.userName || 'SpotUs member',
        alreadyCreated: true,
      };
    }
    if (room.isActive === false || room.expiresAt?.toMillis?.() <= Date.now()) {
      throw new ApiError(410, 'ROOM_EXPIRED', 'This room has expired.');
    }
    if (!room.participants?.includes(userId)) {
      throw new ApiError(403, 'ROOM_ACCESS_DENIED', 'Join the room before sending a message.');
    }

    const user = userSnapshot.data() || {};
    const now = admin.firestore.FieldValue.serverTimestamp();
    const isImage = payload.type === 'image';
    const message = {
      ...(isImage
        ? {
            type: 'image',
            imageUrl: payload.imageUrl,
            cloudinaryPublicId: payload.cloudinaryPublicId,
          }
        : { text: payload.text }),
      senderId: userId,
      user: user.userName || 'SpotUs member',
      profilePic: user.profilePic || null,
      createdAt: now,
      seenBy: [userId],
      reactions: {},
      ...(!isImage && payload.replyTo ? { replyTo: payload.replyTo } : {}),
    };
    transaction.create(messageRef, message);
    transaction.update(roomRef, {
      lastMessage: isImage ? '📷 Photo' : payload.text,
      lastMessageAt: now,
      lastMessageSenderId: userId,
      lastMessageSeenBy: [userId],
      messageCount: admin.firestore.FieldValue.increment(1),
      updatedAt: now,
    });
    return {
      messageId: messageRef.id,
      roomTitle: room.title || 'Room',
      participantIds: room.participants.filter((id) => id !== userId).slice(0, 100),
      senderName: message.user,
      alreadyCreated: false,
    };
  });
}

module.exports = { createRoom, deleteRoom, joinRoom, sendMessage };
