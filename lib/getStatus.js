export function getStatus(lastSeen) {
  if (!lastSeen) return "Offline";

  const now = new Date();
  const last = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);

  const diff = (now - last) / 1000;

  if (diff < 60) return "Active now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

  return "Offline";
}
