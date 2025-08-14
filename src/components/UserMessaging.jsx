import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import messagingService from '../services/messagingService'
import './UserMessaging.css'

const UserMessaging = ({ carId, carName, onClose }) => {
  const { user } = useAuth()
  const { showMessageNotification } = useNotifications()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)

  useEffect(() => {
    if (!user) return

    // Initialize conversation
    initializeConversation()

    // Subscribe to real-time message updates
    const unsubscribeMessages = realTimeService.subscribe('new-message', (messageData) => {
      if (messageData.conversationId === conversationId) {
        const newMsg = {
          id: Date.now(),
          senderId: messageData.senderId,
          senderName: messageData.senderId === 'admin' ? 'CarRental Support' : user.name,
          message: messageData.message,
          timestamp: messageData.timestamp,
          type: 'text'
        }
        
        setMessages(prev => [...prev, newMsg])
        
        // Show notification if message is from admin
        if (messageData.senderId === 'admin') {
          showNotification('New message from support')
        }
      }
    })

    // Subscribe to connection status
    const unsubscribeConnection = realTimeService.subscribe('connection', (data) => {
      setIsConnected(data.status === 'connected')
    })

    return () => {
      unsubscribeMessages()
      unsubscribeConnection()
    }
  }, [user, conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeConversation = async () => {
    try {
      setIsLoading(true)

      // Create or get existing conversation using messaging service
      const { data: conversation, error } = await messagingService.createConversation(
        user.id,
        carId,
        carName
      )

      if (error) {
        console.error('Error creating conversation:', error)
        return
      }

      setConversationId(conversation.id)

      // Load existing messages
      const { data: existingMessages } = await messagingService.getMessages(conversation.id)

      if (existingMessages && existingMessages.length > 0) {
        setMessages(existingMessages.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.users?.name || (msg.sender_id === 'admin' ? 'CarRental Support' : user.name),
          message: msg.content,
          timestamp: msg.created_at,
          type: msg.message_type || 'text'
        })))
      } else {
        // Send initial message if no existing messages
        await messagingService.sendMessage(
          conversation.id,
          user.id,
          `Hi, I'm interested in renting the ${carName}. Is it available?`
        )
      }

      setIsConnected(messagingService.isSupabaseConnected())
    } catch (error) {
      console.error('Error initializing conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const showNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CarRental', {
        body: message,
        icon: '/favicon.ico'
      })
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      // Send message using messaging service
      const { data: sentMessage, error } = await messagingService.sendMessage(
        conversationId,
        user.id,
        messageText
      )

      if (error) {
        console.error('Error sending message:', error)
        setNewMessage(messageText) // Restore message if sending failed
        return
      }

      // Add message to local state
      const displayMessage = {
        id: sentMessage.id,
        senderId: user.id,
        senderName: user.name,
        message: messageText,
        timestamp: sentMessage.created_at,
        type: 'text'
      }

      setMessages(prev => [...prev, displayMessage])

      messageInputRef.current?.focus()
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageText) // Restore message if sending failed
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!user) {
    return (
      <div className="user-messaging">
        <div className="auth-required">
          <h3>Login Required</h3>
          <p>Please log in to chat with our support team.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-messaging">
      <div className="messaging-header">
        <div className="header-info">
          <h3>Support Chat</h3>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        )}
      </div>

      <div className="chat-info">
        <p>Discussing: <strong>{carName}</strong></p>
        <small>Our support team typically responds within 5 minutes</small>
      </div>

      <div className="messages-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading conversation...</p>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`message ${message.senderId === user.id ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">{message.senderName}</span>
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                  </div>
                  <p className="message-text">{message.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="message-input-container">
        <div className="message-input-wrapper">
          <textarea
            ref={messageInputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
            rows={2}
            disabled={!isConnected}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="send-button"
          >
            {isConnected ? 'Send' : 'Connecting...'}
          </button>
        </div>
        
        <div className="input-help">
          <small>Press Enter to send, Shift+Enter for new line</small>
        </div>
      </div>
    </div>
  )
}

export default UserMessaging
