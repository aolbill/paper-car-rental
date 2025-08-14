import { supabase } from '../lib/supabase'

// Enhanced real-time service that supports both Supabase real-time and WebSocket simulation
class RealTimeServiceUpgraded {
  constructor() {
    this.subscribers = new Map()
    this.isConnected = false
    this.useSupabase = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.simulationInterval = null
    this.supabaseChannels = new Map()
    
    this.init()
  }

  async init() {
    try {
      // Check if Supabase is properly configured
      const { data } = await supabase.auth.getSession()
      this.useSupabase = true
      console.log('🚀 Real-time service using Supabase')
      await this.connectSupabase()
    } catch (error) {
      console.warn('🚀 Real-time service falling back to simulation mode:', error.message)
      this.useSupabase = false
      this.startSimulation()
    }
  }

  // Supabase real-time connection
  async connectSupabase() {
    try {
      this.isConnected = true
      this.reconnectAttempts = 0
      console.log('📡 Supabase real-time connected')
      
      // Notify connection status
      this.broadcast('connection', { status: 'connected', provider: 'supabase' })
    } catch (error) {
      console.error('📡 Supabase connection failed:', error)
      this.fallbackToSimulation()
    }
  }

  // Subscribe to real-time updates
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    this.subscribers.get(event).add(callback)
    
    console.log(`📡 Subscribed to ${event} (${this.useSupabase ? 'Supabase' : 'Simulation'})`)
    
