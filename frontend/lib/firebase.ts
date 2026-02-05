import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkbwjb8FJRPHX0Gbp10MLGPvJcPdCXlP0",
  authDomain: "narmada-valley-football-club.firebaseapp.com",
  projectId: "narmada-valley-football-club",
  storageBucket: "narmada-valley-football-club.firebasestorage.app",
  messagingSenderId: "969844806672",
  appId: "1:969844806672:web:2a98ccb93bc6c4c51da695",
  measurementId: "G-J0ZHXC08B1"
};

import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Firestore with modern persistence settings
// Long-polling helps when WebChannel is blocked by ad-blockers/firewalls
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true,
});

const storage = getStorage(app);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics blocked, continuing without it');
  }
}

export { app, auth, db, storage, analytics };

// Collection references
export const collections = {
  users: "users",
  players: "players",
  fixtures: "fixtures",
  matches: "matches",
  tickets: "tickets",
  products: "products",
  orders: "orders",
  news: "news",
  memberships: "memberships",
} as const;

export default app;
