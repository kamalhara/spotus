import { logger, schedules } from "@trigger.dev/sdk/v3";
import { v2 as cloudinary } from "cloudinary";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getDb } from "./firebaseAdmin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteImageWithRetries(
  publicId: string,
  retries = 3,
): Promise<boolean> {
  if (!publicId) return true;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === "ok" || result.result === "not found") {
        return true;
      }
      logger.warn(
        `Cloudinary deletion returned non-ok result for ${publicId}`,
        { result },
      );
    } catch (error) {
      logger.warn(`Attempt ${i + 1} failed to delete image ${publicId}`, {
        error,
      });
    }
  }
  return false;
}

function extractLegacyPublicId(url: string): string | null {
  if (!url) return null;
  // Match anything after /upload/ (and optional v<timestamp>/) up to the file extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z]+$/);
  if (match && match[1]) {
    return match[1];
  }
  // Fallback basic extraction
  const parts = url.split("/");
  const filePart = parts[parts.length - 1];
  return filePart ? filePart.split(".")[0] : null;
}

export const cleanupExpiredRooms = schedules.task({
  id: "cleanup-expired-rooms",
  // Every 5 minutes
  cron: "*/5 * * * *",
  queue: {
    concurrencyLimit: 1, // Ensure only one cleanup runs at a time
  },
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async () => {
    logger.log("🚀 Cleanup started");

    try {
      const db = getDb();
      logger.log("Firebase connected");

      const now = Timestamp.now();
      const roomsSnapshot = await db
        .collection("rooms")
        .where("expiresAt", "<=", now)
        .get();

      const roomsCount = roomsSnapshot.size;
      logger.log(`Found ${roomsCount} expired rooms`);

      let stats = {
        roomsDeleted: 0,
        messagesDeleted: 0,
        imagesDeleted: 0,
        failedRooms: 0,
        startTime: Date.now(),
      };

      for (const roomDoc of roomsSnapshot.docs) {
        const roomId = roomDoc.id;
        const roomData = roomDoc.data();

        logger.info("Processing expired room", {
          roomId,
          title: roomData.title,
        });

        try {
          const messagesSnapshot = await db
            .collection("rooms")
            .doc(roomId)
            .collection("messages")
            .get();

          let messagesFailed = false;
          let deletedMessagesCount = 0;
          let deletedImagesCount = 0;

          // Process images first (failures here do NOT stop message/room deletion)
          for (const msgDoc of messagesSnapshot.docs) {
            const msgData = msgDoc.data();
            let publicId = msgData.cloudinaryPublicId;

            // Fallback for legacy images
            if (!publicId && msgData.imageUrl) {
              publicId = extractLegacyPublicId(msgData.imageUrl);
            }

            if (publicId) {
              const deleted = await deleteImageWithRetries(publicId);
              if (deleted) {
                deletedImagesCount++;
              } else {
                logger.error(`Failed to delete Cloudinary image: ${publicId}`);
              }
            }
          }

          // Delete messages in batches of 500 (Firestore limit)
          if (messagesSnapshot.size > 0) {
            let batches: FirebaseFirestore.WriteBatch[] = [];
            let currentBatch = db.batch();
            let opCount = 0;

            messagesSnapshot.docs.forEach((doc) => {
              currentBatch.delete(doc.ref);
              opCount++;
              if (opCount === 500) {
                batches.push(currentBatch);
                currentBatch = db.batch();
                opCount = 0;
              }
            });

            if (opCount > 0) {
              batches.push(currentBatch);
            }

            try {
              for (const batch of batches) {
                await batch.commit();
              }
              deletedMessagesCount += messagesSnapshot.size;
            } catch (error) {
              logger.error(`Failed to delete messages for room ${roomId}`, {
                error,
              });
              messagesFailed = true;
            }
          }

          // Only delete the room if ALL messages were successfully deleted
          // OR if there were no messages to begin with (orphaned room)
          if (!messagesFailed) {
            await db.collection("rooms").doc(roomId).delete();
            stats.roomsDeleted++;
            logger.info("Room Deleted", {
              roomId,
              title: roomData.title,
              messagesDeleted: deletedMessagesCount,
              imagesDeleted: deletedImagesCount,
              status: "Success",
            });
          } else {
            stats.failedRooms++;
            logger.error("Room Deletion Skipped (Message deletion failed)", {
              roomId,
              title: roomData.title,
              status: "Failed",
            });
          }

          stats.messagesDeleted += deletedMessagesCount;
          stats.imagesDeleted += deletedImagesCount;
        } catch (roomError) {
          stats.failedRooms++;
          logger.error(`Failed to process room ${roomId}`, {
            error: roomError,
          });
        }
      }

      const durationMs = Date.now() - stats.startTime;

      // Soft-delete metrics to Firestore
      try {
        await db
          .collection("stats")
          .doc("cleanup")
          .set(
            {
              lastRun: FieldValue.serverTimestamp(),
              roomsDeleted: FieldValue.increment(stats.roomsDeleted),
              messagesDeleted: FieldValue.increment(stats.messagesDeleted),
              imagesDeleted: FieldValue.increment(stats.imagesDeleted),
              failedRooms: FieldValue.increment(stats.failedRooms),
              lastDurationMs: durationMs,
            },
            { merge: true },
          );
      } catch (statsError) {
        logger.error("Failed to write stats to Firestore", {
          error: statsError,
        });
      }

      logger.info("Cleanup Summary", {
        expiredRoomsFound: roomsCount,
        roomsDeleted: stats.roomsDeleted,
        messagesDeleted: stats.messagesDeleted,
        imagesDeleted: stats.imagesDeleted,
        failures: stats.failedRooms,
        executionTimeMs: durationMs,
      });

      logger.log("✅ Cleanup finished");
    } catch (error) {
      logger.error("Error during cleanup", { error });
      throw error;
    }
  },
});
