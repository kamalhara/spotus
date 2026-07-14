const roomsService = require('../services/rooms.service');
const { consumeRateLimit } = require('../services/rate-limit.service');
const { createRoomPayload, documentId, inviteCode, messagePayload } = require('../utils/validation');
const { notifyNearbyUsers } = require('../services/nearby-notifications.service');

async function createRoom(req, res, next) {
  try {
    await consumeRateLimit(req.userId, 'create-room', { limit: 5, windowMs: 10 * 60 * 1000 });
    const result = await roomsService.createRoom(req.userId, createRoomPayload(req.body));
    res.status(201).json(result);
    notifyNearbyUsers(result.roomId, req.userId).catch((error) => {
      console.error('Nearby notification fanout failed', {
        roomId: result.roomId,
        message: error.message,
      });
    });
  } catch (error) {
    next(error);
  }
}

async function joinRoom(req, res, next) {
  try {
    await consumeRateLimit(req.userId, 'join-room', { limit: 30, windowMs: 60 * 1000 });
    const input = req.body?.inviteCode
      ? { inviteCode: inviteCode(req.body.inviteCode) }
      : { roomId: documentId(req.body?.roomId) };
    const result = await roomsService.joinRoom(req.userId, input);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteRoom(req, res, next) {
  try {
    await consumeRateLimit(req.userId, 'delete-room', { limit: 10, windowMs: 60 * 60 * 1000 });
    await roomsService.deleteRoom(req.userId, documentId(req.params.roomId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    await consumeRateLimit(req.userId, 'send-room-message', { limit: 120, windowMs: 60 * 1000 });
    const result = await roomsService.sendMessage(
      req.userId,
      documentId(req.params.roomId),
      messagePayload(req.body),
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { createRoom, deleteRoom, joinRoom, sendMessage };
