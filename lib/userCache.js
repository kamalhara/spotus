import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase.config";

const userCache = new Map();
const pendingRequests = new Map();

let batchTimeout = null;

const flushBatch = async () => {
  if (pendingRequests.size === 0) return;

  const currentBatch = new Map(pendingRequests);
  pendingRequests.clear();

  const userIdsToFetch = Array.from(currentBatch.keys());
  
  // Firestore 'in' query supports up to 30 elements
  const chunkSize = 30;
  const chunks = [];
  for (let i = 0; i < userIdsToFetch.length; i += chunkSize) {
    chunks.push(userIdsToFetch.slice(i, i + chunkSize));
  }

  try {
    const fetchPromises = chunks.map(async (chunk) => {
      const q = query(
        collection(db, "users"),
        where(documentId(), "in", chunk)
      );
      const snap = await getDocs(q);
      snap.forEach((doc) => {
        userCache.set(doc.id, doc.data());
      });
    });

    await Promise.all(fetchPromises);

    // Resolve all promises
    currentBatch.forEach((resolvers, userId) => {
      const data = userCache.get(userId) || null; // null if user not found
      resolvers.forEach((resolve) => resolve(data));
    });
  } catch (err) {
    console.error("Error in fetchUserBatch:", err);
    // Resolve with null so UI doesn't hang
    currentBatch.forEach((resolvers) => {
      resolvers.forEach((resolve) => resolve(null));
    });
  }
};

/**
 * Fetches user data, utilizing a batcher and memory cache to prevent duplicate requests.
 * @param {string} userId - The user document ID to fetch
 * @returns {Promise<Object|null>} - The user data, or null if not found
 */
export const fetchUserBatch = (userId) => {
  if (!userId) return Promise.resolve(null);

  // Return immediately if cached
  if (userCache.has(userId)) {
    return Promise.resolve(userCache.get(userId));
  }

  // Queue request
  return new Promise((resolve) => {
    if (!pendingRequests.has(userId)) {
      pendingRequests.set(userId, []);
    }
    pendingRequests.get(userId).push(resolve);

    if (!batchTimeout) {
      batchTimeout = setTimeout(() => {
        batchTimeout = null;
        flushBatch();
      }, 50); // 50ms batching window
    }
  });
};
