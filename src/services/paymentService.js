// Payment service for handling various payment methods
// In production, this would integrate with real payment gateways

// Mock payment transactions database
let mockPayments = []

// Kenyan banks for bank transfer options
export const kenyanBanks = [
  { code: 'equity', name: 'Equity Bank Kenya Limited' },
  { code: 'kcb', name: 'Kenya Commercial Bank (KCB)' },
  { code: 'cooperative', name: 'Co-operative Bank of Kenya' },
  { code: 'absa', name: 'Absa Bank Kenya PLC' },
  { code: 'stanbic', name: 'Stanbic Bank Kenya Limited' },
  { code: 'ncba', name: 'NCBA Bank Kenya PLC' },
  { code: 'dtb', name: 'Diamond Trust Bank Kenya Limited' },
  { code: 'familybank', name: 'Family Bank Limited' },
  { code: 'iban', name: 'I&M Bank Limited' },
  { code: 'gureysbank', name: 'Guaranty Trust Bank Kenya Limited' }
]

class PaymentService {
  constructor() {
    this.apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.yourcarrental.com' 
      : 'http://localhost:3001'
  }

  // Process payment based on method
  async processPayment(paymentData) {
    const { paymentMethod, amount, currency, bookingId } = paymentData

    try {
      // Simulate API call delay
      await this.delay(2000)

      // Route to appropriate payment processor
      switch (paymentMethod) {
        case 'mpesa':
          return await this.processMpesaPayment(paymentData)
        case 'card':
          return await this.processCardPayment(paymentData)
        case 'bank':
          return await this.processBankTransfer(paymentData)
        default:
          throw new Error('Unsupported payment method')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      }
    }
  }

  // M-Pesa payment processing (Safaricom STK Push simulation)
  async processMpesaPayment(paymentData) {
    const { amount, paymentData: { mpesaNumber }, booking, customer } = paymentData

    // Validate M-Pesa number format
    const cleanNumber = mpesaNumber.replace(/\s/g, '')
    if (!/^(254|0)(7|1)\d{8}$/.test(cleanNumber)) {
      throw new Error('Invalid M-Pesa number format')
    }

    // Simulate M-Pesa STK Push
    const mpesaResponse = await this.simulateMpesaSTKPush({
      phoneNumber: cleanNumber,
      amount,
      reference: `CAR-${booking.id}`,
      description: `Car rental payment for ${booking.carName}`
    })

    if (mpesaResponse.success) {
      // Record successful payment
      const payment = this.recordPayment({
        ...paymentData,
        transactionId: mpesaResponse.transactionId,
        providerResponse: mpesaResponse,
        status: 'completed'
      })

      // Update booking status to confirmed and paid
      await this.updateBookingPaymentStatus(booking.id, 'confirmed_paid', payment.id)

      return {
        success: true,
        transactionId: mpesaResponse.transactionId,
        message: 'M-Pesa payment completed successfully',
        payment,
        receiptNumber: mpesaResponse.receiptNumber
      }
    } else {
      throw new Error(mpesaResponse.error || 'M-Pesa payment failed')
    }
  }

  // Card payment processing (Stripe/Paystack simulation)
  async processCardPayment(paymentData) {
    const { amount, paymentData: cardData, booking } = paymentData

    // Validate card details
    this.validateCardDetails(cardData)

    // Simulate card processing
    const cardResponse = await this.simulateCardProcessing({
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      expiryDate: cardData.expiryDate,
      cvv: cardData.cvv,
      cardName: cardData.cardName,
      amount,
      currency: 'KES',
      reference: `CAR-${booking.id}`
    })

    if (cardResponse.success) {
      const payment = this.recordPayment({
        ...paymentData,
        transactionId: cardResponse.transactionId,
        providerResponse: cardResponse,
        status: 'completed'
      })

      await this.updateBookingPaymentStatus(booking.id, 'confirmed_paid', payment.id)

      return {
        success: true,
        transactionId: cardResponse.transactionId,
        message: 'Card payment completed successfully',
        payment,
        last4: cardData.cardNumber.slice(-4)
      }
    } else {
      throw new Error(cardResponse.error || 'Card payment failed')
    }
  }

