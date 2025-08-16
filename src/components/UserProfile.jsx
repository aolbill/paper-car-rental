import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import './UserProfile.css'

const UserProfile = () => {
  const { 
    user, 
    userProfile, 
    updateUserProfile, 
    changePassword,
    deleteUserAccount,
    updateUserPreferences,
    userService
  } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      county: '',
      postalCode: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: true,
    newsletter: true,
    smsUpdates: true,
    language: 'en'
  })

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState([])

  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        address: {
          street: userProfile.address?.street || '',
          city: userProfile.address?.city || '',
          county: userProfile.address?.county || '',
          postalCode: userProfile.address?.postalCode || ''
        },
        emergencyContact: {
          name: userProfile.emergencyContact?.name || '',
          phone: userProfile.emergencyContact?.phone || '',
          relationship: userProfile.emergencyContact?.relationship || ''
        }
      })

      setPreferences({
        notifications: userProfile.preferences?.notifications !== false,
        newsletter: userProfile.preferences?.newsletter !== false,
        smsUpdates: userProfile.preferences?.smsUpdates !== false,
        language: userProfile.preferences?.language || 'en'
      })
    }
  }, [userProfile])

  // Load activity logs
  useEffect(() => {
    if (user && activeTab === 'activity') {
      loadActivityLogs()
    }
  }, [user, activeTab])

  const loadActivityLogs = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const result = await userService.getUserActivityLogs(user.uid, 20)
      if (result.success) {
        setActivityLogs(result.data)
      }
    } catch (error) {
      console.error('Error loading activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateUserProfile(profileData)
      if (result.success) {
        setIsEditing(false)
        showMessage('success', 'Profile updated successfully!')
      } else {
        showMessage('error', result.error || 'Failed to update profile')
      }
    } catch (error) {
      showMessage('error', 'An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (result.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        showMessage('success', 'Password changed successfully!')
      } else {
        showMessage('error', result.error || 'Failed to change password')
      }
    } catch (error) {
      showMessage('error', 'An error occurred while changing password')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateUserPreferences(preferences)
      if (result.success) {
        showMessage('success', 'Preferences updated successfully!')
      } else {
        showMessage('error', result.error || 'Failed to update preferences')
      }
    } catch (error) {
      showMessage('error', 'An error occurred while updating preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    const currentPassword = window.prompt('Please enter your current password to confirm account deletion:')
    if (!currentPassword) return

    setLoading(true)

    try {
      const result = await deleteUserAccount(currentPassword)
      if (result.success) {
        showMessage('success', 'Account deleted successfully')
      } else {
        showMessage('error', result.error || 'Failed to delete account')
      }
    } catch (error) {
      showMessage('error', 'An error occurred while deleting account')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (!user || !userProfile) {
    return <div className="profile-loading">Loading profile...</div>
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {userProfile.profileImageUrl ? (
            <img src={userProfile.profileImageUrl} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {(userProfile.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h2>{userProfile.name || 'User'}</h2>
          <p>{user.email}</p>
          <span className={`status ${userProfile.accountStatus}`}>
            {userProfile.accountStatus || 'active'}
          </span>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={activeTab === 'security' ? 'active' : ''} 
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button 
          className={activeTab === 'preferences' ? 'active' : ''} 
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''} 
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="tab-header">
              <h3>Profile Information</h3>
              <button 
                className="edit-button"
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-section">
                <h4>Address</h4>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={profileData.address.street}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={profileData.address.city}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>County</label>
                    <input
                      type="text"
                      value={profileData.address.county}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, county: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      value={profileData.address.postalCode}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Emergency Contact</h4>
                <div className="form-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    value={profileData.emergencyContact.name}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      value={profileData.emergencyContact.phone}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Relationship</label>
                    <select
                      value={profileData.emergencyContact.relationship}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                      disabled={!isEditing}
                    >
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" disabled={loading} className="save-button">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-tab">
            <div className="security-section">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    minLength="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    minLength="6"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="change-password-button">
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            <div className="security-section danger-zone">
              <h3>Danger Zone</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                onClick={handleDeleteAccount}
                disabled={loading}
                className="delete-account-button"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-tab">
            <h3>Notification Preferences</h3>
            <form onSubmit={handlePreferencesSubmit}>
              <div className="preference-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                  />
                  <span>Email Notifications</span>
                </label>
              </div>

              <div className="preference-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.newsletter}
                    onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                  />
                  <span>Newsletter Subscription</span>
                </label>
              </div>

              <div className="preference-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.smsUpdates}
                    onChange={(e) => setPreferences(prev => ({ ...prev, smsUpdates: e.target.checked }))}
                  />
                  <span>SMS Updates</span>
                </label>
              </div>

              <div className="form-group">
                <label>Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="save-preferences-button">
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-tab">
            <h3>Account Activity</h3>
            {loading ? (
              <div className="loading">Loading activity...</div>
            ) : (
              <div className="activity-list">
                {activityLogs.length === 0 ? (
                  <p>No activity logged yet.</p>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="activity-item">
                      <div className="activity-info">
                        <span className="activity-type">{log.activity.replace(/_/g, ' ')}</span>
                        <span className="activity-date">{formatDate(log.timestamp)}</span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="activity-details">
                          {Object.entries(log.details).map(([key, value]) => (
                            <span key={key}>{key}: {Array.isArray(value) ? value.join(', ') : value}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
