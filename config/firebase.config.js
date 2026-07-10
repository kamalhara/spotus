// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
 apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
 authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
 projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
 storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
 messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
 measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
let auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
