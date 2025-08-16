import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'

class PaymentService {
  constructor() {
    this.listeners = new Map()
  }

  // Cleanup listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }

  // MPESA Payment Integration
  async initiateMpesaPayment(paymentData) {
    try {
      const { bookingId, amount, phoneNumber, accountReference, transactionDesc } = paymentData
      
      // Create payment record in Firestore
      const paymentRecord = {
        bookingId,
        amount,
        phoneNumber: this.formatMpesaPhoneNumber(phoneNumber),
        accountReference: accountReference || bookingId,
        transactionDesc: transactionDesc || `Car rental payment for booking ${bookingId}`,
        paymentMethod: 'mpesa',
        status: 'pending',
        provider: 'mpesa',
        currency: 'KSH',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const paymentsRef = collection(db, 'payments')
      const docRef = await addDoc(paymentsRef, paymentRecord)
      
      // In a real implementation, you would call MPESA API here
      // For now, we'll simulate the STK push
      const mpesaResponse = await this.simulateMpesaSTKPush({
        ...paymentRecord,
        paymentId: docRef.id
      })

      // Update payment record with MPESA response
      await updateDoc(docRef, {
        mpesaCheckoutRequestId: mpesaResponse.CheckoutRequestID,
        mpesaMerchantRequestId: mpesaResponse.MerchantRequestID,
        mpesaResponseCode: mpesaResponse.ResponseCode,
        mpesaResponseDescription: mpesaResponse.ResponseDescription,
        updatedAt: serverTimestamp()
      })

      return {
        success: true,
        data: {
          paymentId: docRef.id,
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          merchantRequestId: mpesaResponse.MerchantRequestID,
          message: 'STK push sent to your phone. Please complete the payment.'
        }
      }
    } catch (error) {
      console.error('Error initiating MPESA payment:', error)
      return { success: false, error: error.message }
    }
  }

  // Card Payment Integration (Stripe/PayPal simulation)
  async initiateCardPayment(paymentData) {
    try {
      const { bookingId, amount, cardDetails, customerInfo } = paymentData
      
      // Create payment record
      const paymentRecord = {
        bookingId,
        amount,
        currency: 'KSH',
        paymentMethod: 'card',
        status: 'pending',
        provider: 'stripe', // or 'paypal'
        cardLast4: cardDetails.number.slice(-4),
        cardBrand: this.detectCardBrand(cardDetails.number),
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const paymentsRef = collection(db, 'payments')
      const docRef = await addDoc(paymentsRef, paymentRecord)
      
      // Simulate card payment processing
      const cardResponse = await this.simulateCardPayment({
        ...paymentRecord,
        paymentId: docRef.id,
        cardDetails
      })

      // Update payment record with response
      await updateDoc(docRef, {
        stripePaymentIntentId: cardResponse.paymentIntentId,
        stripeStatus: cardResponse.status,
        processingFee: cardResponse.processingFee,
        updatedAt: serverTimestamp()
      })

      return {
        success: true,
        data: {
          paymentId: docRef.id,
          paymentIntentId: cardResponse.paymentIntentId,
          clientSecret: cardResponse.clientSecret,
          status: cardResponse.status
        }
      }
    } catch (error) {
      console.error('Error initiating card payment:', error)
      return { success: false, error: error.message }
    }
  }

  // Handle MPESA callback (webhook simulation)
  async handleMpesaCallback(callbackData) {
    try {
      const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData
      
      // Find payment by checkout request ID
      const paymentsRef = collection(db, 'payments')
      const q = query(paymentsRef, where('mpesaCheckoutRequestId', '==', CheckoutRequestID))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        throw new Error('Payment record not found')
      }

      const paymentDoc = querySnapshot.docs[0]
      const paymentData = paymentDoc.data()
      
      let updateData = {
        mpesaResultCode: ResultCode,
        mpesaResultDesc: ResultDesc,
        updatedAt: serverTimestamp()
      }

      if (ResultCode === 0) {
        // Payment successful
        updateData.status = 'completed'
        updateData.completedAt = serverTimestamp()
        
        // Extract transaction details from callback metadata
        if (CallbackMetadata && CallbackMetadata.Item) {
          const metadata = this.parseMpesaMetadata(CallbackMetadata.Item)
          updateData = { ...updateData, ...metadata }
        }
      } else {
        // Payment failed
        updateData.status = 'failed'
        updateData.failedAt = serverTimestamp()
      }

      await updateDoc(paymentDoc.ref, updateData)
      
      // Update booking payment status
      if (updateData.status === 'completed') {
        await this.updateBookingPaymentStatus(paymentData.bookingId, 'paid', {
          paymentId: paymentDoc.id,
          transactionId: updateData.mpesaReceiptNumber,
          paymentMethod: 'mpesa'
        })
      } else if (updateData.status === 'failed') {
        await this.updateBookingPaymentStatus(paymentData.bookingId, 'failed', {
          paymentId: paymentDoc.id,
          failureReason: ResultDesc
        })
      }

      return { success: true, data: updateData }
    } catch (error) {
      console.error('Error handling MPESA callback:', error)
      return { success: false, error: error.message }
    }
  }

  // Real-time payment status listener
  subscribeToPaymentStatus(paymentId, callback) {
    try {
      const paymentRef = doc(db, 'payments', paymentId)
      
      const unsubscribe = onSnapshot(paymentRef, (doc) => {
        if (doc.exists()) {
          const payment = { id: doc.id, ...doc.data() }
          callback({ success: true, data: payment })
        } else {
          callback({ success: false, error: 'Payment not found' })
        }
      }, (error) => {
        console.error('Error in payment status subscription:', error)
        callback({ success: false, error: error.message })
      })
      
      this.listeners.set(`payment_${paymentId}`, unsubscribe)
      return unsubscribe
    } catch (error) {
      console.error('Error setting up payment status subscription:', error)
      callback({ success: false, error: error.message })
    }
  }

  // Get payment history for user
  async getUserPayments(userId) {
    try {
      const paymentsRef = collection(db, 'payments')
      const q = query(
        paymentsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const payments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: payments }
    } catch (error) {
      console.error('Error getting user payments:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper methods
  formatMpesaPhoneNumber(phoneNumber) {
    // Convert to 254XXXXXXXXX format
    let formatted = phoneNumber.replace(/\D/g, '') // Remove non-digits
    
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.slice(1)
    } else if (formatted.startsWith('254')) {
      // Already in correct format
    } else if (formatted.startsWith('7') || formatted.startsWith('1')) {
      formatted = '254' + formatted
    }
    
    return formatted
  }

  detectCardBrand(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '')
    
    if (/^4/.test(cleaned)) return 'visa'
    if (/^5[1-5]/.test(cleaned)) return 'mastercard'
    if (/^3[47]/.test(cleaned)) return 'amex'
    if (/^6/.test(cleaned)) return 'discover'
    
    return 'unknown'
  }

  parseMpesaMetadata(items) {
    const metadata = {}
    
    items.forEach(item => {
      switch (item.Name) {
        case 'Amount':
          metadata.mpesaAmount = item.Value
          break
        case 'MpesaReceiptNumber':
          metadata.mpesaReceiptNumber = item.Value
          break
        case 'TransactionDate':
          metadata.mpesaTransactionDate = item.Value
          break
        case 'PhoneNumber':
          metadata.mpesaPhoneNumber = item.Value
          break
      }
    })
    
    return metadata
  }

  async updateBookingPaymentStatus(bookingId, paymentStatus, additionalData = {}) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId)
      await updateDoc(bookingRef, {
        paymentStatus,
        ...additionalData,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating booking payment status:', error)
      return { success: false, error: error.message }
    }
  }

  // Simulation methods (replace with real API calls)
  async simulateMpesaSTKPush(paymentData) {
    // Simulate MPESA API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          MerchantRequestID: '29115-34620561-1',
          CheckoutRequestID: 'ws_CO_191220191020363925',
          ResponseCode: '0',
          ResponseDescription: 'Success. Request accepted for processing',
          CustomerMessage: 'Success. Request accepted for processing'
        })
      }, 1000)
    })
  }

  async simulateCardPayment(paymentData) {
    // Simulate Stripe/PayPal API response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random success/failure
        const isSuccess = Math.random() > 0.1 // 90% success rate
        
        if (isSuccess) {
          resolve({
            paymentIntentId: 'pi_' + Math.random().toString(36).substr(2, 15),
            clientSecret: 'pi_' + Math.random().toString(36).substr(2, 15) + '_secret',
            status: 'succeeded',
            processingFee: Math.round(paymentData.amount * 0.035) // 3.5% processing fee
          })
        } else {
          reject(new Error('Card payment failed: Insufficient funds'))
        }
      }, 2000)
    })
  }

  // Payment verification for admin
  async verifyPayment(paymentId) {
    try {
      const paymentRef = doc(db, 'payments', paymentId)
      const paymentSnap = await getDoc(paymentRef)
      
      if (!paymentSnap.exists()) {
        return { success: false, error: 'Payment not found' }
      }

      const payment = paymentSnap.data()
      
      // In a real implementation, verify with payment provider
      let verificationResult = {
        verified: true,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.mpesaReceiptNumber || payment.stripePaymentIntentId
      }

      // Update payment with verification result
      await updateDoc(paymentRef, {
        verified: verificationResult.verified,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return { success: true, data: verificationResult }
    } catch (error) {
      console.error('Error verifying payment:', error)
      return { success: false, error: error.message }
    }
  }

  // Get payment statistics (admin)
  async getPaymentStatistics() {
    try {
      const paymentsRef = collection(db, 'payments')
      const querySnapshot = await getDocs(paymentsRef)
      
      const payments = querySnapshot.docs.map(doc => doc.data())
      
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const stats = {
        totalPayments: payments.length,
        completedPayments: payments.filter(p => p.status === 'completed').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
        totalAmount: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.amount || 0), 0),
        mpesaPayments: payments.filter(p => p.paymentMethod === 'mpesa').length,
        cardPayments: payments.filter(p => p.paymentMethod === 'card').length,
        thisMonthAmount: payments
          .filter(p => {
            const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt)
            return createdAt >= thisMonth && p.status === 'completed'
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0),
        averageTransactionValue: payments.length > 0 
          ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length 
          : 0
      }
      
      return { success: true, data: stats }
    } catch (error) {
      console.error('Error getting payment statistics:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create and export singleton instance
const paymentService = new PaymentService()
export default paymentService
