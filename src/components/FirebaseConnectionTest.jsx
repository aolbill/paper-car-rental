import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import firebaseCarService from '../services/firebaseCarService'
import firebaseBookingService from '../services/firebaseBookingService'
import paymentService from '../services/paymentService'
import './FirebaseConnectionTest.css'

const FirebaseConnectionTest = () => {
  const { user, isAuthenticated } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState({
    firebase: 'checking',
    cars: 'checking',
    bookings: 'checking',
    payments: 'checking',
    auth: 'checking'
  })
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    runConnectivityTests()
  }, [])

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date() }])
    setConnectionStatus(prev => ({ ...prev, [test]: status }))
  }

  const runConnectivityTests = async () => {
    // Test Firebase initialization
    try {
      const { auth, db } = await import('../lib/firebase')
      if (auth && db) {
        addTestResult('firebase', 'success', 'Firebase initialized successfully')
      } else {
        addTestResult('firebase', 'error', 'Firebase services not available')
      }
    } catch (error) {
      addTestResult('firebase', 'error', `Firebase initialization failed: ${error.message}`)
    }

    // Test Authentication
    try {
      if (isAuthenticated && user) {
        addTestResult('auth', 'success', `User authenticated: ${user.email}`)
      } else {
        addTestResult('auth', 'warning', 'No user currently authenticated')
      }
    } catch (error) {
      addTestResult('auth', 'error', `Auth test failed: ${error.message}`)
    }

    // Test Cars service
    try {
      const carsResult = await firebaseCarService.getAllCars()
      if (carsResult.success) {
        addTestResult('cars', 'success', `Cars service working. Found ${carsResult.data.length} cars`)
      } else {
        addTestResult('cars', 'warning', `Cars service accessible but no data: ${carsResult.error}`)
      }
    } catch (error) {
      addTestResult('cars', 'error', `Cars service failed: ${error.message}`)
    }

    // Test Bookings service
    try {
      const bookingsResult = await firebaseBookingService.getAllBookings()
      if (bookingsResult.success) {
        addTestResult('bookings', 'success', `Bookings service working. Found ${bookingsResult.data.length} bookings`)
      } else {
        addTestResult('bookings', 'warning', `Bookings service accessible but no data: ${bookingsResult.error}`)
      }
    } catch (error) {
      addTestResult('bookings', 'error', `Bookings service failed: ${error.message}`)
    }

    // Test Payment service
    try {
      const paymentStats = await paymentService.getPaymentStatistics()
      if (paymentStats.success) {
        addTestResult('payments', 'success', `Payment service working. Found ${paymentStats.data.totalPayments} payments`)
      } else {
        addTestResult('payments', 'warning', `Payment service accessible but no data: ${paymentStats.error}`)
      }
    } catch (error) {
      addTestResult('payments', 'error', `Payment service failed: ${error.message}`)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'checking': return '🔄'
      default: return '❓'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
      case 'checking': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <div className="firebase-test-container">
      <div className="test-header">
        <h2>🔥 Firebase Connectivity Test</h2>
        <p>Testing real-time connectivity and data flow</p>
      </div>

      <div className="connection-status">
        <h3>Connection Status</h3>
        <div className="status-grid">
          {Object.entries(connectionStatus).map(([service, status]) => (
            <div key={service} className="status-item">
              <div className="status-icon">{getStatusIcon(status)}</div>
              <div className="status-info">
                <span className="service-name">{service.charAt(0).toUpperCase() + service.slice(1)}</span>
                <span 
                  className="status-text" 
                  style={{ color: getStatusColor(status) }}
                >
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="test-results">
        <h3>Test Results</h3>
        <div className="results-list">
          {testResults.map((result, index) => (
            <div 
              key={index} 
              className={`result-item ${result.status}`}
            >
              <div className="result-icon">{getStatusIcon(result.status)}</div>
              <div className="result-content">
                <div className="result-header">
                  <span className="test-name">{result.test}</span>
                  <span className="test-time">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="result-message">{result.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="test-actions">
        <button 
          className="btn btn-primary"
          onClick={runConnectivityTests}
        >
          🔄 Run Tests Again
        </button>
      </div>

      <div className="integration-info">
        <h3>Integration Summary</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>🔥 Firebase:</strong>
            <span>Real-time database with Firestore</span>
          </div>
          <div className="info-item">
            <strong>🚗 Cars:</strong>
            <span>Real-time vehicle inventory updates</span>
          </div>
          <div className="info-item">
            <strong>📅 Bookings:</strong>
            <span>Live booking status and notifications</span>
          </div>
          <div className="info-item">
            <strong>💳 Payments:</strong>
            <span>MPESA & Card payment integration</span>
          </div>
          <div className="info-item">
            <strong>🔐 Auth:</strong>
            <span>Firebase Authentication</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirebaseConnectionTest
