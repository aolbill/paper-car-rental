import React, { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'
import './NotificationCenter.css'

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    preferences,
    updatePreferences,
    requestPermission
  } = useNotifications()
  
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    setShowSettings(false)
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Handle specific notification actions
    if (notification.type === 'message') {
      // Navigate to messages
      window.location.hash = 'messages'
    } else if (notification.type === 'booking') {
      // Navigate to bookings
      window.location.hash = 'bookings'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInSeconds = Math.floor((now - past) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return past.toLocaleDateString()
  }

  const handlePermissionRequest = async () => {
    const granted = await requestPermission()
    if (granted) {
      updatePreferences({ push: true })
    }
  }

  const recentNotifications = notifications.slice(0, 10)

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button 
        className="notification-bell"
        onClick={toggleDropdown}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          {!showSettings ? (
            <>
              <div className="notification-header">
                <h3>Notifications</h3>
                <div className="notification-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                  >
                    ⚙️
                  </button>
                  {notifications.length > 0 && (
                    <>
                      <button 
                        className="action-btn"
                        onClick={markAllAsRead}
                        title="Mark all as read"
                        disabled={unreadCount === 0}
                      >
                        ✓
                      </button>
                      <button 
                        className="action-btn"
                        onClick={clearAll}
                        title="Clear all"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="notification-list">
                {recentNotifications.length === 0 ? (
                  <div className="empty-notifications">
                    <div className="empty-icon">🔕</div>
                    <p>No notifications yet</p>
                    <small>You'll see updates about your bookings and messages here</small>
                  </div>
                ) : (
                  recentNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-content">
                        <div className="notification-icon">
                          {notification.type === 'booking' && '🚗'}
                          {notification.type === 'payment' && '💳'}
                          {notification.type === 'message' && '💬'}
                          {notification.type === 'reminder' && '⏰'}
                          {notification.type === 'success' && '✅'}
                          {notification.type === 'warning' && '⚠️'}
                          {notification.type === 'error' && '❌'}
                          {!['booking', 'payment', 'message', 'reminder', 'success', 'warning', 'error'].includes(notification.type) && 'ℹ️'}
                        </div>
                        
                        <div className="notification-text">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{formatTimeAgo(notification.timestamp)}</div>
                        </div>
                        
                        {!notification.read && (
                          <div className="notification-unread-dot"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 10 && (
                <div className="notification-footer">
                  <button className="view-all-btn">
                    View all {notifications.length} notifications
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="notification-settings">
              <div className="settings-header">
                <button 
                  className="back-btn"
                  onClick={() => setShowSettings(false)}
                >
                  ← Back
                </button>
                <h3>Notification Settings</h3>
              </div>

              <div className="settings-content">
                <div className="setting-group">
                  <h4>Delivery Methods</h4>
                  
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={preferences.inApp}
                        onChange={(e) => updatePreferences({ inApp: e.target.checked })}
                      />
                      <span className="checkmark"></span>
                      In-app notifications
                    </label>
                    <small>Show notifications within the app</small>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={preferences.push}
                        onChange={(e) => updatePreferences({ push: e.target.checked })}
                      />
                      <span className="checkmark"></span>
                      Browser notifications
                    </label>
                    <small>Show desktop notifications</small>
                    {preferences.push && 'Notification' in window && Notification.permission !== 'granted' && (
                      <button 
                        className="permission-btn"
                        onClick={handlePermissionRequest}
                      >
                        Grant Permission
                      </button>
                    )}
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={preferences.email}
                        onChange={(e) => updatePreferences({ email: e.target.checked })}
                      />
                      <span className="checkmark"></span>
                      Email notifications
                    </label>
                    <small>Receive notifications via email</small>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={preferences.sound}
                        onChange={(e) => updatePreferences({ sound: e.target.checked })}
                      />
                      <span className="checkmark"></span>
                      Sound alerts
                    </label>
                    <small>Play sound for new notifications</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
