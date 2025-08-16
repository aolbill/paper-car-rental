import { supabase } from '../lib/supabase'
import realTimeService from './realTimeService'

class MessagingService {
  constructor() {
    this.isConnected = false
    this.init()
  }

  async init() {
    // Check if Supabase is properly configured
    if (!supabase) {
      console.warn('📨 Messaging service using mock mode: Supabase not configured')
      this.isConnected = false
      return
    }

    try {
      const { data } = await supabase.auth.getSession()
      this.isConnected = true
      console.log('📨 Messaging service initialized with Supabase')
    } catch (error) {
      console.warn('📨 Messaging service using mock mode:', error.message)
      this.isConnected = false
    }
  }

  // Create or get existing conversation
  async createConversation(userId, carId, carName, subject = null) {
    try {
      if (this.isConnected && supabase) {
        // Check for existing conversation
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .eq('customer_id', userId)
          .eq('car_id', carId)
          .eq('status', 'active')
          .single()

        if (existing) {
          return { data: existing, error: null }
        }

        // Create new conversation
        const conversationData = {
          customer_id: userId,
          car_id: carId,
          subject: subject || `Inquiry about ${carName}`,
          status: 'active',
          priority: 'normal',
          last_message_at: new Date().toISOString(),
          unread_count_customer: 0,
          unread_count_admin: 1 // Admin needs to see new conversation
        }

        const { data, error } = await supabase
          .from('conversations')
          .insert([conversationData])
          .select()
          .single()

        if (!error) {
          // Send initial system message
          await this.sendMessage(data.id, 'system', 
            `Conversation started about ${carName}. Our support team will respond shortly.`
          )
        }

        return { data, error }
      } else {
        // Mock mode fallback
        const mockConversation = {
          id: `conv_${Date.now()}`,
          customer_id: userId,
          car_id: carId,
          subject: subject || `Inquiry about ${carName}`,
          status: 'active',
          created_at: new Date().toISOString()
        }
        return { data: mockConversation, error: null }
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      return { data: null, error }
    }
  }

  // Send a message
  async sendMessage(conversationId, senderId, content, messageType = 'text') {
    try {
      if (this.isConnected) {
        const messageData = {
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: messageType,
          is_read: false,
          is_system_message: senderId === 'system'
        }

        const { data, error } = await supabase
          .from('messages')
          .insert([messageData])
          .select()
          .single()

        if (!error) {
          // Update conversation with last message info
          await supabase
            .from('conversations')
            .update({
              last_message_at: new Date().toISOString(),
              last_message_preview: content.substring(0, 100),
              unread_count_customer: senderId === 'admin' ? 1 : 0,
              unread_count_admin: senderId !== 'admin' && senderId !== 'system' ? 1 : 0
            })
            .eq('id', conversationId)

          // Trigger real-time notification
          realTimeService.triggerMessageUpdate({
            conversationId,
            senderId,
            message: content,
            timestamp: data.created_at
          })
        }

        return { data, error }
      } else {
        // Mock mode fallback
        const mockMessage = {
          id: Date.now(),
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: messageType,
          created_at: new Date().toISOString()
        }

        // Simulate real-time update
        setTimeout(() => {
          realTimeService.triggerMessageUpdate({
            conversationId,
            senderId,
            message: content,
            timestamp: mockMessage.created_at
          })
        }, 100)

        return { data: mockMessage, error: null }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return { data: null, error }
    }
  }

  // Get conversation messages
  async getMessages(conversationId) {
    try {
      if (this.isConnected) {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            content,
            message_type,
            is_read,
            is_system_message,
            created_at,
            users(name, avatar_url)
          `)
          .eq('conversation_id', conversationId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })

        return { data, error }
      } else {
        // Mock data fallback
        const mockMessages = [
          {
            id: 1,
            sender_id: 'user_123',
            content: 'Hi, I\'m interested in this car. Is it available?',
            message_type: 'text',
            created_at: new Date(Date.now() - 10000).toISOString(),
            users: { name: 'John Doe', avatar_url: null }
          }
        ]
        return { data: mockMessages, error: null }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      return { data: [], error }
    }
  }

  // Get user conversations
  async getUserConversations(userId) {
    try {
      if (this.isConnected) {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            subject,
            status,
            priority,
            last_message_at,
            last_message_preview,
            unread_count_customer,
            created_at,
            cars(id, name, primary_image_url)
          `)
          .eq('customer_id', userId)
          .order('last_message_at', { ascending: false })

        return { data, error }
      } else {
        // Mock data fallback
        const mockConversations = []
        return { data: mockConversations, error: null }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return { data: [], error }
    }
  }

  // Mark messages as read
  async markAsRead(conversationId, userId) {
    try {
      if (this.isConnected) {
        await supabase
          .from('messages')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', userId)

        await supabase
          .from('conversations')
          .update({ unread_count_customer: 0 })
          .eq('id', conversationId)
          .eq('customer_id', userId)

        return { error: null }
      } else {
        // Mock mode - just return success
        return { error: null }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return { error }
    }
  }

  // Subscribe to real-time message updates
  subscribeToConversation(conversationId, callback) {
    if (this.isConnected) {
      const subscription = supabase
        .channel(`conversation-${conversationId}`)
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            callback(payload.new)
          }
        )
        .subscribe()

      return () => subscription.unsubscribe()
    } else {
      // Mock mode - use existing real-time service
      return realTimeService.subscribe('new-message', (messageData) => {
        if (messageData.conversationId === conversationId) {
          callback({
            id: messageData.id || Date.now(),
            sender_id: messageData.senderId,
            content: messageData.message,
            created_at: messageData.timestamp
          })
        }
      })
    }
  }

  // Admin functions
  async getAdminConversations() {
    try {
      if (this.isConnected) {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            subject,
            status,
            priority,
            last_message_at,
            last_message_preview,
            unread_count_admin,
            created_at,
            users!customer_id(id, name, avatar_url),
            cars(id, name, primary_image_url)
          `)
          .order('last_message_at', { ascending: false })

        return { data, error }
      } else {
        // Return mock admin conversations
        const mockConversations = [
          {
            id: 1,
            subject: 'Inquiry about Toyota Vitz',
            status: 'active',
            priority: 'normal',
            last_message_at: new Date(Date.now() - 60000).toISOString(),
            last_message_preview: 'Is this car still available?',
            unread_count_admin: 1,
            users: { 
              id: 'user_123', 
              name: 'James Mwangi',
              avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
            },
            cars: {
              id: 1,
              name: 'Toyota Vitz',
              primary_image_url: 'https://images.unsplash.com/photo-1580414155951-6ec7abe9ac56'
            }
          }
        ]
        return { data: mockConversations, error: null }
      }
    } catch (error) {
      console.error('Error fetching admin conversations:', error)
      return { data: [], error }
    }
  }

  // Check connection status
  isSupabaseConnected() {
    return this.isConnected
  }
}

// Export singleton instance
const messagingService = new MessagingService()
export default messagingService
