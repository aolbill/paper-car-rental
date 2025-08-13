import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock user database
const mockUsers = new Map()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock admin users
  const adminEmails = ['admin@rentkenya.com', 'manager@rentkenya.com', 'super@rentkenya.com']

  const login = async (email, password) => {
    setIsLoading(true)
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const emailLower = email.toLowerCase().trim()
      
      // Check if user exists in mock database or is admin
      const existingUser = mockUsers.get(emailLower)
      const isAdmin = adminEmails.includes(emailLower)
      
      if (!existingUser && !isAdmin) {
        return { 
          success: false, 
          error: 'Account not found. Please check your email or sign up for a new account.' 
        }
      }
      
      // For demo purposes, any password works
      // In real app, you'd verify the password hash
      
      let userData
      if (isAdmin) {
        userData = {
          id: 'admin-' + Date.now(),
          email: emailLower,
          name: emailLower.split('@')[0].charAt(0).toUpperCase() + emailLower.split('@')[0].slice(1),
          phone: '+254700000000',
          role: 'admin',
          joinDate: new Date().toISOString(),
          permissions: [
            'manage_cars',
            'manage_bookings', 
            'manage_users',
            'view_analytics',
            'manage_requests'
          ]
        }
      } else {
        userData = {
          ...existingUser,
          id: existingUser.id || Date.now()
        }
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('lastLoginTime', new Date().toISOString())
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Login failed due to a technical issue. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    setIsLoading(true)
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const emailLower = userData.email.toLowerCase().trim()
      
      // Check if user already exists
      if (mockUsers.has(emailLower)) {
        return { 
          success: false, 
          error: 'An account with this email already exists. Please sign in instead.' 
        }
      }
      
      // Validate required fields
      if (!userData.name?.trim() || !userData.email?.trim() || !userData.phone?.trim()) {
        return { 
          success: false, 
          error: 'All fields are required. Please complete the form.' 
        }
      }
      
      // Create new user
      const newUser = {
        id: Date.now(),
        name: userData.name.trim(),
        email: emailLower,
        phone: userData.phone.trim(),
        role: 'user',
        permissions: ['create_booking', 'view_own_bookings'],
        joinDate: new Date().toISOString(),
        emailVerified: true, // Auto-verified for demo
        accountStatus: 'active'
      }
      
      // Store in mock database
      mockUsers.set(emailLower, newUser)
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      localStorage.setItem('lastLoginTime', new Date().toISOString())
      
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: 'Registration failed due to a technical issue. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('lastLoginTime')
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear session storage
      sessionStorage.clear()
    }
  }

  const updateUser = (updatedData) => {
    if (!user) return { success: false, error: 'No user logged in' }
    
    try {
      const updatedUser = { ...user, ...updatedData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Update in mock database
      mockUsers.set(user.email, updatedUser)
      
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: 'Failed to update user information' }
    }
  }

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const refreshUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        return { success: true, user: parsedUser }
      } catch (error) {
        console.error('Error refreshing user:', error)
        logout()
        return { success: false, error: 'Session expired. Please sign in again.' }
      }
    }
    return { success: false, error: 'No saved session found' }
  }

  const getSessionInfo = () => {
    const lastLoginTime = localStorage.getItem('lastLoginTime')
    return {
      isLoggedIn: !!user,
      lastLogin: lastLoginTime ? new Date(lastLoginTime) : null,
      sessionDuration: lastLoginTime ? Date.now() - new Date(lastLoginTime).getTime() : 0
    }
  }

  // Check for existing session on mount and validate it
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const lastLoginTime = localStorage.getItem('lastLoginTime')
    
    if (savedUser && lastLoginTime) {
      try {
        const parsedUser = JSON.parse(savedUser)
        const loginTime = new Date(lastLoginTime)
        const now = new Date()
        
        // Check if session is still valid (30 days)
        const sessionAge = now.getTime() - loginTime.getTime()
        const maxSessionAge = 30 * 24 * 60 * 60 * 1000 // 30 days
        
        if (sessionAge < maxSessionAge) {
          setUser(parsedUser)
          
          // Add user to mock database if admin
          if (parsedUser.role === 'admin') {
            // Admin users don't need to be in mock database
          } else {
            mockUsers.set(parsedUser.email, parsedUser)
          }
        } else {
          // Session expired
          logout()
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        logout()
      }
    }
  }, [])

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    getSessionInfo,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    hasPermission,
    // Helper methods
    getUserDisplayName: () => user?.name || user?.email?.split('@')[0] || 'User',
    getUserInitials: () => {
      if (!user?.name) return 'U'
      return user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
