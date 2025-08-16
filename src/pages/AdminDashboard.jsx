import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import { Navigate } from 'react-router-dom'
import firebaseBookingService from '../services/firebaseBookingService'
import firebaseCarService from '../services/firebaseCarService'
import AdminBookings from '../components/admin/AdminBookings'
import AdminCarsManager from '../components/admin/AdminCarsManager'
import AdminRequests from '../components/admin/AdminRequests'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import AdminMessaging from '../components/admin/AdminMessaging'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user, userProfile, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('analytics')
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin' || user?.email === 'admin@papercarrental.com'

  useEffect(() => {
    if (isAdmin) {
      loadStats()
    }
    setLoading(false)
  }, [isAdmin, refreshTrigger])

  const loadStats = async () => {
    try {
      const [bookingStats, carStats] = await Promise.all([
        firebaseBookingService.getBookingStatistics(),
        firebaseCarService.getCarStatistics()
      ])

      setStats({
        bookings: bookingStats.success ? bookingStats.data : {},
        cars: carStats.success ? carStats.data : {}
      })
    } catch (error) {
      console.error('Error loading admin stats:', error)
    }
  }

  // Redirect if not admin
  if (!isAuthenticated || (!loading && !isAdmin)) {
    return <Navigate to="/" />
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'bookings', label: 'Bookings', icon: '📋' },
    { id: 'cars', label: 'Cars', icon: '🚗' },
    { id: 'requests', label: 'Requests', icon: '📨' },
    { id: 'messaging', label: 'Messages', icon: '💬' }
  ]

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="container">
          <div className="admin-welcome">
            <h1>🛡️ Admin Dashboard</h1>
            <p>Welcome back, {user.name}! Manage your car rental business from here.</p>
          </div>
          
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-details">
                <h3>{stats.pending || 0}</h3>
                <p>Pending Bookings</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-details">
                <h3>{stats.confirmed || 0}</h3>
                <p>Active Bookings</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-details">
                <h3>KSH {(stats.revenue || 0).toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-details">
                <h3>{stats.thisMonth || 0}</h3>
                <p>This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          <div className="admin-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="admin-tab-content">
            {activeTab === 'analytics' && (
              <AdminAnalytics stats={stats} onRefresh={handleRefresh} />
            )}
            
            {activeTab === 'bookings' && (
              <AdminBookings onRefresh={handleRefresh} />
            )}
            
            {activeTab === 'cars' && (
              <AdminCars onRefresh={handleRefresh} />
            )}
            
            {activeTab === 'requests' && (
              <AdminRequests onRefresh={handleRefresh} />
            )}

            {activeTab === 'messaging' && (
              <AdminMessaging />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
