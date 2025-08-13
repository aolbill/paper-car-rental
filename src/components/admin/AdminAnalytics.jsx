import React from 'react'
import { bookingService } from '../../services/bookingService'
import './AdminAnalytics.css'

const AdminAnalytics = ({ stats, onRefresh }) => {
  const bookings = bookingService.getAllBookings()
  const requests = bookingService.getAllRequests()

  // Calculate additional metrics
  const recentBookings = bookings.slice(0, 5)
  const popularCars = bookings.reduce((acc, booking) => {
    acc[booking.carName] = (acc[booking.carName] || 0) + 1
    return acc
  }, {})

  const topCars = Object.entries(popularCars)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    completed: '#6366f1',
    cancelled: '#ef4444'
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h2>📊 Business Analytics</h2>
        <button className="btn-secondary" onClick={onRefresh}>
          🔄 Refresh Data
        </button>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section">
          <h3>Booking Overview</h3>
          <div className="booking-stats">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.total || 0}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.pending || 0}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.confirmed || 0}</div>
                <div className="stat-label">Confirmed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.completed || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="status-chart">
              <h4>Booking Status Distribution</h4>
              <div className="status-bars">
                {Object.entries({
                  pending: stats.pending || 0,
                  confirmed: stats.confirmed || 0,
                  completed: stats.completed || 0,
                  cancelled: stats.cancelled || 0
                }).map(([status, count]) => (
                  <div key={status} className="status-bar">
                    <div className="status-info">
                      <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      <span className="status-count">{count}</span>
                    </div>
                    <div className="status-progress">
                      <div 
                        className="status-fill"
                        style={{ 
                          width: `${stats.total ? (count / stats.total) * 100 : 0}%`,
                          backgroundColor: statusColors[status]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h3>Revenue Analytics</h3>
          <div className="revenue-stats">
            <div className="revenue-cards">
              <div className="revenue-card">
                <h4>Total Revenue</h4>
                <div className="revenue-amount">KSH {(stats.revenue || 0).toLocaleString()}</div>
              </div>
              <div className="revenue-card">
                <h4>This Month</h4>
                <div className="revenue-amount">KSH {Math.floor((stats.revenue || 0) * 0.3).toLocaleString()}</div>
              </div>
              <div className="revenue-card">
                <h4>Average per Booking</h4>
                <div className="revenue-amount">
                  KSH {stats.total ? Math.floor((stats.revenue || 0) / stats.total).toLocaleString() : '0'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h3>Popular Cars</h3>
          <div className="popular-cars">
            {topCars.length > 0 ? (
              topCars.map(([carName, bookings], index) => (
                <div key={carName} className="car-ranking">
                  <div className="rank-number">#{index + 1}</div>
                  <div className="car-info">
                    <div className="car-name">{carName}</div>
                    <div className="car-bookings">{bookings} bookings</div>
                  </div>
                  <div className="booking-bar">
                    <div 
                      className="booking-fill"
                      style={{ width: `${(bookings / Math.max(...topCars.map(([,b]) => b))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No booking data available</div>
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Recent Activity</h3>
          <div className="recent-activity">
            <div className="activity-list">
              {recentBookings.map(booking => (
                <div key={booking.id} className="activity-item">
                  <div className="activity-icon">🚗</div>
                  <div className="activity-details">
                    <div className="activity-text">
                      New booking for <strong>{booking.carName}</strong>
                    </div>
                    <div className="activity-meta">
                      {new Date(booking.createdAt).toLocaleDateString()} • 
                      KSH {booking.totalPrice?.toLocaleString()}
                    </div>
                  </div>
                  <div 
                    className="activity-status"
                    style={{ backgroundColor: statusColors[booking.status] }}
                  >
                    {booking.status}
                  </div>
                </div>
              ))}
              
              {requests.slice(0, 3).map(request => (
                <div key={request.id} className="activity-item">
                  <div className="activity-icon">📨</div>
                  <div className="activity-details">
                    <div className="activity-text">
                      New contact request from <strong>{request.name}</strong>
                    </div>
                    <div className="activity-meta">
                      {new Date(request.createdAt).toLocaleDateString()} • 
                      {request.subject}
                    </div>
                  </div>
                  <div 
                    className="activity-status"
                    style={{ backgroundColor: request.status === 'pending' ? '#f59e0b' : '#10b981' }}
                  >
                    {request.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h3>System Status</h3>
          <div className="system-status">
            <div className="status-items">
              <div className="status-item">
                <div className="status-indicator active"></div>
                <span>Booking System</span>
                <span className="status-text">Operational</span>
              </div>
              <div className="status-item">
                <div className="status-indicator active"></div>
                <span>Payment Processing</span>
                <span className="status-text">Operational</span>
              </div>
              <div className="status-item">
                <div className="status-indicator active"></div>
                <span>Customer Support</span>
                <span className="status-text">Available</span>
              </div>
              <div className="status-item">
                <div className="status-indicator warning"></div>
                <span>Fleet Management</span>
                <span className="status-text">Maintenance Due</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">📋</span>
              <span>Export Bookings</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span>Generate Report</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📧</span>
              <span>Send Notifications</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🔧</span>
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
