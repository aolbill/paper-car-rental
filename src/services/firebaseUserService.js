import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore'
import { 
  deleteUser as deleteAuthUser,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { db, auth } from '../lib/firebase'

// Comprehensive Firebase User Data Service
export class FirebaseUserService {
  
  // Create new user profile in Firestore
  async createUserProfile(userId, userData) {
    try {
      const userProfile = {
        email: userData.email,
        name: userData.name || '',
        phone: userData.phone || '',
        profileImageUrl: userData.profileImageUrl || '',
        dateOfBirth: userData.dateOfBirth || '',
        address: {
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          county: userData.address?.county || '',
          postalCode: userData.address?.postalCode || ''
        },
        preferences: {
          notifications: userData.preferences?.notifications !== false,
          newsletter: userData.preferences?.newsletter !== false,
          smsUpdates: userData.preferences?.smsUpdates !== false,
          language: userData.preferences?.language || 'en'
        },
        verification: {
          isVerified: false,
          verificationStatus: 'pending',
          documents: {
            nationalId: { uploaded: false, verified: false, url: '', rejectionReason: '' },
            drivingLicense: { uploaded: false, verified: false, url: '', rejectionReason: '' },
            proofOfResidence: { uploaded: false, verified: false, url: '', rejectionReason: '' }
          }
        },
        bookingHistory: [],
        favoriteVehicles: [],
        paymentMethods: [],
        emergencyContact: {
          name: userData.emergencyContact?.name || '',
          phone: userData.emergencyContact?.phone || '',
          relationship: userData.emergencyContact?.relationship || ''
        },
        accountStatus: 'active',
        role: userData.role || 'customer',
        permissions: userData.permissions || [],
        adminLevel: userData.adminLevel || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', userId), userProfile)
      return { success: true, data: { id: userId, ...userProfile } }
    } catch (error) {
      console.error('Error creating user profile:', error)

      // Provide specific error messages for common issues
      if (error.code === 'permission-denied') {
        return {
          success: false,
          error: 'Permission denied. Firestore security rules need to be configured to allow user profile creation.',
          code: 'PERMISSION_DENIED',
          solution: 'Apply the Firestore security rules from firestore.rules file'
        }
      } else if (error.code === 'unavailable') {
        return {
          success: false,
          error: 'Firebase service temporarily unavailable. Please try again.',
          code: 'SERVICE_UNAVAILABLE'
        }
      }

      return { success: false, error: error.message, code: error.code }
    }
  }

  // Get user profile by ID
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = { id: userSnap.id, ...userSnap.data() }
        return { success: true, data: userData }
      } else {
        return { success: false, error: 'User profile not found' }
      }
    } catch (error) {
      console.error('Error getting user profile:', error)

      // Provide specific error messages for common issues
      if (error.code === 'permission-denied') {
        return {
          success: false,
          error: 'Permission denied. Please check Firestore security rules.',
          code: 'PERMISSION_DENIED'
        }
      } else if (error.code === 'unavailable') {
        return {
          success: false,
          error: 'Firebase service temporarily unavailable. Please try again.',
          code: 'SERVICE_UNAVAILABLE'
        }
      }

      return { success: false, error: error.message, code: error.code }
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      const userRef = doc(db, 'users', userId)
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      }

      await updateDoc(userRef, updatedData)
      
      // If updating Firebase Auth profile fields
      const currentUser = auth.currentUser
      if (currentUser && currentUser.uid === userId) {
        const authUpdates = {}
        
        if (updateData.name && updateData.name !== currentUser.displayName) {
          authUpdates.displayName = updateData.name
        }
        
        if (updateData.profileImageUrl && updateData.profileImageUrl !== currentUser.photoURL) {
          authUpdates.photoURL = updateData.profileImageUrl
        }
        
        if (Object.keys(authUpdates).length > 0) {
          await updateProfile(currentUser, authUpdates)
        }
      }

      return { success: true, data: { id: userId, ...updatedData } }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error: error.message }
    }
  }

  // Update user email
  async updateUserEmail(userId, newEmail, currentPassword) {
    try {
      const currentUser = auth.currentUser
      if (!currentUser || currentUser.uid !== userId) {
        return { success: false, error: 'Not authenticated or invalid user' }
      }

      // Re-authenticate user before email change
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      
      // Update email in Firebase Auth
      await updateEmail(currentUser, newEmail)
      
      // Update email in Firestore
      await this.updateUserProfile(userId, { email: newEmail })

      return { success: true }
    } catch (error) {
      console.error('Error updating user email:', error)
      let errorMessage = 'Failed to update email'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use by another account'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Update user password
  async updateUserPassword(userId, currentPassword, newPassword) {
    try {
      const currentUser = auth.currentUser
      if (!currentUser || currentUser.uid !== userId) {
        return { success: false, error: 'Not authenticated or invalid user' }
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      
      // Update password
      await updatePassword(currentUser, newPassword)
      
      // Update last password change timestamp
      await this.updateUserProfile(userId, { 
        lastPasswordChange: serverTimestamp() 
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating user password:', error)
      let errorMessage = 'Failed to update password'
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Add vehicle to favorites
  async addToFavorites(userId, vehicleId) {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        favoriteVehicles: arrayUnion(vehicleId),
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      return { success: false, error: error.message }
    }
  }

  // Remove vehicle from favorites
  async removeFromFavorites(userId, vehicleId) {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        favoriteVehicles: arrayRemove(vehicleId),
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error removing from favorites:', error)
      return { success: false, error: error.message }
    }
  }

  // Update user verification documents
  async updateVerificationDocument(userId, documentType, documentData) {
    try {
      const userRef = doc(db, 'users', userId)
      const updatePath = `verification.documents.${documentType}`
      
      await updateDoc(userRef, {
        [updatePath]: {
          uploaded: true,
          verified: false,
          url: documentData.url,
          fileName: documentData.fileName || '',
          uploadedAt: serverTimestamp(),
          rejectionReason: ''
        },
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating verification document:', error)
      return { success: false, error: error.message }
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        'preferences': {
          ...preferences,
          updatedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return { success: false, error: error.message }
    }
  }

  // Add payment method
  async addPaymentMethod(userId, paymentMethodData) {
    try {
      const userRef = doc(db, 'users', userId)
      const paymentMethod = {
        id: `pm_${Date.now()}`,
        ...paymentMethodData,
        addedAt: serverTimestamp()
      }

      await updateDoc(userRef, {
        paymentMethods: arrayUnion(paymentMethod),
        updatedAt: serverTimestamp()
      })

      return { success: true, data: paymentMethod }
    } catch (error) {
      console.error('Error adding payment method:', error)
      return { success: false, error: error.message }
    }
  }

  // Remove payment method
  async removePaymentMethod(userId, paymentMethodId) {
    try {
      // First get the user to find the payment method
      const userResult = await this.getUserProfile(userId)
      if (!userResult.success) {
        return { success: false, error: 'User not found' }
      }

      const paymentMethod = userResult.data.paymentMethods?.find(pm => pm.id === paymentMethodId)
      if (!paymentMethod) {
        return { success: false, error: 'Payment method not found' }
      }

      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        paymentMethods: arrayRemove(paymentMethod),
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error removing payment method:', error)
      return { success: false, error: error.message }
    }
  }

  // Update last login timestamp
  async updateLastLogin(userId) {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating last login:', error)
      return { success: false, error: error.message }
    }
  }

  // Get all users (admin only)
  async getAllUsers(adminUserId) {
    try {
      // Verify admin status
      const adminResult = await this.getUserProfile(adminUserId)
      if (!adminResult.success || adminResult.data.role !== 'admin') {
        return { success: false, error: 'Unauthorized: Admin access required' }
      }

      const usersRef = collection(db, 'users')
      const q = query(usersRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, data: users }
    } catch (error) {
      console.error('Error getting all users:', error)
      return { success: false, error: error.message }
    }
  }

  // Search users by email or name
  async searchUsers(searchTerm, adminUserId) {
    try {
      // Verify admin status
      const adminResult = await this.getUserProfile(adminUserId)
      if (!adminResult.success || adminResult.data.role !== 'admin') {
        return { success: false, error: 'Unauthorized: Admin access required' }
      }

      const usersRef = collection(db, 'users')
      
      // Search by email
      const emailQuery = query(
        usersRef, 
        where('email', '>=', searchTerm.toLowerCase()),
        where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        limit(10)
      )
      
      // Search by name
      const nameQuery = query(
        usersRef, 
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(10)
      )

      const [emailSnapshot, nameSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(nameQuery)
      ])

      const emailResults = emailSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const nameResults = nameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Combine and deduplicate results
      const allResults = [...emailResults, ...nameResults]
      const uniqueResults = allResults.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      )

      return { success: true, data: uniqueResults }
    } catch (error) {
      console.error('Error searching users:', error)
      return { success: false, error: error.message }
    }
  }

  // Soft delete user account (deactivate)
  async deactivateUserAccount(userId, adminUserId) {
    try {
      // Verify admin status if not self-deletion
      if (userId !== adminUserId) {
        const adminResult = await this.getUserProfile(adminUserId)
        if (!adminResult.success || adminResult.data.role !== 'admin') {
          return { success: false, error: 'Unauthorized: Admin access required' }
        }
      }

      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        accountStatus: 'deactivated',
        deactivatedAt: serverTimestamp(),
        deactivatedBy: adminUserId,
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error deactivating user account:', error)
      return { success: false, error: error.message }
    }
  }

  // Permanently delete user account and data
  async deleteUserAccount(userId, currentPassword, adminUserId) {
    try {
      const currentUser = auth.currentUser
      
      // If self-deletion, verify current user
      if (!adminUserId && (!currentUser || currentUser.uid !== userId)) {
        return { success: false, error: 'Not authenticated or invalid user' }
      }

      // If admin deletion, verify admin status
      if (adminUserId && adminUserId !== userId) {
        const adminResult = await this.getUserProfile(adminUserId)
        if (!adminResult.success || adminResult.data.role !== 'admin') {
          return { success: false, error: 'Unauthorized: Admin access required' }
        }
      }

      // For self-deletion, re-authenticate
      if (!adminUserId && currentPassword) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
        await reauthenticateWithCredential(currentUser, credential)
      }

      // Delete user document from Firestore
      const userRef = doc(db, 'users', userId)
      await deleteDoc(userRef)

      // Delete Firebase Auth account (only if it's self-deletion or admin with proper permissions)
      if (!adminUserId && currentUser) {
        await deleteAuthUser(currentUser)
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting user account:', error)
      let errorMessage = 'Failed to delete account'
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect'
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log in again before deleting your account'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Get user activity logs
  async getUserActivityLogs(userId, limit = 50) {
    try {
      const logsRef = collection(db, 'userActivityLogs')
      const q = query(
        logsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      )
      
      const querySnapshot = await getDocs(q)
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, data: logs }
    } catch (error) {
      console.error('Error getting user activity logs:', error)
      return { success: false, error: error.message }
    }
  }

  // Log user activity
  async logUserActivity(userId, activity, details = {}) {
    try {
      const logsRef = collection(db, 'userActivityLogs')
      const logEntry = {
        userId,
        activity,
        details,
        timestamp: serverTimestamp(),
        ipAddress: details.ipAddress || '',
        userAgent: details.userAgent || ''
      }

      await addDoc(logsRef, logEntry)
      return { success: true }
    } catch (error) {
      console.error('Error logging user activity:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create and export singleton instance
const firebaseUserService = new FirebaseUserService()
export default firebaseUserService
