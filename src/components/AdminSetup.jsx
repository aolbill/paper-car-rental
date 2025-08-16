import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import firebaseUserService from '../services/firebaseUserService'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import './AdminSetup.css'

const AdminSetup = () => {
  const { user, register, login } = useAuth()
  const [isSetup, setIsSetup] = useState(false)
  const [existingAdmins, setExistingAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adminCode: ''
  })
  const [status, setStatus] = useState({ type: '', message: '' })

  // Admin setup code (in production, this should be environment variable)
  const ADMIN_SETUP_CODE = 'PAPERCAR2024'

  useEffect(() => {
    checkExistingAdmins()
  }, [])

  const checkExistingAdmins = async () => {
    try {
      setLoading(true)
      
      if (!db) {
        setStatus({ type: 'error', message: 'Firebase not configured' })
        setLoading(false)
        return
      }

      const usersRef = collection(db, 'users')
      const adminQuery = query(usersRef, where('role', '==', 'admin'))
      const adminSnapshot = await getDocs(adminQuery)
      
      const admins = adminSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setExistingAdmins(admins)
      setIsSetup(admins.length > 0)
      
      if (admins.length > 0) {
        setStatus({ 
          type: 'info', 
          message: `Found ${admins.length} existing admin(s). You can create additional admins below.` 
        })
      }
    } catch (error) {
      console.error('Error checking admins:', error)
      setStatus({ type: 'error', message: 'Error checking existing admins' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatus({ type: 'error', message: 'Name is required' })
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setStatus({ type: 'error', message: 'Valid email is required' })
      return false
    }
    if (formData.password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters' })
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' })
      return false
    }
    if (formData.adminCode !== ADMIN_SETUP_CODE) {
      setStatus({ type: 'error', message: 'Invalid admin setup code' })
      return false
    }
    return true
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setStatus({ type: 'info', message: 'Creating admin account...' })

      // Create Firebase auth user
      const registerResult = await register(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone
      })

      if (!registerResult.success) {
        setStatus({ type: 'error', message: registerResult.error })
        return
      }

      // Update user profile to admin
      const updateResult = await firebaseUserService.updateUserProfile(registerResult.user.uid, {
        role: 'admin',
        permissions: [
          'manage_cars',
          'manage_bookings', 
          'manage_users',
          'view_analytics',
          'manage_payments',
          'manage_locations'
        ],
        adminLevel: 'super_admin',
        createdBy: user?.uid || 'system',
        adminSince: new Date().toISOString()
      })

      if (updateResult.success) {
        setStatus({ 
          type: 'success', 
          message: `Admin account created successfully for ${formData.name}!` 
        })
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          adminCode: ''
        })
        
        // Refresh admin list
        await checkExistingAdmins()
      } else {
        setStatus({ type: 'error', message: 'Failed to set admin permissions' })
      }

    } catch (error) {
      console.error('Admin creation error:', error)
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const promoteCurrentUser = async () => {
    if (!user) {
      setStatus({ type: 'error', message: 'No user logged in' })
      return
    }

    try {
      setLoading(true)
      setStatus({ type: 'info', message: 'Promoting current user to admin...' })

      const updateResult = await firebaseUserService.updateUserProfile(user.uid, {
        role: 'admin',
        permissions: [
          'manage_cars',
          'manage_bookings',
          'manage_users', 
          'view_analytics',
          'manage_payments',
          'manage_locations'
        ],
        adminLevel: 'super_admin',
        promotedAt: new Date().toISOString(),
        promotedBy: 'self_promotion'
      })

      if (updateResult.success) {
        setStatus({ 
          type: 'success', 
          message: 'Current user promoted to admin successfully!' 
        })
        await checkExistingAdmins()
      } else {
        setStatus({ type: 'error', message: 'Failed to promote user' })
      }

    } catch (error) {
      console.error('Promotion error:', error)
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (loading && existingAdmins.length === 0) {
    return (
      <div className="admin-setup-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Checking admin setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-setup-container">
      <div className="admin-setup-card">
        <div className="setup-header">
          <h1>🔑 Admin Account Setup</h1>
          <p>Create and manage administrator accounts for RentKenya</p>
        </div>

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}

        {/* Existing Admins */}
        {existingAdmins.length > 0 && (
          <div className="existing-admins">
            <h3>Current Administrators</h3>
            <div className="admin-list">
              {existingAdmins.map(admin => (
                <div key={admin.id} className="admin-item">
                  <div className="admin-info">
                    <strong>{admin.name}</strong>
                    <span>{admin.email}</span>
                    <span className="admin-badge">{admin.adminLevel || 'admin'}</span>
                  </div>
                  <div className="admin-meta">
                    {admin.adminSince && (
                      <small>Admin since: {new Date(admin.adminSince).toLocaleDateString()}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick promote current user if no admins exist */}
        {existingAdmins.length === 0 && user && (
          <div className="quick-promote">
            <h3>Quick Setup</h3>
            <p>Promote your current account ({user.email}) to admin?</p>
            <button 
              className="btn btn-primary" 
              onClick={promoteCurrentUser}
              disabled={loading}
            >
              {loading ? 'Promoting...' : 'Make Me Admin'}
            </button>
          </div>
        )}

        {/* Admin Creation Form */}
        <div className="admin-form-section">
          <h3>Create New Admin Account</h3>
          
          <form onSubmit={handleCreateAdmin} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@papercarrental.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+254 712 345 678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminCode">Admin Setup Code</label>
              <input
                type="password"
                id="adminCode"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleInputChange}
                placeholder="Enter admin setup code"
                required
              />
              <small className="form-hint">
                Contact system administrator for the setup code
              </small>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Admin...' : 'Create Admin Account'}
              </button>
            </div>
          </form>
        </div>

        <div className="admin-permissions">
          <h4>Admin Permissions Include:</h4>
          <ul>
            <li>🚗 Manage vehicle fleet (add, edit, remove cars)</li>
            <li>📅 Manage all bookings and reservations</li>
            <li>👥 Manage user accounts and profiles</li>
            <li>📊 View analytics and reporting</li>
            <li>💳 Manage payments and transactions</li>
            <li>📍 Manage pickup/dropoff locations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminSetup
