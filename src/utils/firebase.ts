import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBazAkOBS-ELQ8cSjUDB4T51B6AHPEAzE0",
  authDomain: "schedule-pro-ce55d.firebaseapp.com",
  projectId: "schedule-pro-ce55d",
  storageBucket: "schedule-pro-ce55d.appspot.com", // ✅ corrected `.app` to `.appspot.com`
  messagingSenderId: "1080429164984",
  appId: "1:1080429164984:web:5d52c41ab9563fed85f74d",
  measurementId: "G-ZPW6NVEKDH"
};

// ✅ Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Export Auth instance
export const auth = getAuth(app);

// ✅ Conditionally initialize Analytics only if supported (browser only)
let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

export { app, analytics };
export const db = getFirestore(app);
