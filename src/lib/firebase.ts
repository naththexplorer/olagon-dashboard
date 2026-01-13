import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAj8TWA6UjXGMDaEju4VL9bPn-humWaQ-w",
  authDomain: "olagon-1f71b.firebaseapp.com",
  projectId: "olagon-1f71b",
  storageBucket: "olagon-1f71b.firebasestorage.app",
  messagingSenderId: "183297938240",
  appId: "1:183297938240:web:e90a73fe0ab3c4f5b9a0a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore dan EXPORT
export const db = getFirestore(app);
export const storage = getStorage(app);