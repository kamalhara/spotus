import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@trigger.dev/sdk/v3';

export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!serviceAccountStr) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
      }

      const serviceAccount = JSON.parse(serviceAccountStr);

      initializeApp({
        credential: cert(serviceAccount)
      });
    } catch (error) {
      logger.error("Failed to initialize Firebase Admin", { error });
      throw error;
    }
  }
}

export function getDb() {
  getFirebaseAdmin();
  return getFirestore();
}