  // Bank transfer processing
  async processBankTransfer(paymentData) {
    const { amount, paymentData: bankData, booking } = paymentData

    // Validate bank details
    if (!bankData.bankCode || !bankData.bankAccount) {
      throw new Error('Bank details are required')
    }

    // Simulate bank transfer processing
    const bankResponse = await this.simulateBankTransfer({
      bankCode: bankData.bankCode,
      accountNumber: bankData.bankAccount,
      amount,
      reference: `CAR-${booking.id}`,
      narration: `Car rental payment for ${booking.carName}`
    })

    if (bankResponse.success) {
      const payment = this.recordPayment({
        ...paymentData,
        transactionId: bankResponse.transactionId,
        providerResponse: bankResponse,
        status: 'pending' // Bank transfers may take time to clear
      })

      // Bank transfers are usually pending initially
      await this.updateBookingPaymentStatus(booking.id, 'confirmed_pending_payment', payment.id)

      return {
        success: true,
        transactionId: bankResponse.transactionId,
        message: 'Bank transfer initiated successfully. Payment will be verified within 24 hours.',
        payment,
        bankName: this.getBankName(bankData.bankCode)
      }
    } else {
      throw new Error(bankResponse.error || 'Bank transfer failed')
    }
  }

  // Simulate M-Pesa STK Push
  async simulateMpesaSTKPush(data) {
    await this.delay(1500) // Simulate STK push delay

    // 95% success rate simulation
    if (Math.random() > 0.05) {
      return {
        success: true,
        transactionId: `MP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        receiptNumber: `MP${Date.now()}`,
        phoneNumber: data.phoneNumber,
        amount: data.amount,
        timestamp: new Date().toISOString()
      }
    } else {
      return {
        success: false,
        error: 'Transaction cancelled by user or insufficient funds'
      }
    }
  }

  // Simulate card processing
  async simulateCardProcessing(data) {
    await this.delay(2000) // Simulate card processing delay

    // Basic card validation
    if (data.cardNumber.startsWith('4000000000000002')) {
      return {
        success: false,
        error: 'Card declined - insufficient funds'
      }
    }

    if (data.cardNumber.startsWith('4000000000000119')) {
      return {
        success: false,
        error: 'Card declined - processing error'
      }
    }

    // 92% success rate for other cards
    if (Math.random() > 0.08) {
      return {
        success: true,
        transactionId: `CH${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        authCode: `AUTH${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        cardType: this.getCardType(data.cardNumber),
        last4: data.cardNumber.slice(-4),
        timestamp: new Date().toISOString()
      }
    } else {
      return {
        success: false,
        error: 'Card processing failed. Please try again or use a different card.'
      }
    }
  }

  // Simulate bank transfer
  async simulateBankTransfer(data) {
    await this.delay(1000) // Simulate bank API delay

    // 98% success rate for bank transfers (they rarely fail during initiation)
    if (Math.random() > 0.02) {
      return {
        success: true,
        transactionId: `BT${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        referenceNumber: `REF${Date.now()}`,
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        status: 'pending_verification',
        timestamp: new Date().toISOString()
      }
    } else {
      return {
        success: false,
        error: 'Bank transfer initiation failed. Please check your account details.'
      }
    }
  }

  // Validate card details
  validateCardDetails(cardData) {
    const { cardNumber, expiryDate, cvv, cardName } = cardData

    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      throw new Error('Invalid card number')
    }

    if (!expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      throw new Error('Invalid expiry date format')
    }

    // Check if card is expired
    const [month, year] = expiryDate.split('/')
    const expiry = new Date(`20${year}`, month - 1)
    const now = new Date()
    if (expiry < now) {
      throw new Error('Card has expired')
    }

    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      throw new Error('Invalid CVV')
    }

    if (!cardName || cardName.trim().length < 2) {
      throw new Error('Cardholder name is required')
    }
  }

  // Get card type from number
  getCardType(cardNumber) {
    const number = cardNumber.replace(/\s/g, '')
    
    if (number.startsWith('4')) return 'Visa'
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'Mastercard'
    if (/^3[47]/.test(number)) return 'American Express'
    if (/^6(?:011|5)/.test(number)) return 'Discover'
    
    return 'Unknown'
  }

  // Get bank name from code
  getBankName(bankCode) {
    const bank = kenyanBanks.find(b => b.code === bankCode)
    return bank ? bank.name : 'Unknown Bank'
  }

