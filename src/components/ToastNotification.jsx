import React from 'react'
import { useNotifications } from '../context/NotificationContext'
import './ToastNotification.css'

const ToastNotification = () => {
  const { toasts, removeToast } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}

const ToastItem = ({ toast, onRemove }) => {
  const handleClose = () => {
    onRemove(toast.id)
  }

  const handleAction = () => {
    if (toast.action?.callback) {
      toast.action.callback()
    }
    onRemove(toast.id)
  }

  const getToastIcon = () => {
    if (toast.icon) return toast.icon
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      booking: '🚗',
      payment: '💳',
      message: '💬',
      reminder: '⏰'
    }
    
    return icons[toast.type] || 'ℹ️'
  }

  return (
    <div className={`toast-item toast-${toast.type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getToastIcon()}
        </div>
        
        <div className="toast-text">
          {toast.title && (
            <div className="toast-title">{toast.title}</div>
          )}
          <div className="toast-message">{toast.message}</div>
        </div>
        
        {toast.action && (
          <button 
            className="toast-action"
            onClick={handleAction}
          >
            {toast.action.label}
          </button>
        )}
        
        <button 
          className="toast-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
      
      {toast.autoRemove !== false && (
        <div 
          className="toast-progress" 
          style={{ 
            animationDuration: `${toast.duration || 5000}ms` 
          }}
        />
      )}
    </div>
  )
}

export default ToastNotification
