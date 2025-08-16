import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getStorage } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId

let app = null
let db = null
let auth = null
let analytics = null
let storage = null

if (isFirebaseConfigured) {
  // Initialize Firebase
  app = initializeApp(firebaseConfig)

  // Initialize Firebase services
  db = getFirestore(app)
  auth = getAuth(app)
  analytics = getAnalytics(app)
  storage = getStorage(app)
} else {
  console.warn('Firebase configuration missing. Firebase services disabled.')
}

// Export services (will be null if not configured)
export { db, auth, analytics, storage }

export default app
