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

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setIsAuthenticated(true)
        
        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data())
          } else {
            // Create user profile if it doesn't exist
            const defaultProfile = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              phone: '',
              profileImageUrl: firebaseUser.photoURL || '',
              isVerified: false,
              verificationStatus: 'pending',
              documents: {
                nationalId: { uploaded: false, verified: false, url: '' },
                proofOfResidence: { uploaded: false, verified: false, url: '' },
                kraPin: { uploaded: false, verified: false, url: '' }
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            
            await setDoc(userDocRef, defaultProfile)
            setUserProfile(defaultProfile)
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

      // Create user profile in Firestore
      const userProfile = {
        email: email,
        name: userData.name || '',
        phone: userData.phone || '',
        profileImageUrl: '',
        isVerified: false,
        verificationStatus: 'pending',
        documents: {
          nationalId: { uploaded: false, verified: false, url: '' },
          proofOfResidence: { uploaded: false, verified: false, url: '' },
          kraPin: { uploaded: false, verified: false, url: '' }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile)
      setUserProfile(userProfile)

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

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const userDocRef = doc(db, 'users', user.uid)
      const updatedData = {
        ...profileData,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(userDocRef, updatedData)
      setUserProfile(prev => ({ ...prev, ...updatedData }))

      // Update Firebase Auth profile if name changed
      if (profileData.name && profileData.name !== user.displayName) {
        await updateProfile(user, { displayName: profileData.name })
      }

      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }
  }

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Update password
      await updatePassword(user, newPassword)
      return { success: true }
    } catch (error) {
      console.error('Password change error:', error)
      let errorMessage = 'Failed to change password.'
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak.'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Check if user is admin
  const isAdmin = () => {
    const adminEmails = ['admin@papercarrental.com', 'manager@papercarrental.com']
    return user && adminEmails.includes(user.email)
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
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
