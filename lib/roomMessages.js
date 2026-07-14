import { apiRequest } from "./api";

export async function sendRoomMessage(roomId, payload, token) {
  return apiRequest(`/api/rooms/${encodeURIComponent(roomId)}/messages`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
