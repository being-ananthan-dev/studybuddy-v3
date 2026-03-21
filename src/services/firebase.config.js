import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAyGxb0Xsu-h53STXUBjSmiuPX1mbjSdXc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studybuddy-v3.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://studybuddy-v3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studybuddy-v3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studybuddy-v3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "393178713631",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:393178713631:web:413eda3b7544b2737c0f2a"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const rtdb = getDatabase(app)
