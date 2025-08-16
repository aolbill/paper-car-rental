# 🔐 Firestore Security Rules Setup

## Current Issue
Your Firebase app is experiencing permission errors because Firestore security rules haven't been configured yet. By default, Firebase denies all read/write operations for security.

**Error Messages:**
- "Missing or insufficient permissions"
- "Permission denied"

## 🚀 Quick Fix Steps

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **papercarrental**

### Step 2: Navigate to Firestore Rules
1. In the left sidebar, click **Firestore Database**
2. Click on the **Rules** tab
3. You'll see the current rules (probably very restrictive)

### Step 3: Update Security Rules
Replace the existing rules with the contents of the `firestore.rules` file in your project root.

**Current restrictive rules probably look like:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Denies everything
    }
  }
}
```

**New rules should be:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // User activity logs
    match /userActivityLogs/{logId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Cars collection - read for authenticated users
    match /cars/{carId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
    
    // Other collections...
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Publish Rules
1. Click the **Publish** button
2. Confirm the changes

### Step 5: Test the Fix
1. Go to `/test/permissions` in your app
2. Log in if you haven't already
3. Run the diagnostic tests
4. All tests should now pass ✅

## 🔧 What These Rules Do

### Security Principles
- **Authentication Required**: All operations require user authentication
- **User Isolation**: Users can only access their own data
- **Admin Access**: Admin users can access additional collections
- **Principle of Least Privilege**: Minimal permissions granted

### Specific Permissions

**Users Collection (`/users/{userId}`):**
- ✅ Users can read their own profile
- ✅ Users can create their own profile
- ✅ Users can update their own profile
- ❌ Users cannot access other users' profiles

**User Activity Logs (`/userActivityLogs/{logId}`):**
- ✅ Users can read their own activity logs
- ✅ Users can create new activity logs
- ❌ Users cannot access other users' activity logs

**Cars Collection (`/cars/{carId}`):**
- ✅ All authenticated users can read car data
- ✅ Only admins can modify car data
- ❌ Unauthenticated users cannot access

**Bookings Collection (`/bookings/{bookingId}`):**
- ✅ Users can read/write their own bookings
- ✅ Admins can access all bookings
- ❌ Users cannot access other users' bookings

## 🧪 Testing Your Setup

### Visit the Diagnostic Page
Navigate to `/test/permissions` to run comprehensive tests:

1. **Authentication Test** - Verifies user is logged in
2. **Direct Firestore Read** - Tests reading user document
3. **Service getUserProfile** - Tests user service methods
4. **Direct Firestore Write** - Tests writing user document
5. **Service createUserProfile** - Tests profile creation

### Expected Results
All tests should show ✅ (green checkmarks) after applying the rules.

## ⚠️ Security Considerations

### What's Protected
- User personal data is isolated
- Only authenticated users can access the app
- Admin functions are properly restricted
- Activity logging is secure

### Best Practices Implemented
- **User Data Isolation**: Each user can only access their own data
- **Role-Based Access**: Admin users have elevated permissions
- **Authentication Requirement**: All operations require login
- **Minimal Permissions**: Users get only the access they need

## 🆘 Troubleshooting

### Still Getting Permission Errors?
1. **Clear Browser Cache**: Sometimes cached tokens cause issues
2. **Log Out & Log In**: Refresh authentication state
3. **Check Rules Syntax**: Ensure no syntax errors in rules
4. **Verify Project**: Make sure you're in the correct Firebase project

### Rules Not Taking Effect?
- Rules can take a few minutes to propagate
- Try logging out and logging back in
- Check the Firebase Console for any rule validation errors

### Need to Reset Rules?
If something goes wrong, you can always revert to the original rules and start over.

## 📞 Need Help?
- Check the `/test/permissions` page for detailed diagnostics
- Review Firebase Console for rule validation errors
- Ensure you're logged in to the correct Firebase project

---

**✅ Once you've applied these rules, your app should work perfectly with full user profile management!**
