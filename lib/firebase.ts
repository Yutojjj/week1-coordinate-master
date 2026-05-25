import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoKey",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "keeney-programming",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456:web:abc123",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable emulators in development (optional)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  } catch (e) {
    // Already connected
  }
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch (e) {
    // Already connected
  }
}
