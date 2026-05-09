import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD0UmQ8caywKIPAa7b_KNvsMqXhUUAPf7o",
  authDomain: "subscription-management-f8246.firebaseapp.com",
  projectId: "subscription-management-f8246",
  storageBucket: "subscription-management-f8246.firebasestorage.app",
  messagingSenderId: "27585645267",
  appId: "1:27585645267:web:058306094dc33ecf4ea226",
  measurementId: "G-M0S2NDR681"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

export { auth };