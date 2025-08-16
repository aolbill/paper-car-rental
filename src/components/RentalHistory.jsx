import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import { useNotifications } from '../context/NotificationContext'
import firebaseBookingService from '../services/firebaseBookingService'
import './RentalHistory.css'

const RentalHistory = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useNotifications()
  const [bookings, setBookings] = useState([])
  const [upcomingBookings, setUpcomingBookings] = useState([])
  const [historyBookings, setHistoryBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    setLoading(true)
    try {
      // Load all user bookings
      const allBookingsResult = await firebaseBookingService.getUserBookings(user.uid)
      if (allBookingsResult.success) {
        setBookings(allBookingsResult.data)
        
        // Separate upcoming and history
        const now = new Date()
        const upcoming = allBookingsResult.data.filter(booking => {
          const pickupDate = new Date(booking.pickupDate)
          return pickupDate >= now && ['confirmed', 'active'].includes(booking.status)
        })
        
        const history = allBookingsResult.data.filter(booking => {
          const pickupDate = new Date(booking.pickupDate)
          return pickupDate < now || ['completed', 'cancelled'].includes(booking.status)
        })
        
        setUpcomingBookings(upcoming)
        setHistoryBookings(history)
      } else {
        showError('Error', 'Failed to load bookings')
      }
    } catch (error) {
      showError('Error', 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) return

    try {
      const result = await firebaseBookingService.cancelBooking(
        selectedBooking.id,
        cancelReason,
        calculateRefundAmount(selectedBooking)
      )

      if (result.success) {
        showSuccess('Success', 'Booking cancelled successfully')
        setShowCancelModal(false)
        setSelectedBooking(null)
        setCancelReason('')
        loadBookings()
      } else {
        showError('Error', result.error)
      }
    } catch (error) {
      showError('Error', 'Failed to cancel booking')
    }
  }

  const calculateRefundAmount = (booking) => {
    const now = new Date()
    const pickupDate = new Date(booking.pickupDate)
    const hoursUntilPickup = (pickupDate - now) / (1000 * 60 * 60)

    // Refund policy: 
    // - More than 48 hours: 90% refund
    // - 24-48 hours: 50% refund
    // - Less than 24 hours: No refund
    if (hoursUntilPickup > 48) {
      return booking.totalAmount * 0.9
    } else if (hoursUntilPickup > 24) {
      return booking.totalAmount * 0.5
    } else {
      return 0
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      active: '#3b82f6',
      completed: '#6b7280',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      active: '🚗',
      completed: '🏁',
      cancelled: '❌'
    }
    return icons[status] || '📋'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const BookingCard = ({ booking }) => (
    <div className="booking-card">
      <div className="booking-header">
        <div className="car-info">
          <h3>{booking.carName}</h3>
          <p className="booking-id">#{booking.id}</p>
        </div>
        <div className="booking-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(booking.status) }}
          >
            {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="booking-details">
        <div className="detail-row">
          <span className="label">📅 Pickup:</span>
          <span className="value">{formatDate(booking.pickupDate)}</span>
        </div>
        <div className="detail-row">
          <span className="label">📅 Return:</span>
          <span className="value">{formatDate(booking.dropoffDate)}</span>
        </div>
        <div className="detail-row">
          <span className="label">📍 Location:</span>
          <span className="value">{booking.pickupLocation || 'Not specified'}</span>
        </div>
        <div className="detail-row">
          <span className="label">⏱️ Duration:</span>
          <span className="value">{booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}</span>
        </div>
        <div className="detail-row">
          <span className="label">💰 Total:</span>
          <span className="value">KES {booking.totalAmount.toLocaleString()}</span>
        </div>
        {booking.paymentStatus && (
          <div className="detail-row">
            <span className="label">💳 Payment:</span>
            <span className={`value payment-${booking.paymentStatus}`}>
              {booking.paymentStatus.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="booking-actions">
        <button
          onClick={() => setSelectedBooking(booking)}
          className="view-details-button"
        >
          View Details
        </button>
        
        {booking.status === 'confirmed' && activeTab === 'upcoming' && (
          <button
            onClick={() => {
              setSelectedBooking(booking)
              setShowCancelModal(true)
            }}
            className="cancel-button"
          >
            Cancel Booking
          </button>
        )}
        
        {booking.status === 'completed' && (
          <button
            onClick={() => {/* Add review functionality */}}
            className="review-button"
          >
            Add Review
          </button>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="rental-history">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rental-history">
      <div className="history-header">
        <h2>My Bookings</h2>
        <p>Track your car rental history and upcoming trips</p>
      </div>

      <div className="history-tabs">
        <button
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({historyBookings.length})
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'upcoming' && (
          <div className="bookings-section">
            {upcomingBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🚗</div>
                <h3>No Upcoming Bookings</h3>
                <p>You don't have any upcoming trips. Book a car to start your next adventure!</p>
                <button
                  onClick={() => window.location.href = '/cars'}
                  className="browse-cars-button"
                >
                  Browse Cars
                </button>
              </div>
            ) : (
              <div className="bookings-grid">
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bookings-section">
            {historyBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Booking History</h3>
                <p>Your completed and past bookings will appear here.</p>
              </div>
            ) : (
              <div className="bookings-grid">
                {historyBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && !showCancelModal && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-detail-section">
                <h4>Trip Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Car:</label>
                    <span>{selectedBooking.carName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Booking ID:</label>
                    <span>#{selectedBooking.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pickup Date:</label>
                    <span>{formatDateTime(selectedBooking.pickupDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Return Date:</label>
                    <span>{formatDateTime(selectedBooking.dropoffDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pickup Location:</label>
                    <span>{selectedBooking.pickupLocation || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Return Location:</label>
                    <span>{selectedBooking.dropoffLocation || 'Same as pickup'}</span>
                  </div>
                </div>
              </div>

              <div className="booking-detail-section">
                <h4>Payment Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Total Amount:</label>
                    <span>KES {selectedBooking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Status:</label>
                    <span className={`payment-${selectedBooking.paymentStatus}`}>
                      {selectedBooking.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Price per Day:</label>
                    <span>KES {selectedBooking.pricePerDay?.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Days:</label>
                    <span>{selectedBooking.totalDays}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.customerNotes && (
                <div className="booking-detail-section">
                  <h4>Notes</h4>
                  <p>{selectedBooking.customerNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Booking</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="cancel-info">
                <p><strong>Booking:</strong> {selectedBooking.carName}</p>
                <p><strong>Pickup Date:</strong> {formatDate(selectedBooking.pickupDate)}</p>
                <p><strong>Total Amount:</strong> KES {selectedBooking.totalAmount.toLocaleString()}</p>
                
                <div className="refund-info">
                  <p><strong>Refund Amount:</strong> KES {calculateRefundAmount(selectedBooking).toLocaleString()}</p>
                  <small>
                    Refund policy: 90% if cancelled 48+ hours before pickup, 
                    50% if 24-48 hours, no refund if less than 24 hours.
                  </small>
                </div>
              </div>

              <div className="cancel-form">
                <label>Reason for cancellation:</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling (optional)"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="secondary-button"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="danger-button"
                  disabled={!cancelReason.trim()}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RentalHistory
