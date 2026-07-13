import { apiRequest } from "./api";

export async function sendRoomMessage(roomId, text, replyTo, token) {
  return apiRequest(`/api/rooms/${encodeURIComponent(roomId)}/messages`, {
    method: "POST",
    token,
    body: JSON.stringify({ text, replyTo }),
  });
}
