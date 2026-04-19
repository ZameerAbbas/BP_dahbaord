// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBKMzc8wbuHzcV60PoAo3mslll-WHxqoHU",
  authDomain: "bprolive-2a75e.firebaseapp.com",
  projectId: "bprolive-2a75e",
  storageBucket: "bprolive-2a75e.firebasestorage.app",
  messagingSenderId: "468902535954",
  appId: "1:468902535954:web:e42e850c15aef8048009cb",
  measurementId: "G-V5RD85GFYS"
};

// Initialize
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

export default app;
