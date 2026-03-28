// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
 apiKey: "AIzaSyBtdEBC5BAwPoYk_DmDnrXn2Kxs-90qTdk",
  authDomain: "betpro-2f60a.firebaseapp.com",
  projectId: "betpro-2f60a",
  storageBucket: "betpro-2f60a.firebasestorage.app",
  messagingSenderId: "654705922401",
  appId: "1:654705922401:web:ae4cf0d4a033ba2db5f520",
  measurementId: "G-1T3ZCSPW1W"
};

// Initialize
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

export default app;
