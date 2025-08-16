import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

class FirebaseNotificationService {
  
  // Create notification
  async createNotification(userId, notificationData) {
    try {
      const notification = {
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        read: false,
        actionRequired: notificationData.actionRequired || false,
        priority: notificationData.priority || 'normal', // low, normal, high, urgent
        category: notificationData.category || 'general', // booking, payment, message, system
        expiresAt: notificationData.expiresAt || null,
        createdAt: serverTimestamp(),
        readAt: null
      }

      const notificationsRef = collection(db, 'notifications')
      const docRef = await addDoc(notificationsRef, notification)
      
      return { success: true, data: { id: docRef.id, ...notification } }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limitCount = 50) {
    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: notifications }
    } catch (error) {
      console.error('Error getting user notifications:', error)
      return { success: false, error: error.message }
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.message }
    }
  }

  // Mark all user notifications as read
  async markAllAsRead(userId) {
    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      )
      
      const querySnapshot = await getDocs(q)
      const batch = db.batch()
      
      querySnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        })
      })
      
      await batch.commit()
      return { success: true }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: error.message }
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      )
      
      const querySnapshot = await getDocs(q)
      return { success: true, data: querySnapshot.size }
    } catch (error) {
      console.error('Error getting unread count:', error)
      return { success: false, error: error.message }
    }
  }

  // Predefined notification creators for specific events
  
  // Booking notifications
  async notifyBookingCreated(userId, bookingData) {
    return this.createNotification(userId, {
      type: 'booking',
      title: 'Booking Created',
      message: `Your booking for ${bookingData.carName} has been created and is pending confirmation.`,
      category: 'booking',
      priority: 'normal',
      data: {
        bookingId: bookingData.id,
        carName: bookingData.carName,
        pickupDate: bookingData.pickupDate,
        status: 'pending'
      }
    })
  }

  async notifyBookingConfirmed(userId, bookingData) {
    return this.createNotification(userId, {
      type: 'booking',
      title: 'Booking Confirmed! 🎉',
      message: `Great news! Your booking for ${bookingData.carName} has been confirmed. Your adventure awaits!`,
      category: 'booking',
      priority: 'high',
      actionRequired: true,
      data: {
        bookingId: bookingData.id,
        carName: bookingData.carName,
        pickupDate: bookingData.pickupDate,
        status: 'confirmed'
      }
    })
  }

  async notifyBookingCancelled(userId, bookingData) {
    return this.createNotification(userId, {
      type: 'booking',
      title: 'Booking Cancelled',
      message: `Your booking for ${bookingData.carName} has been cancelled. ${bookingData.refundAmount > 0 ? 'Refund is being processed.' : ''}`,
      category: 'booking',
      priority: 'normal',
      data: {
        bookingId: bookingData.id,
        carName: bookingData.carName,
        status: 'cancelled',
        refundAmount: bookingData.refundAmount || 0
      }
    })
  }

  async notifyBookingReminder(userId, bookingData) {
    return this.createNotification(userId, {
      type: 'reminder',
      title: 'Upcoming Trip Reminder ⏰',
      message: `Your trip with ${bookingData.carName} starts tomorrow! Don't forget to bring your driver's license.`,
      category: 'booking',
      priority: 'high',
      actionRequired: true,
      data: {
        bookingId: bookingData.id,
        carName: bookingData.carName,
        pickupDate: bookingData.pickupDate
      }
    })
  }

  // Payment notifications
  async notifyPaymentReceived(userId, paymentData) {
    return this.createNotification(userId, {
      type: 'payment',
      title: 'Payment Confirmed 💳',
      message: `Payment of KES ${paymentData.amount.toLocaleString()} has been received successfully.`,
      category: 'payment',
      priority: 'normal',
      data: {
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId
      }
    })
  }

  async notifyPaymentFailed(userId, paymentData) {
    return this.createNotification(userId, {
      type: 'payment',
      title: 'Payment Failed ❌',
      message: `Payment of KES ${paymentData.amount.toLocaleString()} could not be processed. Please try again.`,
      category: 'payment',
      priority: 'high',
      actionRequired: true,
      data: {
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        reason: paymentData.failureReason
      }
    })
  }

  async notifyRefundProcessed(userId, refundData) {
    return this.createNotification(userId, {
      type: 'payment',
      title: 'Refund Processed 💰',
      message: `Your refund of KES ${refundData.amount.toLocaleString()} has been processed and will appear in your account within 3-5 business days.`,
      category: 'payment',
      priority: 'normal',
      data: {
        bookingId: refundData.bookingId,
        amount: refundData.amount,
        refundId: refundData.refundId
      }
    })
  }

  // Message notifications
  async notifyNewMessage(userId, messageData) {
    return this.createNotification(userId, {
      type: 'message',
      title: 'New Message 💬',
      message: `You have a new message from ${messageData.senderName || 'Support'}.`,
      category: 'message',
      priority: 'normal',
      actionRequired: true,
      data: {
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        preview: messageData.message.substring(0, 100)
      }
    })
  }

  // System notifications
  async notifyDocumentRequired(userId, documentData) {
    return this.createNotification(userId, {
      type: 'document',
      title: 'Documents Required 📄',
      message: `Please upload your ${documentData.documentType} to complete your booking verification.`,
      category: 'system',
      priority: 'high',
      actionRequired: true,
      data: {
        bookingId: documentData.bookingId,
        documentType: documentData.documentType,
        deadline: documentData.deadline
      }
    })
  }

  async notifyDocumentApproved(userId, documentData) {
    return this.createNotification(userId, {
      type: 'document',
      title: 'Document Approved ✅',
      message: `Your ${documentData.documentType} has been verified and approved. You're all set!`,
      category: 'system',
      priority: 'normal',
      data: {
        documentType: documentData.documentType,
        approvedAt: new Date().toISOString()
      }
    })
  }

  async notifyDocumentRejected(userId, documentData) {
    return this.createNotification(userId, {
      type: 'document',
      title: 'Document Needs Attention ⚠️',
      message: `Your ${documentData.documentType} couldn't be verified. Please upload a clearer image.`,
      category: 'system',
      priority: 'high',
      actionRequired: true,
      data: {
        documentType: documentData.documentType,
        rejectionReason: documentData.reason,
        resubmissionRequired: true
      }
    })
  }

  // Promotional notifications
  async notifyPromotion(userId, promoData) {
    return this.createNotification(userId, {
      type: 'promotion',
      title: `Special Offer! ${promoData.title} 🎉`,
      message: promoData.description,
      category: 'promotion',
      priority: 'low',
      expiresAt: promoData.expiresAt,
      data: {
        promoCode: promoData.code,
        discount: promoData.discount,
        validUntil: promoData.expiresAt,
        minAmount: promoData.minAmount
      }
    })
  }

  // Review notifications
  async notifyReviewRequest(userId, bookingData) {
    return this.createNotification(userId, {
      type: 'review',
      title: 'How was your trip? ⭐',
      message: `Please share your experience with ${bookingData.carName} to help other travelers.`,
      category: 'system',
      priority: 'low',
      actionRequired: true,
      data: {
        bookingId: bookingData.id,
        carId: bookingData.carId,
        carName: bookingData.carName
      }
    })
  }

  // Admin notifications
  async notifyAdminNewBooking(bookingData) {
    // Get admin user ID (assuming single admin)
    const adminUserId = await this.getAdminUserId()
    if (!adminUserId) return { success: false, error: 'Admin not found' }

    return this.createNotification(adminUserId, {
      type: 'admin',
      title: 'New Booking Received 📋',
      message: `New booking for ${bookingData.carName} by ${bookingData.customerName}.`,
      category: 'booking',
      priority: 'high',
      actionRequired: true,
      data: {
        bookingId: bookingData.id,
        carName: bookingData.carName,
        customerName: bookingData.customerName,
        totalAmount: bookingData.totalAmount
      }
    })
  }

  async notifyAdminPaymentReceived(paymentData) {
    const adminUserId = await this.getAdminUserId()
    if (!adminUserId) return { success: false, error: 'Admin not found' }

    return this.createNotification(adminUserId, {
      type: 'admin',
      title: 'Payment Received 💰',
      message: `Payment of KES ${paymentData.amount.toLocaleString()} received for booking ${paymentData.bookingId}.`,
      category: 'payment',
      priority: 'normal',
      data: {
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        customerName: paymentData.customerName
      }
    })
  }

  // Helper method to get admin user ID
  async getAdminUserId() {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', 'admin'), limit(1))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id
      }
      return null
    } catch (error) {
      console.error('Error getting admin user ID:', error)
      return null
    }
  }

  // Batch notification cleanup (remove old notifications)
  async cleanupOldNotifications(userId, daysOld = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('createdAt', '<', cutoffDate)
      )
      
      const querySnapshot = await getDocs(q)
      const batch = db.batch()
      
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      return { success: true, deletedCount: querySnapshot.size }
    } catch (error) {
      console.error('Error cleaning up old notifications:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create and export singleton instance
const firebaseNotificationService = new FirebaseNotificationService()
export default firebaseNotificationService
