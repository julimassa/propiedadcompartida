import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAI6238G2AqDhJOrJVgzLI27nunNz-U1Wc",
  authDomain: "casa-familiar1.firebaseapp.com",
  databaseURL: "https://casa-familiar1-default-rtdb.firebaseio.com",
  projectId: "casa-familiar1",
  storageBucket: "casa-familiar1.firebasestorage.app",
  messagingSenderId: "653506429232",
  appId: "1:653506429232:web:34960462b5c478656a08f5",
  measurementId: "G-JLJ9XL3JVH"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
