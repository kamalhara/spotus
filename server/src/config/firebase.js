const {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const {
  FieldValue,
  Timestamp,
  getFirestore,
} = require('firebase-admin/firestore');

let app = getApps()[0];

if (!app) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountStr) {
      console.warn('FIREBASE_SERVICE_ACCOUNT is not set. Trying default credentials...');
      app = initializeApp({ credential: applicationDefault() });
    } else {
      app = initializeApp({
        credential: cert(JSON.parse(serviceAccountStr)),
      });
    }
    console.log('Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }
}

const db = getFirestore(app);
const auth = getAuth(app);

// Compatibility surface for services that use timestamp and transform helpers.
const admin = {
  firestore: {
    FieldValue,
    Timestamp,
  },
};

module.exports = { admin, app, auth, db };
