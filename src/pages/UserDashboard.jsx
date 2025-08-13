import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, Navigate } from 'react-router-dom'
import './UserDashboard.css'

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
      
      // Mock bookings data
      setBookings([
        {
          id: 1,
          carName: 'Toyota Vitz',
          carImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=200&fit=crop',
          pickupDate: '2024-08-20',
          dropoffDate: '2024-08-25',
          pickupLocation: 'JKIA Airport',
          dropoffLocation: 'Nairobi CBD',
          totalAmount: 17500,
          status: 'confirmed',
          bookingDate: '2024-08-15'
        },
        {
          id: 2,
          carName: 'Nissan X-Trail',
          carImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&h=200&fit=crop',
          pickupDate: '2024-07-10',
          dropoffDate: '2024-07-15',
          pickupLocation: 'Wilson Airport',
          dropoffLocation: 'Maasai Mara',
          totalAmount: 42500,
          status: 'completed',
          bookingDate: '2024-07-05'
        },
        {
          id: 3,
          carName: 'Honda Freed',
          carImage: 'https://images.unsplash.com/photo-1506764543633-6b5f8f82c78a?w=300&h=200&fit=crop',
          pickupDate: '2024-09-01',
          dropoffDate: '2024-09-07',
          pickupLocation: 'Nairobi CBD',
          dropoffLocation: 'Mombasa',
          totalAmount: 45500,
          status: 'upcoming',
          bookingDate: '2024-08-10'
        }
      ])
    }
  }, [user])

  if (!isAuthenticated) {
    return <Navigate to="/" />
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#2563eb'
      case 'completed': return '#16a34a'
      case 'upcoming': return '#ea580c'
      case 'cancelled': return '#dc2626'
      default: return '#64748b'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleProfileUpdate = (e) => {
    e.preventDefault()
    // Mock profile update
    alert('Profile updated successfully!')
  }

  return (
    <div className="user-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.name}!</h1>
          <p>Manage your bookings and profile</p>
        </div>

        <div className="dashboard-nav">
          <button 
            className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
          <button 
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
          <button 
            className={`nav-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorite Cars
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'bookings' && (
            <div className="bookings-section">
              <div className="section-header">
                <h2>My Bookings</h2>
                <Link to="/cars" className="btn-primary">Book New Car</Link>
              </div>

              {bookings.length === 0 ? (
                <div className="empty-state">
                  <h3>No bookings yet</h3>
                  <p>Start exploring our fleet and book your first rental!</p>
                  <Link to="/cars" className="btn-primary">Browse Cars</Link>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-image">
                        <img src={booking.carImage} alt={booking.carName} />
                      </div>
                      
                      <div className="booking-details">
                        <div className="booking-header">
                          <h3>{booking.carName}</h3>
                          <div 
                            className="booking-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="booking-info">
                          <div className="booking-dates">
                            <span>📅 {formatDate(booking.pickupDate)} - {formatDate(booking.dropoffDate)}</span>
                          </div>
                          <div className="booking-locations">
                            <span>📍 {booking.pickupLocation} → {booking.dropoffLocation}</span>
                          </div>
                          <div className="booking-amount">
                            <span>💰 Total: KSH {booking.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="booking-actions">
                        <button className="btn-secondary">View Details</button>
                        {booking.status === 'upcoming' && (
                          <button className="btn-primary">Modify Booking</button>
                        )}
                        {booking.status === 'completed' && (
                          <button className="btn-secondary">Leave Review</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Settings</h2>
              
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        placeholder="+254700000000"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Member Since</label>
                      <input
                        type="text"
                        value={formatDate(user.joinDate)}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Preferences</h3>
                  
                  <div className="preference-group">
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      Email notifications for booking confirmations
                    </label>
                  </div>
                  
                  <div className="preference-group">
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      SMS notifications for pickup reminders
                    </label>
                  </div>
                  
                  <div className="preference-group">
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      Marketing emails about special offers
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-primary">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-section">
              <h2>Favorite Cars</h2>
              <div className="empty-state">
                <h3>No favorite cars yet</h3>
                <p>Add cars to your favorites while browsing our fleet!</p>
                <Link to="/cars" className="btn-primary">Browse Cars</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
