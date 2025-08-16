import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import firebaseCarService from './firebaseCarService'

class FirebaseBookingService {
  constructor() {
    this.listeners = new Map()
  }

  // Cleanup listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }

  // Real-time listener for user bookings
  subscribeToUserBookings(userId, callback) {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(
        bookingsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback({ success: true, data: bookings })
      }, (error) => {
        console.error('Error in user bookings subscription:', error)
        callback({ success: false, error: error.message })
      })

      this.listeners.set(`userBookings_${userId}`, unsubscribe)
      return unsubscribe
    } catch (error) {
      console.error('Error setting up user bookings subscription:', error)
      callback({ success: false, error: error.message })
    }
  }

  // Real-time listener for all bookings (admin)
  subscribeToAllBookings(callback) {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(bookingsRef, orderBy('createdAt', 'desc'))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback({ success: true, data: bookings })
      }, (error) => {
        console.error('Error in all bookings subscription:', error)
        callback({ success: false, error: error.message })
      })

      this.listeners.set('allBookings', unsubscribe)
      return unsubscribe
    } catch (error) {
      console.error('Error setting up all bookings subscription:', error)
      callback({ success: false, error: error.message })
    }
  }

  // Real-time listener for specific booking
  subscribeToBookingById(bookingId, callback) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId)

      const unsubscribe = onSnapshot(bookingRef, (doc) => {
        if (doc.exists()) {
          const booking = { id: doc.id, ...doc.data() }
          callback({ success: true, data: booking })
        } else {
          callback({ success: false, error: 'Booking not found' })
        }
      }, (error) => {
        console.error('Error in booking subscription:', error)
        callback({ success: false, error: error.message })
      })

      this.listeners.set(`booking_${bookingId}`, unsubscribe)
      return unsubscribe
    } catch (error) {
      console.error('Error setting up booking subscription:', error)
      callback({ success: false, error: error.message })
    }
  }

  // Real-time listener for pending bookings (admin)
  subscribeToPendingBookings(callback) {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(
        bookingsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback({ success: true, data: bookings })
      }, (error) => {
        console.error('Error in pending bookings subscription:', error)
        callback({ success: false, error: error.message })
      })

      this.listeners.set('pendingBookings', unsubscribe)
      return unsubscribe
    } catch (error) {
      console.error('Error setting up pending bookings subscription:', error)
      callback({ success: false, error: error.message })
    }
  }

  // Create new booking
  async createBooking(bookingData, userId) {
    try {
      const batch = writeBatch(db)
      
      // Generate booking ID
      const bookingId = this.generateBookingId()
      
      const newBooking = {
        id: bookingId,
        userId,
        carId: bookingData.carId,
        carName: bookingData.carName,
        pickupDate: bookingData.pickupDate,
        dropoffDate: bookingData.dropoffDate,
        pickupLocation: bookingData.pickupLocation || '',
        dropoffLocation: bookingData.dropoffLocation || '',
        totalDays: this.calculateDays(bookingData.pickupDate, bookingData.dropoffDate),
        pricePerDay: bookingData.pricePerDay,
        totalAmount: bookingData.totalAmount,
        currency: 'KSH',
        status: 'pending', // pending, confirmed, active, completed, cancelled
        paymentStatus: 'pending', // pending, paid, failed, refunded
        paymentMethod: bookingData.paymentMethod || '',
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        customerNotes: bookingData.customerNotes || '',
        requirements: bookingData.requirements || [],
        insurance: bookingData.insurance || false,
        driverLicense: bookingData.driverLicense || '',
        additionalDrivers: bookingData.additionalDrivers || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notifications: [],
        documents: {
          contract: null,
          receipt: null,
          insurance: null
        }
      }

      // Add booking document
      const bookingRef = doc(db, 'bookings', bookingId)
      batch.set(bookingRef, newBooking)

      // Update car availability temporarily
      const carRef = doc(db, 'cars', bookingData.carId)
      batch.update(carRef, {
        available: false,
        updatedAt: serverTimestamp()
      })

      await batch.commit()
      
      return { success: true, data: newBooking }
    } catch (error) {
      console.error('Error creating booking:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user bookings
  async getUserBookings(userId) {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(
        bookingsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: bookings }
    } catch (error) {
      console.error('Error getting user bookings:', error)
      return { success: false, error: error.message }
    }
  }

  // Get all bookings (admin only)
  async getAllBookings() {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(bookingsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: bookings }
    } catch (error) {
      console.error('Error getting all bookings:', error)
      return { success: false, error: error.message }
    }
  }

  // Get booking by ID
  async getBookingById(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId)
      const bookingSnap = await getDoc(bookingRef)
      
      if (bookingSnap.exists()) {
        const booking = { id: bookingSnap.id, ...bookingSnap.data() }
        return { success: true, data: booking }
      } else {
        return { success: false, error: 'Booking not found' }
      }
    } catch (error) {
      console.error('Error getting booking:', error)
      return { success: false, error: error.message }
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status, additionalData = {}) {
    try {
      const batch = writeBatch(db)
      
      const bookingRef = doc(db, 'bookings', bookingId)
      const updateData = {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      }

      // Add status change to notifications
      const notification = {
        id: Date.now().toString(),
        type: 'status_change',
        message: `Booking status changed to ${status}`,
        timestamp: new Date().toISOString(),
        data: { status, ...additionalData }
      }

      updateData.notifications = additionalData.notifications || []
      updateData.notifications.push(notification)

      batch.update(bookingRef, updateData)

      // Handle car availability based on status
      if (status === 'cancelled' || status === 'completed') {
        // Get booking to find car ID
        const bookingSnap = await getDoc(bookingRef)
        if (bookingSnap.exists()) {
          const booking = bookingSnap.data()
          const carRef = doc(db, 'cars', booking.carId)
          batch.update(carRef, {
            available: true,
            updatedAt: serverTimestamp()
          })
        }
      }

      await batch.commit()
      
      return { success: true, data: updateData }
    } catch (error) {
      console.error('Error updating booking status:', error)
      return { success: false, error: error.message }
    }
  }

  // Update payment status
  async updatePaymentStatus(bookingId, paymentStatus, paymentData = {}) {
    try {
      const batch = writeBatch(db)
      
      const bookingRef = doc(db, 'bookings', bookingId)
      const updateData = {
        paymentStatus,
        updatedAt: serverTimestamp(),
        ...paymentData
      }

      // If payment is successful, confirm booking
      if (paymentStatus === 'paid') {
        updateData.status = 'confirmed'
        updateData.paidAt = serverTimestamp()
        
        // Update car statistics
        const bookingSnap = await getDoc(bookingRef)
        if (bookingSnap.exists()) {
          const booking = bookingSnap.data()
          const carRef = doc(db, 'cars', booking.carId)
          
          // Get current car data
          const carSnap = await getDoc(carRef)
          if (carSnap.exists()) {
            const car = carSnap.data()
            batch.update(carRef, {
              totalBookings: (car.totalBookings || 0) + 1,
              totalRevenue: (car.totalRevenue || 0) + booking.totalAmount,
              updatedAt: serverTimestamp()
            })
          }
        }
      }

      batch.update(bookingRef, updateData)
      await batch.commit()
      
      return { success: true, data: updateData }
    } catch (error) {
      console.error('Error updating payment status:', error)
      return { success: false, error: error.message }
    }
  }

  // Cancel booking
  async cancelBooking(bookingId, reason = '', refundAmount = 0) {
    try {
      const result = await this.updateBookingStatus(bookingId, 'cancelled', {
        cancellationReason: reason,
        refundAmount,
        cancelledAt: serverTimestamp(),
        paymentStatus: refundAmount > 0 ? 'refunded' : 'cancelled'
      })

      return result
    } catch (error) {
      console.error('Error cancelling booking:', error)
      return { success: false, error: error.message }
    }
  }

  // Complete booking
  async completeBooking(bookingId, completionData = {}) {
    try {
      const result = await this.updateBookingStatus(bookingId, 'completed', {
        completedAt: serverTimestamp(),
        ...completionData
      })

      return result
    } catch (error) {
      console.error('Error completing booking:', error)
      return { success: false, error: error.message }
    }
  }

  // Get booking statistics (admin only)
  async getBookingStatistics() {
    try {
      const bookingsRef = collection(db, 'bookings')
      const querySnapshot = await getDocs(bookingsRef)
      
      const bookings = querySnapshot.docs.map(doc => doc.data())
      
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      
      const stats = {
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        activeBookings: bookings.filter(b => b.status === 'active').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: bookings
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        thisMonthRevenue: bookings
          .filter(b => {
            const createdAt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
            return createdAt >= thisMonth && b.paymentStatus === 'paid'
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        lastMonthRevenue: bookings
          .filter(b => {
            const createdAt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
            return createdAt >= lastMonth && createdAt < thisMonth && b.paymentStatus === 'paid'
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        averageBookingValue: bookings.length > 0 
          ? bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length 
          : 0,
        recentBookings: bookings
          .sort((a, b) => {
            const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
            const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
            return bDate - aDate
          })
          .slice(0, 5)
      }
      
      return { success: true, data: stats }
    } catch (error) {
      console.error('Error getting booking statistics:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper methods
  generateBookingId() {
    const prefix = 'BK'
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  calculateDays(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(diffDays, 1) // Minimum 1 day
  }

  // Get upcoming bookings for a user
  async getUpcomingBookings(userId) {
    try {
      const bookingsRef = collection(db, 'bookings')
      const now = new Date().toISOString().split('T')[0]
      
      const q = query(
        bookingsRef,
        where('userId', '==', userId),
        where('pickupDate', '>=', now),
        where('status', 'in', ['confirmed', 'active']),
        orderBy('pickupDate', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: bookings }
    } catch (error) {
      console.error('Error getting upcoming bookings:', error)
      return { success: false, error: error.message }
    }
  }

  // Get booking history for a user
  async getBookingHistory(userId) {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(
        bookingsRef,
        where('userId', '==', userId),
        where('status', 'in', ['completed', 'cancelled']),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: bookings }
    } catch (error) {
      console.error('Error getting booking history:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create and export singleton instance
const firebaseBookingService = new FirebaseBookingService()
export default firebaseBookingService
