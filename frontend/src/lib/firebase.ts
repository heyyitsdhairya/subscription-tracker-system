import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YoUrApIkEyUsEd",
  authDomain: "subscription-management.firebaseapp.com",
  projectId: "subscription-management",
  storageBucket: "subscription-management.firebasestorage.app",
  messagingSenderId: "1234567",
  appId: "YOURAPPID",
  measurementId: "yOuRmEaSuReMeNtId"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

export { auth };