  // Record payment in mock database
  recordPayment(paymentData) {
    const payment = {
      id: Date.now(),
      bookingId: paymentData.bookingId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.status,
      transactionId: paymentData.transactionId,
      providerResponse: paymentData.providerResponse,
      customerInfo: {
        id: paymentData.customer.id,
        name: paymentData.customer.name,
        email: paymentData.customer.email
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockPayments.push(payment)
    return payment
  }

  // Update booking payment status (would integrate with booking service)
  async updateBookingPaymentStatus(bookingId, status, paymentId) {
    // This would call the booking service to update status
    console.log(`Updating booking ${bookingId} status to ${status} with payment ${paymentId}`)
    
    // Import booking service and update
    try {
      const { bookingService } = await import('./bookingService')
      // Update booking with payment info
      // bookingService.updateBookingPayment(bookingId, status, paymentId)
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  // Get payment history
  getPaymentHistory(customerId) {
    return mockPayments
      .filter(payment => payment.customerInfo.id === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Get payment by ID
  getPaymentById(paymentId) {
    return mockPayments.find(payment => payment.id === paymentId)
  }

  // Get payment by transaction ID
  getPaymentByTransactionId(transactionId) {
    return mockPayments.find(payment => payment.transactionId === transactionId)
  }

  // Admin functions
  getAllPayments() {
    return mockPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Verify pending bank payments (admin function)
  verifyBankPayment(paymentId, verified, adminUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Admin access required')
    }

    const paymentIndex = mockPayments.findIndex(p => p.id === paymentId)
    if (paymentIndex === -1) {
      throw new Error('Payment not found')
    }

    const payment = mockPayments[paymentIndex]
    payment.status = verified ? 'completed' : 'failed'
    payment.verifiedBy = adminUser.id
    payment.verifiedAt = new Date().toISOString()
    payment.updatedAt = new Date().toISOString()

    // Update booking status accordingly
    if (verified) {
      this.updateBookingPaymentStatus(payment.bookingId, 'confirmed_paid', payment.id)
    }

    return payment
  }

  // Refund payment (admin function)
  async refundPayment(paymentId, refundReason, adminUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Admin access required')
    }

    const payment = this.getPaymentById(paymentId)
    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded')
    }

    // Simulate refund processing
    await this.delay(1000)

    const refund = {
      id: Date.now(),
      originalPaymentId: paymentId,
      amount: payment.amount,
      currency: payment.currency,
      reason: refundReason,
      status: 'completed',
      refundTransactionId: `RF${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      processedBy: adminUser.id,
      createdAt: new Date().toISOString()
    }

    // Update original payment
    payment.refunded = true
    payment.refundId = refund.id
    payment.updatedAt = new Date().toISOString()

    mockPayments.push({
      ...refund,
      type: 'refund'
    })

    return refund
  }

  // Get payment statistics
  getPaymentStats() {
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisYear = new Date(today.getFullYear(), 0, 1)

    const completedPayments = mockPayments.filter(p => p.status === 'completed' && p.type !== 'refund')
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)

    return {
      totalPayments: mockPayments.length,
      completedPayments: completedPayments.length,
      pendingPayments: mockPayments.filter(p => p.status === 'pending').length,
      failedPayments: mockPayments.filter(p => p.status === 'failed').length,
      totalRevenue,
      thisMonthRevenue: completedPayments
        .filter(p => new Date(p.createdAt) >= thisMonth)
        .reduce((sum, p) => sum + p.amount, 0),
      thisYearRevenue: completedPayments
        .filter(p => new Date(p.createdAt) >= thisYear)
        .reduce((sum, p) => sum + p.amount, 0),
      paymentMethods: {
        mpesa: mockPayments.filter(p => p.paymentMethod === 'mpesa').length,
        card: mockPayments.filter(p => p.paymentMethod === 'card').length,
        bank: mockPayments.filter(p => p.paymentMethod === 'bank').length
      }
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Format amount for display
  formatAmount(amount, currency = 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Validate payment amount
  validateAmount(amount) {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Invalid payment amount')
    }
    if (numAmount < 100) {
      throw new Error('Minimum payment amount is KES 100')
    }
    if (numAmount > 1000000) {
      throw new Error('Maximum payment amount is KES 1,000,000')
    }
    return numAmount
  }
}

// Create singleton instance
export const paymentService = new PaymentService()

// Export for testing purposes
export { mockPayments }
