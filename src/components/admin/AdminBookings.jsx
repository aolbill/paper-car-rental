import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import './AdminBookings.css'

const AdminBookings = ({ onRefresh }) => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, statusFilter, dateFilter, searchTerm])

  const loadBookings = () => {
    const allBookings = bookingService.getAllBookings()
    setBookings(allBookings)
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Date filter
    const today = new Date()
    if (dateFilter === 'today') {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.createdAt)
        return bookingDate.toDateString() === today.toDateString()
      })
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(booking => new Date(booking.createdAt) >= weekAgo)
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(booking => new Date(booking.createdAt) >= monthAgo)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.dropoffLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toString().includes(searchTerm)
      )
    }

    setFilteredBookings(filtered)
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus, user)
      loadBookings()
      onRefresh()
      alert(`Booking status updated to ${newStatus}`)
    } catch (error) {
      alert(`Failed to update booking: ${error.message}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'confirmed': return '#10b981'
      case 'completed': return '#6366f1'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetails(true)
  }

  return (
    <div className="admin-bookings">
      <div className="bookings-header">
        <h2>📋 Booking Management</h2>
        <div className="bookings-actions">
          <button className="btn-secondary" onClick={loadBookings}>
            🔄 Refresh
          </button>
          <button className="btn-primary">
            📥 Export Data
          </button>
        </div>
      </div>

      <div className="bookings-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="dateFilter">Date Range:</label>
          <select
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchTerm">Search:</label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by car, location, or booking ID..."
          />
        </div>
      </div>

      <div className="bookings-stats">
        <div className="stat-summary">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Car</th>
              <th>Customer</th>
              <th>Dates</th>
              <th>Location</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => (
              <tr key={booking.id}>
                <td>
                  <div className="booking-id">#{booking.id}</div>
                  <div className="booking-date">{formatDate(booking.createdAt)}</div>
                </td>
                <td>
                  <div className="car-info">
                    <div className="car-name">{booking.carName}</div>
                    <div className="car-details">{booking.days} days</div>
                  </div>
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">User #{booking.userId}</div>
                    <div className="customer-license">{booking.driverLicense}</div>
                  </div>
                </td>
                <td>
                  <div className="booking-dates">
                    <div className="pickup-date">
                      📅 {new Date(booking.pickupDate).toLocaleDateString()}
                    </div>
                    <div className="dropoff-date">
                      📅 {new Date(booking.dropoffDate).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="locations">
                    <div className="pickup">📍 {booking.pickupLocation}</div>
                    <div className="dropoff">📍 {booking.dropoffLocation}</div>
                  </div>
                </td>
                <td>
                  <div className="amount">KSH {booking.totalPrice?.toLocaleString()}</div>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="booking-actions">
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => viewBookingDetails(booking)}
                    >
                      View
                    </button>
                    
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="btn-small btn-success"
                          onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-small btn-danger"
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => handleStatusChange(booking.id, 'completed')}
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="no-bookings">
            <h3>No bookings found</h3>
            <p>No bookings match your current filters.</p>
          </div>
        )}
      </div>

      {showDetails && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="booking-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
            
            <h3>Booking Details #{selectedBooking.id}</h3>
            
            <div className="details-grid">
              <div className="detail-section">
                <h4>Car Information</h4>
                <p><strong>Car:</strong> {selectedBooking.carName}</p>
                <p><strong>Duration:</strong> {selectedBooking.days} days</p>
                <p><strong>Base Price:</strong> KSH {selectedBooking.basePrice?.toLocaleString()}</p>
                <p><strong>Tax (16%):</strong> KSH {selectedBooking.tax?.toLocaleString()}</p>
                <p><strong>Total:</strong> KSH {selectedBooking.totalPrice?.toLocaleString()}</p>
              </div>
              
              <div className="detail-section">
                <h4>Booking Details</h4>
                <p><strong>Pickup Date:</strong> {selectedBooking.pickupDate} at {selectedBooking.pickupTime}</p>
                <p><strong>Dropoff Date:</strong> {selectedBooking.dropoffDate} at {selectedBooking.dropoffTime}</p>
                <p><strong>Pickup Location:</strong> {selectedBooking.pickupLocation}</p>
                <p><strong>Dropoff Location:</strong> {selectedBooking.dropoffLocation}</p>
              </div>
              
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p><strong>User ID:</strong> {selectedBooking.userId}</p>
                <p><strong>Driver License:</strong> {selectedBooking.driverLicense}</p>
                <p><strong>Special Requests:</strong> {selectedBooking.specialRequests || 'None'}</p>
              </div>
              
              <div className="detail-section">
                <h4>Booking Status</h4>
                <p><strong>Current Status:</strong> 
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedBooking.status), marginLeft: '8px' }}
                  >
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                </p>
                <p><strong>Created:</strong> {formatDate(selectedBooking.createdAt)}</p>
                {selectedBooking.updatedAt && (
                  <p><strong>Last Updated:</strong> {formatDate(selectedBooking.updatedAt)}</p>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedBooking.status === 'pending' && (
                <>
                  <button 
                    className="btn-success"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, 'confirmed')
                      setShowDetails(false)
                    }}
                  >
                    Approve Booking
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, 'cancelled')
                      setShowDetails(false)
                    }}
                  >
                    Reject Booking
                  </button>
                </>
              )}
              
              {selectedBooking.status === 'confirmed' && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    handleStatusChange(selectedBooking.id, 'completed')
                    setShowDetails(false)
                  }}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBookings
