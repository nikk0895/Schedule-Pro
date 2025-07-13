// src/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBazAkOBS-ELQ8cSjUDB4T51B6AHPEAzE0",
  authDomain: "schedule-pro-ce55d.firebaseapp.com",
  projectId: "schedule-pro-ce55d",
  storageBucket: "schedule-pro-ce55d.appspot.com",
  messagingSenderId: "1080429164984",
  appId: "1:1080429164984:web:5d52c41ab9563fed85f74d",
  measurementId: "G-ZPW6NVEKDH"
};

// ✅ Prevent re-initialization in Next.js hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Auth instance
export const auth = getAuth(app);

// ✅ Firestore instance
export const db = getFirestore(app);

// ✅ Conditionally initialize Analytics (browser only)
let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

// ✅ Export all
export { app, analytics };
