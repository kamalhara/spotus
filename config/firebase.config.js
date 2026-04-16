// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHxYcpoKfcqYh3ZZarMIvmvXbqTicPt8c",
  authDomain: "spotus-23cbf.firebaseapp.com",
  projectId: "spotus-23cbf",
  storageBucket: "spotus-23cbf.firebasestorage.app",
  messagingSenderId: "924885383096",
  appId: "1:924885383096:web:76548a323dc1ab5de8814d",
  measurementId: "G-Q6N2PYXLXD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
