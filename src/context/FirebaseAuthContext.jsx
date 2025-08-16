import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import firebaseUserService from '../services/firebaseUserService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if Firebase is available
  const isFirebaseAvailable = auth !== null && db !== null

  // Listen for authentication state changes
  useEffect(() => {
    if (!isFirebaseAvailable) {
      console.warn('Firebase not configured. Authentication disabled.')
      setIsLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setIsAuthenticated(true)
        
        // Fetch user profile from Firestore using service
        try {
          const result = await firebaseUserService.getUserProfile(firebaseUser.uid)

          if (result.success) {
            setUserProfile(result.data)
            // Update last login
            await firebaseUserService.updateLastLogin(firebaseUser.uid)
          } else {
            // Create user profile if it doesn't exist
            const profileResult = await firebaseUserService.createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              profileImageUrl: firebaseUser.photoURL || ''
            })

            if (profileResult.success) {
              setUserProfile(profileResult.data)
              // Log user registration activity
              await firebaseUserService.logUserActivity(firebaseUser.uid, 'profile_created', {
                method: 'auto_creation_on_auth'
              })
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setUser(null)
        setUserProfile(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Register new user
  const register = async (email, password, userData) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not configured. Please set up Firebase credentials.' }
    }

    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update display name
      if (userData.name) {
        await updateProfile(firebaseUser, {
          displayName: userData.name
        })
      }

      // Create user profile in Firestore using service
      const profileResult = await firebaseUserService.createUserProfile(firebaseUser.uid, {
        email: email,
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || {},
        preferences: userData.preferences || {},
        emergencyContact: userData.emergencyContact || {}
      })

      if (profileResult.success) {
        setUserProfile(profileResult.data)
        // Log user registration activity
        await firebaseUserService.logUserActivity(firebaseUser.uid, 'account_registered', {
          registrationMethod: 'email_password',
          userAgent: navigator.userAgent
        })
      }

      return { success: true, user: firebaseUser }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Login user
  const login = async (email, password) => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not configured. Please set up Firebase credentials.' }
    }

    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.'
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.'
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.'
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout user
  const logout = async () => {
    if (!isFirebaseAvailable) {
      return { success: false, error: 'Firebase not configured.' }
    }

    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
      setIsAuthenticated(false)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      let errorMessage = 'Failed to send reset email.'
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Update user profile using service
  const updateUserProfile = async (profileData) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const result = await firebaseUserService.updateUserProfile(user.uid, profileData)

      if (result.success) {
        setUserProfile(prev => ({ ...prev, ...profileData }))
        // Log profile update activity
        await firebaseUserService.logUserActivity(user.uid, 'profile_updated', {
          updatedFields: Object.keys(profileData),
          userAgent: navigator.userAgent
        })
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }
  }

  // Change password using service
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const result = await firebaseUserService.updateUserPassword(user.uid, currentPassword, newPassword)

      if (result.success) {
        // Log password change activity
        await firebaseUserService.logUserActivity(user.uid, 'password_changed', {
          userAgent: navigator.userAgent
        })
      }

      return result
    } catch (error) {
      console.error('Password change error:', error)
      return { success: false, error: error.message }
    }
  }

  // Check if user is admin
  const isAdmin = () => {
    const adminEmails = ['admin@papercarrental.com', 'manager@papercarrental.com']
    return user && adminEmails.includes(user.email)
  }

  // Delete user account
  const deleteUserAccount = async (currentPassword) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const result = await firebaseUserService.deleteUserAccount(user.uid, currentPassword)

      if (result.success) {
        // Log account deletion before clearing state
        await firebaseUserService.logUserActivity(user.uid, 'account_deleted', {
          deletionMethod: 'self_deletion',
          userAgent: navigator.userAgent
        })

        // Clear local state
        setUser(null)
        setUserProfile(null)
        setIsAuthenticated(false)
      }

      return result
    } catch (error) {
      console.error('Account deletion error:', error)
      return { success: false, error: error.message }
    }
  }

  // Add to favorites
  const addToFavorites = async (vehicleId) => {
    if (!user) return { success: false, error: 'No user logged in' }

    const result = await firebaseUserService.addToFavorites(user.uid, vehicleId)
    if (result.success) {
      setUserProfile(prev => ({
        ...prev,
        favoriteVehicles: [...(prev.favoriteVehicles || []), vehicleId]
      }))
    }
    return result
  }

  // Remove from favorites
  const removeFromFavorites = async (vehicleId) => {
    if (!user) return { success: false, error: 'No user logged in' }

    const result = await firebaseUserService.removeFromFavorites(user.uid, vehicleId)
    if (result.success) {
      setUserProfile(prev => ({
        ...prev,
        favoriteVehicles: (prev.favoriteVehicles || []).filter(id => id !== vehicleId)
      }))
    }
    return result
  }

  // Update user preferences
  const updateUserPreferences = async (preferences) => {
    if (!user) return { success: false, error: 'No user logged in' }

    const result = await firebaseUserService.updateUserPreferences(user.uid, preferences)
    if (result.success) {
      setUserProfile(prev => ({ ...prev, preferences }))
    }
    return result
  }

  const value = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    deleteUserAccount,
    addToFavorites,
    removeFromFavorites,
    updateUserPreferences,
    isAdmin,
    // User service methods for direct access
    userService: firebaseUserService
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
