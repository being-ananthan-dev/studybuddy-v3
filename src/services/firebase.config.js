import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAyGxb0Xsu-h53STXUBjSmiuPX1mbjSdXc",
  authDomain: "studybuddy-v3.firebaseapp.com",
  databaseURL: "https://studybuddy-v3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "studybuddy-v3",
  storageBucket: "studybuddy-v3.firebasestorage.app",
  messagingSenderId: "393178713631",
  appId: "1:393178713631:web:413eda3b7544b2737c0f2a",
  measurementId: "G-3TFQ0V3R2R"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const rtdb = getDatabase(app)
