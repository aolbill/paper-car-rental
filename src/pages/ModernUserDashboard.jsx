import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import { documentService } from '../services/documentService'
import { firebaseService } from '../services/firebaseService'
import DocumentUpload from '../components/DocumentUpload'
import './ModernUserDashboard.css'

const ModernUserDashboard = () => {
  const { user, userProfile, updateUserProfile, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [user])

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || ''
      })
    }
  }, [userProfile])

  const loadUserData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Load user bookings
      const bookingsResult = await firebaseService.getUserBookings(user.uid)
      if (bookingsResult.data) {
        setBookings(bookingsResult.data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    // Validate form
    const errors = {}
    if (!profileData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!profileData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^(\+254|0)[17]\d{8}$/.test(profileData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Kenyan phone number'
    }

    setProfileErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const result = await updateUserProfile(profileData)
      if (result.success) {
        setEditingProfile(false)
        setProfileErrors({})
      } else {
        setProfileErrors({ general: result.error })
      }
    } catch (error) {
      setProfileErrors({ general: 'Failed to update profile' })
    }
  }

  const handleDocumentUpload = async () => {
    setRefreshing(true)
    // Refresh user profile to get updated document status
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getVerificationStatus = () => {
    if (!userProfile) return 'loading'
    return documentService.getVerificationStatus(userProfile)
  }

  const getDocumentCompleteness = () => {
    if (!userProfile) return { complete: false, missing: [], uploaded: 0, totalRequired: 3 }
    return documentService.checkDocumentCompleteness(userProfile)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'not-started': { text: 'Not Started', class: 'status-not-started' },
      'incomplete': { text: 'Incomplete', class: 'status-incomplete' },
      'pending-review': { text: 'Pending Review', class: 'status-pending' },
      'partial-verified': { text: 'Partially Verified', class: 'status-partial' },
      'verified': { text: 'Verified', class: 'status-verified' }
    }
    
    const config = statusConfig[status] || statusConfig['not-started']
    return <span className={`status-badge ${config.class}`}>{config.text}</span>
  }

  const getBookingStatusBadge = (status) => {
    const statusConfig = {
      'pending': { text: 'Pending', class: 'booking-status-pending' },
      'confirmed': { text: 'Confirmed', class: 'booking-status-confirmed' },
      'active': { text: 'Active', class: 'booking-status-active' },
      'completed': { text: 'Completed', class: 'booking-status-completed' },
      'cancelled': { text: 'Cancelled', class: 'booking-status-cancelled' }
    }
    
    const config = statusConfig[status] || statusConfig['pending']
    return <span className={`booking-status ${config.class}`}>{config.text}</span>
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  const verificationStatus = getVerificationStatus()
  const documentStats = getDocumentCompleteness()

  return (
    <div className="modern-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="user-welcome">
            <div className="user-avatar">
              {userProfile?.profileImageUrl ? (
                <img src={userProfile.profileImageUrl} alt="Profile" />
              ) : (
                <span>{userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="welcome-text">
              <h1>Welcome back, {userProfile?.name || 'User'}!</h1>
              <p>Manage your rentals and profile</p>
            </div>
          </div>
          
          <div className="verification-overview">
            {getStatusBadge(verificationStatus)}
            <div className="document-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(documentStats.uploaded / documentStats.totalRequired) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {documentStats.uploaded}/{documentStats.totalRequired} documents
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{bookings.length}</h3>
              <p>Total Bookings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{bookings.filter(b => b.status === 'completed').length}</h3>
              <p>Completed Trips</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{bookings.filter(b => ['pending', 'confirmed', 'active'].includes(b.status)).length}</h3>
              <p>Active Bookings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{documentStats.uploaded}</h3>
              <p>Documents Uploaded</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Overview
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            My Bookings
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Documents
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Profile
          </button>
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="overview-grid">
                {/* Verification Status Card */}
                <div className="overview-card">
                  <div className="card-header">
                    <h3>Verification Status</h3>
                    {getStatusBadge(verificationStatus)}
                  </div>
                  
                  <div className="verification-details">
                    {verificationStatus === 'verified' ? (
                      <div className="verified-message">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <p>Your account is fully verified! You can now book any vehicle.</p>
                      </div>
                    ) : (
                      <div className="verification-progress">
                        <p>Complete your verification to unlock all features</p>
                        <div className="next-steps">
                          <h4>Next steps:</h4>
                          <ul>
                            {documentStats.missing.map(doc => (
                              <li key={doc}>Upload {doc}</li>
                            ))}
                            {documentStats.missing.length === 0 && verificationStatus === 'pending-review' && (
                              <li>Wait for admin review</li>
                            )}
                          </ul>
                        </div>
                        <button 
                          className="complete-verification-btn"
                          onClick={() => setActiveTab('documents')}
                        >
                          Complete Verification
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Bookings Card */}
                <div className="overview-card">
                  <div className="card-header">
                    <h3>Recent Bookings</h3>
                    <button 
                      className="view-all-btn"
                      onClick={() => setActiveTab('bookings')}
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="recent-bookings">
                    {bookings.slice(0, 3).map(booking => (
                      <div key={booking.id} className="booking-item">
                        <div className="booking-car">
                          {booking.cars?.image && (
                            <img src={booking.cars.image} alt={booking.cars.name} />
                          )}
                          <div className="booking-details">
                            <h4>{booking.cars?.name || 'Car'}</h4>
                            <p>{booking.pickup_location} → {booking.dropoff_location}</p>
                            <small>{new Date(booking.pickup_date).toLocaleDateString()}</small>
                          </div>
                        </div>
                        {getBookingStatusBadge(booking.status)}
                      </div>
                    ))}
                    
                    {bookings.length === 0 && (
                      <div className="no-bookings">
                        <p>No bookings yet. Ready for your first adventure?</p>
                        <a href="/cars" className="browse-cars-btn">Browse Cars</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-content">
              <div className="content-header">
                <h2>My Bookings</h2>
                <a href="/cars" className="new-booking-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  New Booking
                </a>
              </div>
              
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-id">#{booking.id.slice(-8)}</div>
                      {getBookingStatusBadge(booking.status)}
                    </div>
                    
                    <div className="booking-content">
                      <div className="booking-car-info">
                        {booking.cars?.image && (
                          <img src={booking.cars.image} alt={booking.cars.name} />
                        )}
                        <div className="car-details">
                          <h3>{booking.cars?.name || 'Car'}</h3>
                          <p className="car-category">{booking.cars?.category}</p>
                        </div>
                      </div>
                      
                      <div className="booking-details">
                        <div className="detail-group">
                          <label>Pickup</label>
                          <p>{booking.pickup_location}</p>
                          <small>{new Date(booking.pickup_date).toLocaleDateString()} at {booking.pickup_time}</small>
                        </div>
                        
                        <div className="detail-group">
                          <label>Dropoff</label>
                          <p>{booking.dropoff_location}</p>
                          <small>{new Date(booking.dropoff_date).toLocaleDateString()} at {booking.dropoff_time}</small>
                        </div>
                        
                        <div className="detail-group">
                          <label>Total Cost</label>
                          <p className="price">KSH {booking.total_price?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="booking-actions">
                      <button className="action-btn secondary">View Details</button>
                      {booking.status === 'pending' && (
                        <button className="action-btn danger">Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
                
                {bookings.length === 0 && (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    <h3>No bookings yet</h3>
                    <p>When you book a car, it will appear here</p>
                    <a href="/cars" className="browse-cars-btn">Browse Available Cars</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="documents-content">
              <div className="content-header">
                <h2>Identity Verification</h2>
                {refreshing && <div className="refreshing-indicator">Refreshing...</div>}
              </div>
              
              <div className="verification-intro">
                <div className="intro-content">
                  <h3>Complete your verification to start renting</h3>
                  <p>We need to verify your identity to ensure the safety and security of our platform. Upload clear photos of the required documents.</p>
                </div>
                
                <div className="verification-benefits">
                  <h4>Benefits of verification:</h4>
                  <ul>
                    <li>✅ Access to all premium vehicles</li>
                    <li>✅ Faster booking process</li>
                    <li>✅ Higher booking limits</li>
                    <li>✅ Priority customer support</li>
                  </ul>
                </div>
              </div>
              
              <div className="documents-list">
                <DocumentUpload 
                  documentType="nationalId" 
                  onUploadComplete={handleDocumentUpload}
                />
                <DocumentUpload 
                  documentType="proofOfResidence" 
                  onUploadComplete={handleDocumentUpload}
                />
                <DocumentUpload 
                  documentType="kraPin" 
                  onUploadComplete={handleDocumentUpload}
                />
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-content">
              <div className="content-header">
                <h2>Profile Settings</h2>
                <button 
                  className="logout-btn"
                  onClick={logout}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Sign Out
                </button>
              </div>
              
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    {userProfile?.profileImageUrl ? (
                      <img src={userProfile.profileImageUrl} alt="Profile" />
                    ) : (
                      <span>{userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  
                  <div className="profile-info">
                    <h3>{userProfile?.name || 'User'}</h3>
                    <p>{userProfile?.email}</p>
                    <div className="profile-stats">
                      <span>Member since {new Date(userProfile?.createdAt || Date.now()).getFullYear()}</span>
                      {getStatusBadge(verificationStatus)}
                    </div>
                  </div>
                </div>
                
                {!editingProfile ? (
                  <div className="profile-details">
                    <div className="detail-row">
                      <label>Full Name</label>
                      <span>{userProfile?.name || 'Not provided'}</span>
                    </div>
                    
                    <div className="detail-row">
                      <label>Email Address</label>
                      <span>{userProfile?.email}</span>
                    </div>
                    
                    <div className="detail-row">
                      <label>Phone Number</label>
                      <span>{userProfile?.phone || 'Not provided'}</span>
                    </div>
                    
                    <button 
                      className="edit-profile-btn"
                      onClick={() => setEditingProfile(true)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                    {profileErrors.general && (
                      <div className="form-error">{profileErrors.general}</div>
                    )}
                    
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className={profileErrors.name ? 'error' : ''}
                      />
                      {profileErrors.name && <span className="field-error">{profileErrors.name}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="disabled"
                      />
                      <small>Email cannot be changed</small>
                    </div>
                    
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className={profileErrors.phone ? 'error' : ''}
                        placeholder="+254 7XX XXX XXX"
                      />
                      {profileErrors.phone && <span className="field-error">{profileErrors.phone}</span>}
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="save-btn">
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModernUserDashboard
