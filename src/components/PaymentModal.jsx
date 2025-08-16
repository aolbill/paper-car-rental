import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import paymentService from '../services/paymentService'
import './PaymentModal.css'

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  bookingData, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [formData, setFormData] = useState({
    mpesa: {
      phoneNumber: ''
    },
    card: {
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setPaymentStatus(null)
      setIsProcessing(false)
    }
  }, [isOpen])

  const handleInputChange = (method, field, value) => {
    setFormData(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }))
  }

  const handleMpesaPayment = async () => {
    try {
      setIsProcessing(true)
      setPaymentStatus({ type: 'info', message: 'Initiating MPESA payment...' })

      const paymentData = {
        bookingId: bookingData.id,
        amount: bookingData.totalAmount,
        phoneNumber: formData.mpesa.phoneNumber,
        accountReference: bookingData.id,
        transactionDesc: `Car rental payment for ${bookingData.carName}`
      }

      const result = await paymentService.initiateMpesaPayment(paymentData)

      if (result.success) {
        setPaymentStatus({ 
          type: 'success', 
          message: 'STK push sent to your phone. Please complete the payment.' 
        })

        // Subscribe to payment status updates
        const unsubscribe = paymentService.subscribeToPaymentStatus(
          result.data.paymentId,
          (statusUpdate) => {
            if (statusUpdate.success) {
              const payment = statusUpdate.data
              
              if (payment.status === 'completed') {
                setPaymentStatus({ 
                  type: 'success', 
                  message: 'Payment completed successfully!' 
                })
                onPaymentSuccess && onPaymentSuccess(payment)
                setTimeout(() => {
                  onClose()
                }, 2000)
              } else if (payment.status === 'failed') {
                setPaymentStatus({ 
                  type: 'error', 
                  message: payment.mpesaResultDesc || 'Payment failed. Please try again.' 
                })
                setIsProcessing(false)
              }
            }
          }
        )

        // Cleanup subscription after 5 minutes
        setTimeout(() => {
          unsubscribe && unsubscribe()
        }, 300000)

      } else {
        setPaymentStatus({ type: 'error', message: result.error })
        setIsProcessing(false)
      }
    } catch (error) {
      setPaymentStatus({ type: 'error', message: error.message })
      setIsProcessing(false)
    }
  }

  const handleCardPayment = async () => {
    try {
      setIsProcessing(true)
      setPaymentStatus({ type: 'info', message: 'Processing card payment...' })

      const paymentData = {
        bookingId: bookingData.id,
        amount: bookingData.totalAmount,
        cardDetails: formData.card,
        customerInfo: {
          email: user?.email || '',
          name: formData.card.name
        }
      }

      const result = await paymentService.initiateCardPayment(paymentData)

      if (result.success) {
        // In a real implementation, you would handle 3D Secure here
        setPaymentStatus({ 
          type: 'success', 
          message: 'Card payment processed successfully!' 
        })
        
        onPaymentSuccess && onPaymentSuccess(result.data)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setPaymentStatus({ type: 'error', message: result.error })
      }
    } catch (error) {
      setPaymentStatus({ type: 'error', message: error.message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (paymentMethod === 'mpesa') {
      await handleMpesaPayment()
    } else if (paymentMethod === 'card') {
      await handleCardPayment()
    }
  }

  const formatPhoneNumber = (value) => {
    // Auto-format phone number
    const numbers = value.replace(/\D/g, '')
    if (numbers.startsWith('0')) {
      return '+254 ' + numbers.slice(1)
    } else if (numbers.startsWith('254')) {
      return '+' + numbers
    } else if (numbers.length <= 9) {
      return '+254 ' + numbers
    }
    return value
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  if (!isOpen) return null

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Complete Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-modal-content">
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-item">
              <span>Vehicle:</span>
              <span>{bookingData?.carName}</span>
            </div>
            <div className="summary-item">
              <span>Duration:</span>
              <span>{bookingData?.totalDays} days</span>
            </div>
            <div className="summary-item">
              <span>Rate:</span>
              <span>KSH {bookingData?.pricePerDay?.toLocaleString()}/day</span>
            </div>
            <div className="summary-item total">
              <span>Total Amount:</span>
              <span>KSH {bookingData?.totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="payment-method-tabs">
              <button
                className={`method-tab ${paymentMethod === 'mpesa' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('mpesa')}
                disabled={isProcessing}
              >
                <span className="mpesa-icon">📱</span>
                MPESA
              </button>
              <button
                className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
                disabled={isProcessing}
              >
                <span className="card-icon">💳</span>
                Card
              </button>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              {paymentMethod === 'mpesa' && (
                <div className="mpesa-form">
                  <div className="form-group">
                    <label htmlFor="mpesa-phone">MPESA Phone Number</label>
                    <input
                      type="tel"
                      id="mpesa-phone"
                      placeholder="0712345678"
                      value={formData.mpesa.phoneNumber}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value)
                        handleInputChange('mpesa', 'phoneNumber', formatted)
                      }}
                      required
                      disabled={isProcessing}
                    />
                    <small className="form-hint">
                      Enter your MPESA registered phone number
                    </small>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label htmlFor="card-name">Cardholder Name</label>
                    <input
                      type="text"
                      id="card-name"
                      placeholder="John Doe"
                      value={formData.card.name}
                      onChange={(e) => handleInputChange('card', 'name', e.target.value)}
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="card-number">Card Number</label>
                    <input
                      type="text"
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={formData.card.number}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value)
                        handleInputChange('card', 'number', formatted)
                      }}
                      maxLength="19"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="card-expiry">Expiry Date</label>
                      <input
                        type="text"
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={formData.card.expiry}
                        onChange={(e) => {
                          const formatted = formatExpiry(e.target.value)
                          handleInputChange('card', 'expiry', formatted)
                        }}
                        maxLength="5"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="card-cvv">CVV</label>
                      <input
                        type="text"
                        id="card-cvv"
                        placeholder="123"
                        value={formData.card.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          handleInputChange('card', 'cvv', value)
                        }}
                        maxLength="4"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus && (
                <div className={`payment-status ${paymentStatus.type}`}>
                  {paymentStatus.message}
                </div>
              )}

              <div className="payment-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    `Pay KSH ${bookingData?.totalAmount?.toLocaleString()}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
