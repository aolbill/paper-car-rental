import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { locations } from '../data/cars'
import { bookingService } from '../services/bookingService'
import PaymentModal from './PaymentModal'
import './BookingModal.css'

const BookingModal = ({ isOpen, onClose, car }) => {
  const { user, isAuthenticated } = useAuth()
  const [bookingData, setBookingData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '09:00',
    dropoffTime: '18:00',
    driverLicense: '',
    specialRequests: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conflictCheck, setConflictCheck] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [createdBooking, setCreatedBooking] = useState(null)

  if (!isOpen || !car) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingData({
      ...bookingData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }

    // Check for conflicts when dates change
    if (name === 'pickupDate' || name === 'dropoffDate') {
      const pickup = name === 'pickupDate' ? value : bookingData.pickupDate
      const dropoff = name === 'dropoffDate' ? value : bookingData.dropoffDate
      
      if (pickup && dropoff && car.id) {
        const conflict = bookingService.checkDateConflict(car.id, pickup, dropoff)
        setConflictCheck(conflict)
      }
    }
  }

  const calculateDays = () => {
    if (!bookingData.pickupDate || !bookingData.dropoffDate) return 0
    const pickup = new Date(bookingData.pickupDate)
    const dropoff = new Date(bookingData.dropoffDate)
    const diffTime = Math.abs(dropoff - pickup)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  const calculateTotal = () => {
    const days = calculateDays()
    const basePrice = car.price * days
    const tax = basePrice * 0.16 // 16% VAT in Kenya
    return {
      basePrice,
      tax,
      total: basePrice + tax,
      days
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!bookingData.pickupLocation) {
      newErrors.pickupLocation = 'Pickup location is required'
    }

    if (!bookingData.dropoffLocation) {
      newErrors.dropoffLocation = 'Dropoff location is required'
    }

    if (!bookingData.pickupDate) {
      newErrors.pickupDate = 'Pickup date is required'
    }

    if (!bookingData.dropoffDate) {
      newErrors.dropoffDate = 'Dropoff date is required'
    }

    if (bookingData.pickupDate && bookingData.dropoffDate) {
      const pickup = new Date(bookingData.pickupDate)
      const dropoff = new Date(bookingData.dropoffDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (pickup < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past'
      }

      if (dropoff <= pickup) {
        newErrors.dropoffDate = 'Dropoff date must be after pickup date'
      }

      // Check for conflicts
      if (conflictCheck?.hasConflict) {
        newErrors.dropoffDate = 'Car is not available for these dates'
      }
    }

    if (!bookingData.driverLicense) {
      newErrors.driverLicense = 'Driver license number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const pricing = calculateTotal()
      const bookingRequestData = {
        carId: car.id,
        carName: car.name,
        carImage: car.image,
        ...bookingData,
        basePrice: pricing.basePrice,
        tax: pricing.tax,
        totalPrice: pricing.total,
        days: pricing.days
      }

      const result = await bookingService.createBooking(bookingRequestData, user)

      if (result.success) {
        // Store the created booking for payment
        setCreatedBooking(result.booking)

        // Show payment modal instead of just confirming booking
        setShowPaymentModal(true)
      } else {
        setErrors({ general: result.error })
      }
    } catch (error) {
      setErrors({ general: 'Booking failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = (paymentResult) => {
    // Close both modals
    setShowPaymentModal(false)
    onClose()

    // Reset form
    resetForm()

    // Show success message
    alert(`🎉 Booking confirmed and payment successful!\n\nTransaction ID: ${paymentResult.transactionId}\n\nYour car rental is confirmed. You'll receive a confirmation email shortly with pickup instructions.`)
  }

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false)
    // Don't close the main booking modal so user can try payment again
  }

  const resetForm = () => {
    setBookingData({
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: '',
      dropoffDate: '',
      pickupTime: '09:00',
      dropoffTime: '18:00',
      driverLicense: '',
      specialRequests: ''
    })
    setConflictCheck(null)
    setCreatedBooking(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <div className="auth-required">
            <h3>🔐 Login Required</h3>
            <p>You must be signed in to make a booking. Please create an account or sign in to continue.</p>
            <div className="auth-benefits">
              <h4>Benefits of creating an account:</h4>
              <ul>
                <li>✓ Track your bookings in real-time</li>
                <li>✓ Access booking history</li>
                <li>✓ Faster checkout for future rentals</li>
                <li>✓ Exclusive member discounts</li>
                <li>✓ Priority customer support</li>
              </ul>
            </div>
            <button className="btn-primary" onClick={onClose}>
              Sign In / Create Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pricing = calculateTotal()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="booking-header">
          <img src={car.image} alt={car.name} className="booking-car-image" />
          <div className="booking-car-info">
            <h3>{car.name}</h3>
            <p className="car-category">{car.category}</p>
            <div className="car-price">
              KSH {car.price.toLocaleString()} / day
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          {conflictCheck?.hasConflict && (
            <div className="conflict-warning">
              <h4>⚠️ Booking Conflict Detected</h4>
              <p>This car is not available for the selected dates. There's an overlap with an existing booking from {conflictCheck.conflicts[0]?.pickupDate} to {conflictCheck.conflicts[0]?.dropoffDate}.</p>
              <p>Please select different dates or choose another vehicle.</p>
            </div>
          )}

          <div className="form-section">
            <h4>Rental Details</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pickupLocation">Pickup Location</label>
                <select
                  id="pickupLocation"
                  name="pickupLocation"
                  value={bookingData.pickupLocation}
                  onChange={handleInputChange}
                  className={errors.pickupLocation ? 'error' : ''}
                  required
                >
                  <option value="">Select pickup location</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
                {errors.pickupLocation && (
                  <span className="error-message">{errors.pickupLocation}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dropoffLocation">Dropoff Location</label>
                <select
                  id="dropoffLocation"
                  name="dropoffLocation"
                  value={bookingData.dropoffLocation}
                  onChange={handleInputChange}
                  className={errors.dropoffLocation ? 'error' : ''}
                  required
                >
                  <option value="">Select dropoff location</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
                {errors.dropoffLocation && (
                  <span className="error-message">{errors.dropoffLocation}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pickupDate">Pickup Date</label>
                <input
                  type="date"
                  id="pickupDate"
                  name="pickupDate"
                  value={bookingData.pickupDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.pickupDate ? 'error' : ''}
                  required
                />
                {errors.pickupDate && (
                  <span className="error-message">{errors.pickupDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="pickupTime">Pickup Time</label>
                <input
                  type="time"
                  id="pickupTime"
                  name="pickupTime"
                  value={bookingData.pickupTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dropoffDate">Dropoff Date</label>
                <input
                  type="date"
                  id="dropoffDate"
                  name="dropoffDate"
                  value={bookingData.dropoffDate}
                  onChange={handleInputChange}
                  min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                  className={errors.dropoffDate ? 'error' : ''}
                  required
                />
                {errors.dropoffDate && (
                  <span className="error-message">{errors.dropoffDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dropoffTime">Dropoff Time</label>
                <input
                  type="time"
                  id="dropoffTime"
                  name="dropoffTime"
                  value={bookingData.dropoffTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Driver Information</h4>
            
            <div className="form-group">
              <label htmlFor="driverLicense">Driver License Number</label>
              <input
                type="text"
                id="driverLicense"
                name="driverLicense"
                value={bookingData.driverLicense}
                onChange={handleInputChange}
                placeholder="Enter your license number"
                className={errors.driverLicense ? 'error' : ''}
                required
              />
              {errors.driverLicense && (
                <span className="error-message">{errors.driverLicense}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">Special Requests (Optional)</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={bookingData.specialRequests}
                onChange={handleInputChange}
                placeholder="Any special requirements or requests..."
                rows="3"
              />
            </div>
          </div>

          {pricing.days > 0 && !conflictCheck?.hasConflict && (
            <div className="pricing-summary">
              <h4>Pricing Summary</h4>
              <div className="pricing-details">
                <div className="pricing-row">
                  <span>Rental ({pricing.days} days × KSH {car.price.toLocaleString()})</span>
                  <span>KSH {pricing.basePrice.toLocaleString()}</span>
                </div>
                <div className="pricing-row">
                  <span>VAT (16%)</span>
                  <span>KSH {pricing.tax.toLocaleString()}</span>
                </div>
                <div className="pricing-row total">
                  <span>Total Amount</span>
                  <span>KSH {pricing.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="booking-notice">
                <p><strong>Next Step:</strong> After submitting this booking, you'll be taken to secure payment to confirm your reservation instantly.</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary booking-submit"
            disabled={isSubmitting || pricing.days === 0 || conflictCheck?.hasConflict}
          >
            {isSubmitting ? 'Processing...' : `Continue to Payment (KSH ${pricing.total.toLocaleString()})`}
          </button>
        </form>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        booking={createdBooking}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default BookingModal
