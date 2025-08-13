// Real-time data service using WebSocket simulation
// In production, this would connect to a real WebSocket server

class RealTimeService {
  constructor() {
    this.subscribers = new Map()
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.simulationInterval = null
    
    // Start simulation
    this.startSimulation()
  }

  // Simulate WebSocket connection
  connect() {
    return new Promise((resolve) => {
      // Simulate connection delay
      setTimeout(() => {
        this.isConnected = true
        this.reconnectAttempts = 0
        console.log('📡 Real-time service connected')
        
        // Notify connection status
        this.broadcast('connection', { status: 'connected' })
        resolve()
      }, 500)
    })
  }

  // Simulate WebSocket disconnection
  disconnect() {
    this.isConnected = false
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
    }
    console.log('📡 Real-time service disconnected')
  }

  // Subscribe to real-time updates
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    this.subscribers.get(event).add(callback)
    
    console.log(`📡 Subscribed to ${event}`)
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(event, callback)
    }
  }

  // Unsubscribe from updates
  unsubscribe(event, callback) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).delete(callback)
      console.log(`📡 Unsubscribed from ${event}`)
    }
  }

  // Broadcast updates to subscribers
  broadcast(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in subscriber callback for ${event}:`, error)
        }
      })
    }
  }

  // Simulate real-time updates
  startSimulation() {
    this.connect().then(() => {
      // Simulate various real-time events
      this.simulationInterval = setInterval(() => {
        this.simulateRandomUpdates()
      }, 5000) // Every 5 seconds
    })
  }

  // Simulate random real-time updates
  simulateRandomUpdates() {
    if (!this.isConnected) return

    const events = [
      this.simulateBookingUpdate,
      this.simulateCarStatusUpdate,
      this.simulateNewMessage,
      this.simulateReviewUpdate,
      this.simulateCarLocationUpdate
    ]

    // Randomly trigger events
    if (Math.random() > 0.7) { // 30% chance
      const randomEvent = events[Math.floor(Math.random() * events.length)]
      randomEvent.call(this)
    }
  }

  // Simulate booking status changes
  simulateBookingUpdate() {
    const bookingStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled']
    const mockUpdate = {
      id: Math.floor(Math.random() * 1000),
      status: bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
      carId: Math.floor(Math.random() * 6) + 1,
      timestamp: new Date().toISOString(),
      message: 'Booking status updated'
    }
    
    this.broadcast('booking-update', mockUpdate)
    console.log('📡 Simulated booking update:', mockUpdate)
  }

  // Simulate car status changes
  simulateCarStatusUpdate() {
    const mockUpdate = {
      carId: Math.floor(Math.random() * 6) + 1,
      available: Math.random() > 0.3, // 70% chance of being available
      location: this.getRandomLocation(),
      timestamp: new Date().toISOString(),
      message: 'Car availability updated'
    }
    
    this.broadcast('car-status-update', mockUpdate)
    console.log('📡 Simulated car status update:', mockUpdate)
  }

  // Simulate new messages
  simulateNewMessage() {
    const mockMessage = {
      conversationId: Math.floor(Math.random() * 3) + 1,
      senderId: `renter${Math.floor(Math.random() * 3) + 1}`,
      message: this.getRandomMessage(),
      timestamp: new Date().toISOString()
    }
    
    this.broadcast('new-message', mockMessage)
    console.log('📡 Simulated new message:', mockMessage)
  }

  // Simulate review updates
  simulateReviewUpdate() {
    const mockReview = {
      carId: Math.floor(Math.random() * 6) + 1,
      rating: Math.floor(Math.random() * 5) + 1,
      reviewCount: Math.floor(Math.random() * 50) + 1,
      newRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      timestamp: new Date().toISOString()
    }
    
    this.broadcast('review-update', mockReview)
    console.log('📡 Simulated review update:', mockReview)
  }

  // Simulate car location updates (for GPS tracking)
  simulateCarLocationUpdate() {
    const mockLocation = {
      carId: Math.floor(Math.random() * 6) + 1,
      latitude: -1.2921 + (Math.random() - 0.5) * 0.1, // Around Nairobi
      longitude: 36.8219 + (Math.random() - 0.5) * 0.1,
      address: this.getRandomLocation(),
      timestamp: new Date().toISOString(),
      speed: Math.floor(Math.random() * 80), // km/h
      isMoving: Math.random() > 0.4
    }
    
    this.broadcast('car-location-update', mockLocation)
    console.log('📡 Simulated location update:', mockLocation)
  }

  // Send real-time notification
  sendNotification(type, data) {
    const notification = {
      id: Date.now(),
      type,
      data,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    this.broadcast('notification', notification)
    console.log('📡 Sent notification:', notification)
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      subscribers: Array.from(this.subscribers.keys()),
      reconnectAttempts: this.reconnectAttempts
    }
  }

  // Force reconnection
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('📡 Max reconnection attempts reached')
      return false
    }

    this.disconnect()
    this.reconnectAttempts++
    
    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
    
    return true
  }

  // Helper methods
  getRandomLocation() {
    const locations = [
      'Nairobi CBD',
      'Westlands',
      'Karen',
      'Kilimani',
      'Upper Hill',
      'Gigiri',
      'Lavington',
      'Parklands',
      'JKIA',
      'Wilson Airport'
    ]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  getRandomMessage() {
    const messages = [
      'Hi, is the car still available?',
      'I need to extend my rental period',
      'Can we change the pickup location?',
      'The car has been great so far!',
      'I have a question about the insurance',
      'When should I return the car?',
      'Thank you for the excellent service',
      'I need roadside assistance',
      'The GPS is not working properly',
      'Can I add an additional driver?'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Manual triggers for testing
  triggerBookingUpdate(bookingData) {
    this.broadcast('booking-update', {
      ...bookingData,
      timestamp: new Date().toISOString()
    })
  }

  triggerCarUpdate(carData) {
    this.broadcast('car-status-update', {
      ...carData,
      timestamp: new Date().toISOString()
    })
  }

  triggerMessageUpdate(messageData) {
    this.broadcast('new-message', {
      ...messageData,
      timestamp: new Date().toISOString()
    })
  }
}

// Create singleton instance
const realTimeService = new RealTimeService()

export default realTimeService
