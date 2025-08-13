import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import realTimeService from '../../services/realTimeService'
import './AdminMessaging.css'

// Mock data - replace with real database
const mockConversations = [
  {
    id: 1,
    renterId: 'renter1',
    renterName: 'James Mwangi',
    renterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    carId: 1,
    carName: 'Toyota Vitz',
    lastMessage: 'Is the car still available for next week?',
    lastMessageTime: '2024-01-20T10:30:00Z',
    unreadCount: 2,
    status: 'active'
  },
  {
    id: 2,
    renterId: 'renter2',
    renterName: 'Sarah Kiprotich',
    renterAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1ab?w=64&h=64&fit=crop&crop=face',
    carId: 2,
    carName: 'Nissan X-Trail',
    lastMessage: 'Thank you for the excellent service!',
    lastMessageTime: '2024-01-19T15:45:00Z',
    unreadCount: 0,
    status: 'completed'
  },
  {
    id: 3,
    renterId: 'renter3',
    renterName: 'Peter Ochieng',
    renterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    carId: 4,
    carName: 'Mercedes C-Class',
    lastMessage: 'I need help with the pickup location',
    lastMessageTime: '2024-01-18T09:15:00Z',
    unreadCount: 1,
    status: 'pending'
  }
]

const mockMessages = {
  1: [
    {
      id: 1,
      senderId: 'renter1',
      senderName: 'James Mwangi',
      message: 'Hi, I\'m interested in renting the Toyota Vitz for next week. Is it available?',
      timestamp: '2024-01-20T09:00:00Z',
      type: 'text'
    },
    {
      id: 2,
      senderId: 'admin',
      senderName: 'CarRental Admin',
      message: 'Hello James! Yes, the Toyota Vitz is available for next week. What dates were you looking at?',
      timestamp: '2024-01-20T09:15:00Z',
      type: 'text'
    },
    {
      id: 3,
      senderId: 'renter1',
      senderName: 'James Mwangi',
      message: 'I need it from Monday 22nd to Friday 26th. Is the pickup location flexible?',
      timestamp: '2024-01-20T10:30:00Z',
      type: 'text'
    }
  ],
  2: [
    {
      id: 4,
      senderId: 'renter2',
      senderName: 'Sarah Kiprotich',
      message: 'The Nissan X-Trail was perfect for our safari trip. Clean and reliable!',
      timestamp: '2024-01-19T15:45:00Z',
      type: 'text'
    },
    {
      id: 5,
      senderId: 'admin',
      senderName: 'CarRental Admin',
      message: 'Thank you for the feedback, Sarah! We\'re glad you enjoyed your trip. Please consider leaving a review.',
      timestamp: '2024-01-19T16:00:00Z',
      type: 'text'
    }
  ],
  3: [
    {
      id: 6,
      senderId: 'renter3',
      senderName: 'Peter Ochieng',
      message: 'I booked the Mercedes C-Class but I\'m not sure about the pickup location. Can we meet at JKIA instead?',
      timestamp: '2024-01-18T09:15:00Z',
      type: 'text'
    }
  ]
}

const AdminMessaging = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)

  useEffect(() => {
    // Load messages for all conversations
    setMessages(mockMessages)

    // Subscribe to real-time message updates
    const unsubscribeMessages = realTimeService.subscribe('new-message', (messageData) => {
      const { conversationId, senderId, message, timestamp } = messageData

      // Add new message to the conversation
      setMessages(prev => ({
        ...prev,
        [conversationId]: [
          ...(prev[conversationId] || []),
          {
            id: Date.now(),
            senderId,
            senderName: senderId === 'admin' ? 'Admin' : 'Renter',
            message,
            timestamp,
            type: 'text'
          }
        ]
      }))

      // Update conversation list with new message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: message,
                lastMessageTime: timestamp,
                unreadCount: senderId !== 'admin' ? (conv.unreadCount || 0) + 1 : 0
              }
            : conv
        )
      )

      // Show notification if not the current conversation
      if (!selectedConversation || selectedConversation.id !== conversationId) {
        realTimeService.sendNotification('new-message', {
          conversationId,
          message: `New message: ${message.substring(0, 50)}...`
        })
      }
    })

    // Subscribe to connection status
    const unsubscribeConnection = realTimeService.subscribe('connection', (data) => {
      console.log('Real-time connection status:', data.status)
    })

    return () => {
      unsubscribeMessages()
      unsubscribeConnection()
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom()
  }, [messages, selectedConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message = {
      id: Date.now(),
      senderId: 'admin',
      senderName: user?.name || 'Admin',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    // Add message to conversation
    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] || []),
        message
      ]
    }))

    // Update last message in conversation list
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              lastMessage: newMessage.trim(),
              lastMessageTime: new Date().toISOString()
            }
          : conv
      )
    )

    setNewMessage('')
    messageInputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations
    .filter(conv => {
      if (filter === 'unread') return conv.unreadCount > 0
      if (filter === 'active') return conv.status === 'active'
      if (filter === 'completed') return conv.status === 'completed'
      return true
    })
    .filter(conv => 
      conv.renterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.carName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  return (
    <div className="admin-messaging">
      <div className="messaging-header">
        <h2>Messages</h2>
        <div className="header-stats">
          <span className="total-conversations">{conversations.length} conversations</span>
          {totalUnread > 0 && (
            <span className="unread-badge">{totalUnread} unread</span>
          )}
        </div>
      </div>

      <div className="messaging-container">
        {/* Sidebar - Conversations List */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({conversations.filter(c => c.unreadCount > 0).length})
              </button>
              <button 
                className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className="conversation-avatar">
                  <img src={conversation.renterAvatar} alt={conversation.renterName} />
                  <div className={`status-dot ${conversation.status}`}></div>
                </div>
                
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h4 className="renter-name">{conversation.renterName}</h4>
                    <span className="last-time">{formatTime(conversation.lastMessageTime)}</span>
                  </div>
                  
                  <div className="conversation-meta">
                    <span className="car-name">{conversation.carName}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-count">{conversation.unreadCount}</span>
                    )}
                  </div>
                  
                  <p className="last-message">{conversation.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <img 
                    src={selectedConversation.renterAvatar} 
                    alt={selectedConversation.renterName}
                    className="chat-avatar"
                  />
                  <div className="chat-header-text">
                    <h3>{selectedConversation.renterName}</h3>
                    <p>Rental: {selectedConversation.carName}</p>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <button className="action-btn">📞 Call</button>
                  <button className="action-btn">📧 Email</button>
                  <button className="action-btn">🚗 View Booking</button>
                </div>
              </div>

              <div className="messages-container">
                {messages[selectedConversation.id]?.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === 'admin' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.message}</p>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
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
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="send-button"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <div className="no-conversation-content">
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start messaging with renters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminMessaging
