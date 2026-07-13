import { apiRequest } from "./api";
import { sendBatchNotification } from "./notification";

export const joinRoomByCode = async (inviteCode, userId, token) => {
  if (!inviteCode || !userId)
    throw new Error("Invite code and user ID are required");

  const result = await apiRequest("/api/rooms/join", {
    method: "POST",
    token,
    body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
  });
  notifyJoinedParticipants(result, userId, result.senderName, token);
  return result.roomId;
};

export const joinRoomById = async (roomId, userId, userName, token) => {
  if (!roomId || !userId) throw new Error("Room and user are required");
  const result = await apiRequest("/api/rooms/join", {
    method: "POST",
    token,
    body: JSON.stringify({ roomId }),
  });
  notifyJoinedParticipants(result, userId, result.senderName || userName, token);
  return result.roomId;
};

function notifyJoinedParticipants(result, userId, userName, token) {
  if (!result.joined || !result.participantIds?.length) return;
  sendBatchNotification(
    result.participantIds,
    userId,
    result.roomTitle || "Room",
    `${userName || "Someone"} joined the room!`,
    { type: "room", screen: "room", roomId: result.roomId },
    token,
  );
}
