import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import realTimeService from '../services/realTimeService'
import emailService from '../services/emailService'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    inApp: true,
    sound: true
  })

  // Toast auto-remove timer
  useEffect(() => {
    const timers = toasts.map(toast => {
      if (toast.autoRemove !== false) {
        return setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration || 5000)
      }
      return null
    }).filter(Boolean)

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [toasts])

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsubscribe = realTimeService.subscribe('notification', (notificationData) => {
      addNotification({
        type: notificationData.type,
        title: notificationData.data.title || 'New Notification',
        message: notificationData.data.message,
        data: notificationData.data,
        timestamp: notificationData.timestamp
      })
    })

    // Subscribe to various real-time events
    const unsubscribeBooking = realTimeService.subscribe('booking-update', (data) => {
      addNotification({
        type: 'booking',
        title: 'Booking Update',
        message: `Your booking status has been updated to ${data.status}`,
        data,
        timestamp: data.timestamp
      })
    })

    const unsubscribeMessage = realTimeService.subscribe('new-message', (data) => {
      if (data.senderId === 'admin') {
        addNotification({
          type: 'message',
          title: 'New Message',
          message: data.message.length > 50 ? data.message.substring(0, 50) + '...' : data.message,
          data,
          timestamp: data.timestamp
        })
      }
    })

    return () => {
      unsubscribe()
      unsubscribeBooking()
      unsubscribeMessage()
    }
  }, [])

  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      read: false,
      timestamp: notification.timestamp || new Date().toISOString()
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Show toast if in-app notifications are enabled
    if (preferences.inApp) {
      addToast({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        icon: getNotificationIcon(notification.type)
      })
    }

    // Play sound if enabled
    if (preferences.sound) {
      playNotificationSound(notification.type)
    }

    // Show browser notification if permission granted
    if (preferences.push && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type
      })
    }

    return newNotification.id
  }, [preferences])

  // Add toast notification
  const addToast = useCallback((toast) => {
    const newToast = {
      id: Date.now() + Math.random(),
      type: toast.type || 'info',
      title: toast.title,
      message: toast.message,
      icon: toast.icon,
      duration: toast.duration || 5000,
      autoRemove: toast.autoRemove !== false,
      action: toast.action,
      timestamp: new Date().toISOString()
    }

    setToasts(prev => [...prev, newToast])
    return newToast.id
  }, [])

  // Remove toast
  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId))
  }, [])

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Update preferences
  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }))
    
    // Store in localStorage
    localStorage.setItem('notificationPreferences', JSON.stringify({
      ...preferences,
      ...newPreferences
    }))
  }, [preferences])

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('notificationPreferences')
    if (stored) {
      try {
        setPreferences(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to load notification preferences:', error)
      }
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }, [])

  // Utility functions
  const getNotificationIcon = (type) => {
    const icons = {
      booking: '🚗',
      payment: '💳',
      message: '💬',
      reminder: '⏰',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    }
    return icons[type] || 'ℹ️'
  }

  const playNotificationSound = (type) => {
    try {
      // Different sounds for different notification types
      const audio = new Audio()
      
      switch (type) {
        case 'message':
          audio.src = '/sounds/message.mp3'
          break
        case 'booking':
          audio.src = '/sounds/booking.mp3'
          break
        case 'payment':
          audio.src = '/sounds/payment.mp3'
          break
        default:
          audio.src = '/sounds/notification.mp3'
      }
      
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play errors (user hasn't interacted with page)
      })
    } catch (error) {
      // Ignore audio errors
    }
  }

  // Pre-defined notification methods for common use cases
  const showSuccess = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showError = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showWarning = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showInfo = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showBookingNotification = useCallback((bookingData) => {
    const message = `Booking ${bookingData.status}: ${bookingData.carName}`
    
    addNotification({
      type: 'booking',
      title: 'Booking Update',
      message,
      data: bookingData
    })

    // Send email notification if enabled
    if (preferences.email) {
      emailService.sendStatusUpdate({
        customerEmail: bookingData.customerEmail,
        customerName: bookingData.customerName,
        status: bookingData.status
      })
    }
  }, [addNotification, preferences.email])

  const showPaymentNotification = useCallback((paymentData) => {
    addNotification({
      type: 'payment',
      title: 'Payment Confirmed',
      message: `Payment of KES ${paymentData.amount.toLocaleString()} received`,
      data: paymentData
    })

    // Send email confirmation if enabled
    if (preferences.email) {
      emailService.sendPaymentConfirmation(paymentData)
    }
  }, [addNotification, preferences.email])

  const showMessageNotification = useCallback((messageData) => {
    addNotification({
      type: 'message',
      title: 'New Message',
      message: messageData.message,
      data: messageData
    })

    // Send email notification if enabled
    if (preferences.email) {
      emailService.sendSupportMessage({
        customerEmail: messageData.customerEmail,
        customerName: messageData.customerName,
        message: messageData.message
      })
    }
  }, [addNotification, preferences.email])

  const value = {
    // State
    notifications,
    toasts,
    unreadCount,
    preferences,
    
    // Actions
    addNotification,
    addToast,
    removeToast,
    markAsRead,
    markAllAsRead,
    clearAll,
    updatePreferences,
    requestPermission,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showBookingNotification,
    showPaymentNotification,
    showMessageNotification,
    
    // Utilities
    getNotificationIcon
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