    // Set up Supabase subscription if using Supabase
    if (this.useSupabase && this.shouldUseSupabaseChannel(event)) {
      this.setupSupabaseSubscription(event)
    }
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(event, callback)
    }
  }

  // Determine if event should use Supabase real-time
  shouldUseSupabaseChannel(event) {
    const supabaseEvents = [
      'new-message',
      'booking-update', 
      'car-status-update',
      'review-update',
      'payment-update',
      'conversation-update'
    ]
    return supabaseEvents.includes(event)
  }

  // Set up Supabase subscription for specific events
  setupSupabaseSubscription(event) {
    if (this.supabaseChannels.has(event)) {
      return // Already subscribed
    }

    let channel
    
    switch (event) {
      case 'new-message':
        channel = supabase
          .channel('messages-channel')
          .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
              this.broadcast('new-message', {
                conversationId: payload.new.conversation_id,
                senderId: payload.new.sender_id,
                message: payload.new.content,
                timestamp: payload.new.created_at,
                messageType: payload.new.message_type
              })
            }
          )
          .subscribe()
        break

      case 'booking-update':
        channel = supabase
          .channel('bookings-channel')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            (payload) => {
              const eventType = payload.eventType
              const booking = eventType === 'DELETE' ? payload.old : payload.new
              
              this.broadcast('booking-update', {
                id: booking.id,
                status: booking.status,
                carId: booking.car_id,
                customerId: booking.customer_id,
                timestamp: new Date().toISOString(),
                eventType,
                message: `Booking ${eventType}: ${booking.status}`
              })
            }
          )
          .subscribe()
        break

      case 'car-status-update':
        channel = supabase
          .channel('cars-channel')
          .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'cars' },
            (payload) => {
              this.broadcast('car-status-update', {
                carId: payload.new.id,
                available: payload.new.is_available,
                status: payload.new.status,
                timestamp: new Date().toISOString(),
                message: 'Car availability updated'
              })
            }
          )
          .subscribe()
        break

      case 'review-update':
        channel = supabase
          .channel('reviews-channel')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'reviews' },
            (payload) => {
              this.broadcast('review-update', {
                carId: payload.new.car_id,
                rating: payload.new.rating,
                reviewId: payload.new.id,
                timestamp: payload.new.created_at
              })
            }
          )
          .subscribe()
        break

      case 'payment-update':
        channel = supabase
          .channel('payments-channel')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'payments' },
            (payload) => {
              const payment = payload.new || payload.old
              this.broadcast('payment-update', {
                id: payment.id,
                bookingId: payment.booking_id,
                status: payment.status,
                amount: payment.amount,
                timestamp: new Date().toISOString(),
                eventType: payload.eventType
              })
            }
          )
          .subscribe()
        break

      case 'conversation-update':
        channel = supabase
          .channel('conversations-channel')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'conversations' },
            (payload) => {
              const conversation = payload.new || payload.old
              this.broadcast('conversation-update', {
                id: conversation.id,
                status: conversation.status,
                customerId: conversation.customer_id,
                timestamp: new Date().toISOString(),
                eventType: payload.eventType
              })
            }
          )
          .subscribe()
        break

      default:
        return
    }

    if (channel) {
      this.supabaseChannels.set(event, channel)
      console.log(`📡 Supabase channel setup for ${event}`)
    }
  }

  // Unsubscribe from updates
  unsubscribe(event, callback) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).delete(callback)
      
      // If no more subscribers for this event, cleanup Supabase channel
      if (this.subscribers.get(event).size === 0 && this.supabaseChannels.has(event)) {
        const channel = this.supabaseChannels.get(event)
        supabase.removeChannel(channel)
        this.supabaseChannels.delete(event)
        console.log(`📡 Cleaned up Supabase channel for ${event}`)
      }
      
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

  // Manual triggers for testing (works in both modes)
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

  triggerPaymentUpdate(paymentData) {
    this.broadcast('payment-update', {
      ...paymentData,
      timestamp: new Date().toISOString()
    })
  }

  // Fallback to simulation mode
  fallbackToSimulation() {
    this.useSupabase = false
    this.startSimulation()
  }

  // Simulate WebSocket connection (fallback mode)
  connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true
        this.reconnectAttempts = 0
        console.log('📡 Real-time service connected (simulation mode)')
        
        this.broadcast('connection', { status: 'connected', provider: 'simulation' })
        resolve()
      }, 500)
    })
  }

  // Simulate WebSocket disconnection
  disconnect() {
    this.isConnected = false
    
    // Cleanup Supabase channels
    this.supabaseChannels.forEach(channel => {
      supabase.removeChannel(channel)
    })
    this.supabaseChannels.clear()
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
    }
    
    console.log('📡 Real-time service disconnected')
  }

  // Start simulation mode
  startSimulation() {
    this.connect().then(() => {
      // Simulate various real-time events only if not using Supabase
      this.simulationInterval = setInterval(() => {
        if (!this.useSupabase) {
          this.simulateRandomUpdates()
        }
      }, 8000) // Reduced frequency when in simulation
    })
  }

  // Simulate random real-time updates (only used in simulation mode)
  simulateRandomUpdates() {
    if (!this.isConnected || this.useSupabase) return

    const events = [
      () => this.simulateBookingUpdate(),
      () => this.simulateCarStatusUpdate(), 
      () => this.simulateNewMessage(),
      () => this.simulateReviewUpdate(),
      () => this.simulatePaymentUpdate()
    ]

    // Randomly trigger events with lower probability
    if (Math.random() > 0.8) { // 20% chance
      const randomEvent = events[Math.floor(Math.random() * events.length)]
      randomEvent()
    }
  }

  // Simulation methods (unchanged from original)
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

  simulateCarStatusUpdate() {
    const mockUpdate = {
      carId: Math.floor(Math.random() * 6) + 1,
      available: Math.random() > 0.3,
      location: this.getRandomLocation(),
      timestamp: new Date().toISOString(),
      message: 'Car availability updated'
    }
    
    this.broadcast('car-status-update', mockUpdate)
    console.log('📡 Simulated car status update:', mockUpdate)
  }

  simulateNewMessage() {
    const mockMessage = {
      conversationId: Math.floor(Math.random() * 3) + 1,
      senderId: 'admin',
      message: this.getRandomMessage(),
      timestamp: new Date().toISOString()
    }
    
    this.broadcast('new-message', mockMessage)
    console.log('📡 Simulated new message:', mockMessage)
  }

  simulateReviewUpdate() {
    const mockReview = {
      carId: Math.floor(Math.random() * 6) + 1,
      rating: Math.floor(Math.random() * 5) + 1,
      reviewCount: Math.floor(Math.random() * 50) + 1,
      newRating: (Math.random() * 2 + 3).toFixed(1),
      timestamp: new Date().toISOString()
    }
    
    this.broadcast('review-update', mockReview)
    console.log('📡 Simulated review update:', mockReview)
  }

  simulatePaymentUpdate() {
    const mockPayment = {
      id: Math.floor(Math.random() * 1000),
      bookingId: Math.floor(Math.random() * 100),
      status: 'completed',
      amount: Math.floor(Math.random() * 50000) + 10000,
      timestamp: new Date().toISOString()
    }
    
    this.broadcast('payment-update', mockPayment)
    console.log('📡 Simulated payment update:', mockPayment)
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      provider: this.useSupabase ? 'supabase' : 'simulation',
      subscribers: Array.from(this.subscribers.keys()),
      supabaseChannels: Array.from(this.supabaseChannels.keys()),
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
      if (this.useSupabase) {
        this.connectSupabase()
      } else {
        this.connect()
      }
    }, this.reconnectDelay * this.reconnectAttempts)
    
    return true
  }

  // Helper methods
  getRandomLocation() {
    const locations = [
      'Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Upper Hill',
      'Gigiri', 'Lavington', 'Parklands', 'JKIA', 'Wilson Airport'
    ]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  getRandomMessage() {
    const messages = [
      'Thank you for your inquiry! We\'ll get back to you shortly.',
      'Your booking has been confirmed. Looking forward to serving you!',
      'Is there anything else I can help you with?',
      'Thank you for choosing our service!',
      'Your payment has been processed successfully.',
      'Please let us know if you have any questions.',
      'We appreciate your business!',
      'Your car is ready for pickup.',
      'Safe travels and enjoy your rental!',
      'Thank you for the positive feedback!'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Check if using Supabase
  isUsingSupabase() {
    return this.useSupabase
  }
}

// Create singleton instance
const realTimeServiceUpgraded = new RealTimeServiceUpgraded()

export default realTimeServiceUpgraded
