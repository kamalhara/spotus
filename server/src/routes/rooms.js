const express = require('express');
const { createRoom, deleteRoom, joinRoom, sendMessage } = require('../controllers/rooms.controller');
const { verifyClerkToken } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(verifyClerkToken);
router.post('/', createRoom);
router.post('/join', joinRoom);
router.post('/:roomId/messages', sendMessage);
router.delete('/:roomId', deleteRoom);

module.exports = router;
