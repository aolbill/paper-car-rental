import React, { useState } from 'react'

const NotificationCenterSimple = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications] = useState([])
  const unreadCount = 0

  return (
    <div className="notification-center">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          color: 'white'
        }}
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              fontSize: '12px',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>Notifications</h3>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔕</div>
              <p style={{ margin: 0 }}>No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div key={notification.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  {notification.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenterSimple
