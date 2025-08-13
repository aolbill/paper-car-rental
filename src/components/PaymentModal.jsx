import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { paymentService } from '../services/paymentService'
import './PaymentModal.css'

const PaymentModal = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [paymentData, setPaymentData] = useState({
    mpesaNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    bankAccount: '',
    bankCode: ''
  })
  const [errors, setErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState('method') // method, details, processing, success, failed
  const [paymentResult, setPaymentResult] = useState(null)

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setPaymentStep('method')
      setPaymentResult(null)
      setErrors({})
      setIsProcessing(false)
    }
  }, [isOpen])

  if (!isOpen || !booking) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const validatePaymentData = () => {
    const newErrors = {}

    if (paymentMethod === 'mpesa') {
      if (!paymentData.mpesaNumber) {
        newErrors.mpesaNumber = 'M-Pesa number is required'
      } else if (!/^(254|0)(7|1)\d{8}$/.test(paymentData.mpesaNumber.replace(/\s/g, ''))) {
        newErrors.mpesaNumber = 'Please enter a valid Kenyan phone number'
      }
    }

    if (paymentMethod === 'card') {
      if (!paymentData.cardNumber) {
        newErrors.cardNumber = 'Card number is required'
      } else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number'
      }

      if (!paymentData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required'
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Please enter date in MM/YY format'
      }

      if (!paymentData.cvv) {
        newErrors.cvv = 'CVV is required'
      } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        newErrors.cvv = 'Please enter a valid CVV'
      }

      if (!paymentData.cardName) {
        newErrors.cardName = 'Name on card is required'
      }
    }

    if (paymentMethod === 'bank') {
      if (!paymentData.bankAccount) {
        newErrors.bankAccount = 'Bank account number is required'
      }
      if (!paymentData.bankCode) {
        newErrors.bankCode = 'Please select your bank'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  const formatMpesaNumber = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('254')) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')
    } else if (cleaned.startsWith('0')) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
    }
    return cleaned
  }

  const handlePaymentSubmit = async () => {
    if (!validatePaymentData()) return

    setIsProcessing(true)
    setPaymentStep('processing')

    try {
      const paymentRequestData = {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: 'KES',
        paymentMethod,
        paymentData: {
          ...paymentData,
          customerName: user.name,
          customerEmail: user.email
        },
        booking,
        customer: user
      }

      const result = await paymentService.processPayment(paymentRequestData)

      if (result.success) {
        setPaymentResult(result)
        setPaymentStep('success')
        
        // Call success callback after a short delay
        setTimeout(() => {
          onPaymentSuccess(result)
        }, 2000)
      } else {
        setPaymentResult(result)
        setPaymentStep('failed')
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        error: 'Payment processing failed. Please try again.'
      })
      setPaymentStep('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderMethodSelection = () => (
    <div className="payment-step">
      <h3>Choose Payment Method</h3>
      <div className="payment-methods">
        <div 
          className={`payment-method ${paymentMethod === 'mpesa' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('mpesa')}
        >
          <div className="method-icon">📱</div>
          <div className="method-info">
            <h4>M-Pesa</h4>
            <p>Pay with your mobile money</p>
            <span className="method-badge popular">Most Popular</span>
          </div>
          <div className="method-radio">
            <input 
              type="radio" 
              checked={paymentMethod === 'mpesa'} 
              onChange={() => setPaymentMethod('mpesa')}
            />
          </div>
        </div>

        <div 
          className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('card')}
        >
          <div className="method-icon">💳</div>
          <div className="method-info">
            <h4>Credit/Debit Card</h4>
            <p>Visa, Mastercard accepted</p>
            <div className="card-logos">
              <span>VISA</span>
              <span>MC</span>
            </div>
          </div>
          <div className="method-radio">
            <input 
              type="radio" 
              checked={paymentMethod === 'card'} 
              onChange={() => setPaymentMethod('card')}
            />
          </div>
        </div>

        <div 
          className={`payment-method ${paymentMethod === 'bank' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('bank')}
        >
          <div className="method-icon">🏦</div>
          <div className="method-info">
            <h4>Bank Transfer</h4>
            <p>Direct bank payment</p>
            <span className="method-badge">Secure</span>
          </div>
          <div className="method-radio">
            <input 
              type="radio" 
              checked={paymentMethod === 'bank'} 
              onChange={() => setPaymentMethod('bank')}
            />
          </div>
        </div>
      </div>
      
      <button 
        className="btn-primary next-step"
        onClick={() => setPaymentStep('details')}
      >
        Continue with {paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'card' ? 'Card' : 'Bank Transfer'}
      </button>
    </div>
  )

  const renderPaymentDetails = () => (
    <div className="payment-step">
      <div className="step-header">
        <button 
          className="back-button"
          onClick={() => setPaymentStep('method')}
        >
          ← Back
        </button>
        <h3>Payment Details</h3>
      </div>

      {paymentMethod === 'mpesa' && (
        <div className="payment-form">
          <div className="mpesa-info">
            <div className="mpesa-icon">📱</div>
            <h4>M-Pesa Payment</h4>
            <p>You'll receive a prompt on your phone to complete the payment</p>
          </div>
          
          <div className="form-group">
            <label>M-Pesa Phone Number</label>
            <input
              type="tel"
              value={paymentData.mpesaNumber}
              onChange={(e) => handleInputChange('mpesaNumber', formatMpesaNumber(e.target.value))}
              placeholder="0712 345 678 or 254 712 345 678"
              className={errors.mpesaNumber ? 'error' : ''}
            />
            {errors.mpesaNumber && <span className="error-message">{errors.mpesaNumber}</span>}
          </div>

          <div className="mpesa-instructions">
            <h5>How it works:</h5>
            <ol>
              <li>Click "Pay Now" below</li>
              <li>You'll receive an STK push notification</li>
              <li>Enter your M-Pesa PIN to complete payment</li>
              <li>You'll receive a confirmation SMS</li>
            </ol>
          </div>
        </div>
      )}

      {paymentMethod === 'card' && (
        <div className="payment-form">
          <div className="card-info">
            <div className="card-icon">💳</div>
            <h4>Card Payment</h4>
            <p>Your card information is encrypted and secure</p>
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              className={errors.cardNumber ? 'error' : ''}
            />
            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="MM/YY"
                maxLength="5"
                className={errors.expiryDate ? 'error' : ''}
              />
              {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                value={paymentData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                maxLength="4"
                className={errors.cvv ? 'error' : ''}
              />
              {errors.cvv && <span className="error-message">{errors.cvv}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Name on Card</label>
            <input
              type="text"
              value={paymentData.cardName}
              onChange={(e) => handleInputChange('cardName', e.target.value)}
              placeholder="John Doe"
              className={errors.cardName ? 'error' : ''}
            />
            {errors.cardName && <span className="error-message">{errors.cardName}</span>}
          </div>
        </div>
      )}

      {paymentMethod === 'bank' && (
        <div className="payment-form">
          <div className="bank-info">
            <div className="bank-icon">🏦</div>
            <h4>Bank Transfer</h4>
            <p>Pay directly from your bank account</p>
          </div>

          <div className="form-group">
            <label>Select Bank</label>
            <select
              value={paymentData.bankCode}
              onChange={(e) => handleInputChange('bankCode', e.target.value)}
              className={errors.bankCode ? 'error' : ''}
            >
              <option value="">Choose your bank</option>
              <option value="equity">Equity Bank</option>
              <option value="kcb">KCB Bank</option>
              <option value="cooperative">Co-operative Bank</option>
              <option value="absa">Absa Bank Kenya</option>
              <option value="stanbic">Stanbic Bank</option>
              <option value="ncba">NCBA Bank</option>
              <option value="dtb">Diamond Trust Bank</option>
            </select>
            {errors.bankCode && <span className="error-message">{errors.bankCode}</span>}
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              value={paymentData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              placeholder="Enter your account number"
              className={errors.bankAccount ? 'error' : ''}
            />
            {errors.bankAccount && <span className="error-message">{errors.bankAccount}</span>}
          </div>
        </div>
      )}

      <button 
        className="btn-primary payment-submit"
        onClick={handlePaymentSubmit}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay ${formatCurrency(booking.totalPrice)}`}
      </button>
    </div>
  )

  const renderProcessing = () => (
    <div className="payment-step processing">
      <div className="processing-animation">
        <div className="spinner"></div>
      </div>
      <h3>Processing Payment</h3>
      <p>Please don't close this window...</p>
      {paymentMethod === 'mpesa' && (
        <div className="mpesa-prompt">
          <p><strong>Check your phone for M-Pesa prompt</strong></p>
          <p>Enter your M-Pesa PIN to complete the payment</p>
        </div>
      )}
    </div>
  )

  const renderSuccess = () => (
    <div className="payment-step success">
      <div className="success-icon">✅</div>
      <h3>Payment Successful!</h3>
      <div className="payment-details">
        <p><strong>Transaction ID:</strong> {paymentResult?.transactionId}</p>
        <p><strong>Amount:</strong> {formatCurrency(booking.totalPrice)}</p>
        <p><strong>Method:</strong> {paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'card' ? 'Card' : 'Bank Transfer'}</p>
      </div>
      <div className="success-message">
        <p>Your booking has been confirmed and paid for. You'll receive a confirmation email shortly.</p>
        <p><strong>Booking Status:</strong> Confirmed & Paid</p>
      </div>
    </div>
  )

  const renderFailed = () => (
    <div className="payment-step failed">
      <div className="error-icon">❌</div>
      <h3>Payment Failed</h3>
      <div className="error-details">
        <p>{paymentResult?.error || 'Something went wrong with your payment.'}</p>
      </div>
      <div className="failed-actions">
        <button 
          className="btn-secondary"
          onClick={() => setPaymentStep('details')}
        >
          Try Again
        </button>
        <button 
          className="btn-primary"
          onClick={() => setPaymentStep('method')}
        >
          Change Payment Method
        </button>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-header">
          <h2>Complete Payment</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="booking-summary">
          <div className="summary-card">
            <img src={booking.carImage} alt={booking.carName} className="booking-car-thumb" />
            <div className="summary-details">
              <h4>{booking.carName}</h4>
              <p>{booking.pickupDate} to {booking.dropoffDate}</p>
              <p className="summary-total">{formatCurrency(booking.totalPrice)}</p>
            </div>
          </div>
        </div>

        <div className="payment-content">
          {paymentStep === 'method' && renderMethodSelection()}
          {paymentStep === 'details' && renderPaymentDetails()}
          {paymentStep === 'processing' && renderProcessing()}
          {paymentStep === 'success' && renderSuccess()}
          {paymentStep === 'failed' && renderFailed()}
        </div>

        <div className="payment-security">
          <div className="security-info">
            <span className="security-icon">🔒</span>
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
