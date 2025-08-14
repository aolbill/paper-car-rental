import React, { useState, useEffect } from 'react'
import UserMessaging from './UserMessaging'
import realTimeService from '../services/realTimeService'
import './SupportChatButton.css'

const SupportChatButton = ({ carId, carName }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Subscribe to new messages to show notification badge
    const unsubscribeMessages = realTimeService.subscribe('new-message', (messageData) => {
      // Show unread indicator if chat is closed and message is from admin
      if (!isChatOpen && messageData.senderId === 'admin') {
        setHasUnreadMessages(true)
        
        // Request notification permission and show notification
        if ('Notification' in window) {
          if (Notification.permission === 'default') {
            Notification.requestPermission()
          }
          
          if (Notification.permission === 'granted') {
            new Notification('New message from CarRental Support', {
              body: messageData.message.length > 50 
                ? messageData.message.substring(0, 50) + '...' 
                : messageData.message,
              icon: '/favicon.ico',
              tag: 'support-message'
            })
          }
        }
      }
    })

    return () => {
      unsubscribeMessages()
    }
  }, [isChatOpen])

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
    if (!isChatOpen) {
      setHasUnreadMessages(false)
    }
  }

  const closeChat = () => {
    setIsChatOpen(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="support-chat-button-container">
        <button 
          className={`support-chat-button ${isChatOpen ? 'active' : ''}`}
          onClick={toggleChat}
          aria-label="Open support chat"
        >
          {isChatOpen ? (
            <span className="chat-icon">✕</span>
          ) : (
            <>
              <span className="chat-icon">💬</span>
              {hasUnreadMessages && <span className="unread-badge"></span>}
            </>
          )}
        </button>
        
        {!isChatOpen && (
          <div className="chat-tooltip">
            Need help? Chat with us!
            {hasUnreadMessages && <div className="tooltip-badge">New message</div>}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="support-chat-overlay">
          <div className="support-chat-window">
            <UserMessaging 
              carId={carId} 
              carName={carName} 
              onClose={closeChat}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default SupportChatButton
