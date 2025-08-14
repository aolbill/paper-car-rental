# 🔥 Firebase Integration Guide

This guide explains how to integrate Firebase alongside or instead of Supabase for your car rental platform.

## 🤔 Firebase vs Supabase: Which to Choose?

### Current Setup: Supabase
Your project is currently configured with Supabase, which provides:
- ✅ PostgreSQL database
- ✅ Real-time subscriptions
- ✅ Authentication
- ✅ Row Level Security
- ✅ RESTful API
- ✅ File storage

### Firebase Capabilities
Firebase offers:
- ✅ Firestore NoSQL database
- ✅ Real-time listeners
- ✅ Authentication
- ✅ Security rules
- ✅ Cloud Functions
- ✅ File storage
- ✅ Push notifications
- ✅ Analytics
- ✅ Crashlytics

## 🎯 Recommended Approaches

### Option 1: Hybrid Approach (Recommended)
Use both Firebase and Supabase for different purposes:

**Supabase for:**
- Main application data (cars, bookings, users)
- Complex queries and relationships
- Admin dashboard analytics

**Firebase for:**
- Real-time messaging/chat
- Push notifications
- Mobile app analytics
- File storage (car images)
- Cloud functions for background tasks

### Option 2: Full Firebase Migration
Replace Supabase entirely with Firebase (more complex migration)

### Option 3: Keep Supabase + Firebase Auth
Use Firebase only for authentication and keep Supabase for everything else

## 🚀 Option 1: Hybrid Setup (Recommended)

### Step 1: Install Firebase SDK

```bash
npm install firebase
npm install @firebase/app
npm install @firebase/auth
npm install @firebase/firestore
npm install @firebase/storage
npm install @firebase/messaging
npm install @firebase/analytics
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: "car-rental-kenya"
4. Enable Google Analytics (recommended)
5. Create project

### Step 3: Configure Firebase Services

#### Enable Authentication
```
Authentication > Sign-in method > Enable:
- Email/Password
- Google (optional)
- Phone (for Kenyan market)
```

#### Enable Firestore
```
Firestore Database > Create database
- Start in test mode (configure security later)
- Choose region: us-central1 (or closest to Kenya)
```

#### Enable Storage
```
Storage > Get started
- Start in test mode
- Choose region: us-central1
```

#### Enable Cloud Messaging
```
Cloud Messaging > Generate key pair
```

### Step 4: Firebase Configuration

Create Firebase config file:

```javascript
// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging, isSupported } from 'firebase/messaging'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

// Initialize messaging if supported
let messaging = null
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app)
  }
})

export { messaging }
export default app
```

### Step 5: Environment Variables

Add to your `.env` file:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Step 6: Firebase Services Implementation

#### Real-time Messaging Service
```javascript
// src/services/firebaseMessagingService.js
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  getDocs 
} from 'firebase/firestore'
import { db } from '../lib/firebase'

class FirebaseMessagingService {
  constructor() {
    this.unsubscribes = new Map()
  }

  // Send message
  async sendMessage(conversationId, senderId, content) {
    try {
      const messageRef = await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId,
        content,
        timestamp: new Date(),
        read: false
      })
      
      return { id: messageRef.id, success: true }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false, error }
    }
  }

  // Subscribe to messages
  subscribeToMessages(conversationId, callback) {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(messages)
    })

    this.unsubscribes.set(conversationId, unsubscribe)
    return unsubscribe
  }

  // Get conversations
  async getConversations(userId) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting conversations:', error)
      return []
    }
  }

  // Cleanup subscriptions
  cleanup() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe())
    this.unsubscribes.clear()
  }
}

export default new FirebaseMessagingService()
```

#### Push Notifications Service
```javascript
// src/services/firebasePushService.js
import { messaging } from '../lib/firebase'
import { getToken, onMessage } from 'firebase/messaging'

class FirebasePushService {
  constructor() {
    this.vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY
  }

  // Request notification permission and get token
  async getNotificationToken() {
    try {
      if (!messaging) {
        console.warn('Firebase messaging not supported')
        return null
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.warn('Notification permission not granted')
        return null
      }

      const token = await getToken(messaging, {
        vapidKey: this.vapidKey
      })

      console.log('FCM Token:', token)
      return token
    } catch (error) {
      console.error('Error getting notification token:', error)
      return null
    }
  }

  // Listen for foreground messages
  setupForegroundListener(callback) {
    if (!messaging) return () => {}

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      
      // Show custom notification
      callback({
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data
      })
    })

    return unsubscribe
  }

  // Send notification to server for processing
  async sendNotificationToServer(token, title, body, data = {}) {
    try {
      // This would be sent to your backend to send the notification
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          notification: { title, body },
          data
        })
      })

      return await response.json()
    } catch (error) {
      console.error('Error sending notification:', error)
      return { success: false, error }
    }
  }
}

export default new FirebasePushService()
```

#### File Storage Service
```javascript
// src/services/firebaseStorageService.js
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { storage } from '../lib/firebase'

class FirebaseStorageService {
  // Upload car image
  async uploadCarImage(file, carId) {
    try {
      const timestamp = Date.now()
      const fileName = `cars/${carId}/${timestamp}_${file.name}`
      const storageRef = ref(storage, fileName)
      
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return { url: downloadURL, path: fileName, success: true }
    } catch (error) {
      console.error('Error uploading image:', error)
      return { success: false, error }
    }
  }

  // Upload user avatar
  async uploadUserAvatar(file, userId) {
    try {
      const timestamp = Date.now()
      const fileName = `avatars/${userId}/${timestamp}_${file.name}`
      const storageRef = ref(storage, fileName)
      
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return { url: downloadURL, path: fileName, success: true }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return { success: false, error }
    }
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      const storageRef = ref(storage, filePath)
      await deleteObject(storageRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting file:', error)
      return { success: false, error }
    }
  }
}

export default new FirebaseStorageService()
```

### Step 7: Firestore Database Structure

```javascript
// Recommended Firestore collections for hybrid approach

// conversations
{
  id: "auto-generated",
  participants: ["userId1", "admin"],
  carId: "car-id",
  carName: "Toyota Vitz",
  status: "active",
  lastMessage: "Hello, is this available?",
  lastMessageTime: timestamp,
  unreadCount: {
    userId1: 0,
    admin: 2
  },
  createdAt: timestamp
}

// messages
{
  id: "auto-generated",
  conversationId: "conversation-id",
  senderId: "user-id",
  senderName: "John Doe",
  content: "Hello, is this car available?",
  type: "text", // "text", "image", "file"
  read: false,
  timestamp: timestamp
}

// notifications (Firebase-specific)
{
  id: "auto-generated",
  userId: "user-id",
  type: "booking", // "booking", "payment", "message"
  title: "Booking Confirmed",
  body: "Your booking has been confirmed",
  data: { bookingId: "123" },
  read: false,
  timestamp: timestamp
}

// fcm_tokens
{
  id: "user-id",
  token: "fcm-token",
  platform: "web", // "web", "android", "ios"
  updatedAt: timestamp
}
```

### Step 8: Security Rules

#### Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Messages - users can read/write their own conversations
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid in resource.data.conversationId.split('_') ||
         request.auth.token.admin == true);
    }
    
    // Conversations - users can read/write their own conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid in resource.data.participants ||
         request.auth.token.admin == true);
    }
    
    // Notifications - users can read their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // FCM Tokens - users can manage their own tokens
    match /fcm_tokens/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

#### Storage Security Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Car images - authenticated users can read, admins can write
    match /cars/{carId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // User avatars - users can manage their own avatars
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 9: Integration with Existing App

#### Update messaging to use Firebase
```javascript
// src/components/UserMessaging.jsx (updated)
import { useState, useEffect } from 'react'
import firebaseMessagingService from '../services/firebaseMessagingService'

const UserMessaging = ({ carId, carName }) => {
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)

  useEffect(() => {
    // Create or get conversation
    const convId = `${user.id}_${carId}`
    setConversationId(convId)
    
    // Subscribe to real-time messages
    const unsubscribe = firebaseMessagingService.subscribeToMessages(
      convId, 
      setMessages
    )
    
    return () => unsubscribe()
  }, [carId])

  const sendMessage = async (content) => {
    await firebaseMessagingService.sendMessage(
      conversationId,
      user.id,
      content
    )
  }

  // Rest of component...
}
```

## 📱 Mobile App Support

If you plan to build a mobile app, Firebase provides excellent mobile SDKs:

### React Native Setup
```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/messaging
npm install @react-native-firebase/storage
```

### Flutter Setup
```yaml
# pubspec.yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  cloud_firestore: ^4.13.6
  firebase_messaging: ^14.7.10
  firebase_storage: ^11.5.6
```

## 🔄 Migration Strategy

If you decide to move from Supabase to Firebase:

### Phase 1: Parallel Implementation
- Keep Supabase for existing features
- Implement new features with Firebase
- Test both systems

### Phase 2: Gradual Migration
- Migrate messaging to Firebase first
- Then move notifications
- Finally migrate core data if needed

### Phase 3: Cleanup
- Remove unused Supabase features
- Optimize Firebase usage
- Update documentation

## 💰 Cost Comparison

### Supabase Pricing
- Free tier: Up to 500MB database, 2GB bandwidth
- Pro: $25/month per project

### Firebase Pricing
- Free tier: 1GB storage, 20K writes/day
- Pay-as-you-go: Based on usage

For your car rental app, the hybrid approach provides the best value.

## 🎯 Recommendation

**For your car rental platform, I recommend the hybrid approach:**

1. **Keep Supabase** for main application data
2. **Add Firebase** for real-time messaging and push notifications
3. **Use Firebase Storage** for car images
4. **Implement Firebase Analytics** for user tracking

This gives you the best of both worlds while minimizing migration effort.
