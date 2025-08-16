import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import firebaseUserService from '../services/firebaseUserService'
import './FirebaseUserTest.css'

const FirebaseUserTest = () => {
  const { user, userProfile } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [testData, setTestData] = useState({
    name: 'Test User Updated',
    phone: '+254712345678',
    address: {
      street: '123 Test Street',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100'
    },
    preferences: {
      notifications: false,
      newsletter: true,
      smsUpdates: false,
      language: 'sw'
    }
  })

  const addTestResult = (test, success, message, data = null) => {
    const result = {
      id: Date.now(),
      test,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }
    setTestResults(prev => [...prev, result])
    return result
  }

  const clearResults = () => {
    setTestResults([])
  }

  const runAllTests = async () => {
    if (!user) {
      addTestResult('Authentication', false, 'User must be logged in to run tests')
      return
    }

    setIsRunning(true)
    clearResults()

    try {
      // Test 1: Get User Profile
      addTestResult('Test Start', true, 'Starting Firebase User CRUD tests...')
      
      const getUserResult = await firebaseUserService.getUserProfile(user.uid)
      addTestResult(
        'Get User Profile', 
        getUserResult.success, 
        getUserResult.success ? 'User profile retrieved successfully' : getUserResult.error,
        getUserResult.data
      )

      // Test 2: Update User Profile
      const updateResult = await firebaseUserService.updateUserProfile(user.uid, {
        name: testData.name,
        phone: testData.phone,
        address: testData.address,
        testField: 'Firebase CRUD Test - ' + new Date().toISOString()
      })
      addTestResult(
        'Update User Profile',
        updateResult.success,
        updateResult.success ? 'User profile updated successfully' : updateResult.error,
        updateResult.data
      )

      // Test 3: Update User Preferences
      const preferencesResult = await firebaseUserService.updateUserPreferences(user.uid, testData.preferences)
      addTestResult(
        'Update User Preferences',
        preferencesResult.success,
        preferencesResult.success ? 'User preferences updated successfully' : preferencesResult.error
      )

      // Test 4: Add to Favorites
      const favoriteVehicleId = 'test-vehicle-' + Date.now()
      const addFavoriteResult = await firebaseUserService.addToFavorites(user.uid, favoriteVehicleId)
      addTestResult(
        'Add to Favorites',
        addFavoriteResult.success,
        addFavoriteResult.success ? `Vehicle ${favoriteVehicleId} added to favorites` : addFavoriteResult.error
      )

      // Test 5: Remove from Favorites
      const removeFavoriteResult = await firebaseUserService.removeFromFavorites(user.uid, favoriteVehicleId)
      addTestResult(
        'Remove from Favorites',
        removeFavoriteResult.success,
        removeFavoriteResult.success ? `Vehicle ${favoriteVehicleId} removed from favorites` : removeFavoriteResult.error
      )

      // Test 6: Add Payment Method
      const paymentMethod = {
        type: 'card',
        lastFour: '1234',
        expiryMonth: '12',
        expiryYear: '2025',
        cardholderName: 'Test User'
      }
      const addPaymentResult = await firebaseUserService.addPaymentMethod(user.uid, paymentMethod)
      addTestResult(
        'Add Payment Method',
        addPaymentResult.success,
        addPaymentResult.success ? 'Payment method added successfully' : addPaymentResult.error,
        addPaymentResult.data
      )

      // Test 7: Remove Payment Method (if previous test succeeded)
      if (addPaymentResult.success && addPaymentResult.data) {
        const removePaymentResult = await firebaseUserService.removePaymentMethod(user.uid, addPaymentResult.data.id)
        addTestResult(
          'Remove Payment Method',
          removePaymentResult.success,
          removePaymentResult.success ? 'Payment method removed successfully' : removePaymentResult.error
        )
      }

      // Test 8: Update Verification Document
      const documentResult = await firebaseUserService.updateVerificationDocument(user.uid, 'nationalId', {
        url: 'https://example.com/test-document.jpg',
        fileName: 'test-national-id.jpg'
      })
      addTestResult(
        'Update Verification Document',
        documentResult.success,
        documentResult.success ? 'Verification document updated successfully' : documentResult.error
      )

      // Test 9: Log User Activity
      const activityResult = await firebaseUserService.logUserActivity(user.uid, 'firebase_crud_test', {
        testType: 'automated',
        userAgent: navigator.userAgent,
        testCount: testResults.length
      })
      addTestResult(
        'Log User Activity',
        activityResult.success,
        activityResult.success ? 'User activity logged successfully' : activityResult.error
      )

      // Test 10: Get User Activity Logs
      const logsResult = await firebaseUserService.getUserActivityLogs(user.uid, 5)
      addTestResult(
        'Get Activity Logs',
        logsResult.success,
        logsResult.success ? `Retrieved ${logsResult.data?.length || 0} activity logs` : logsResult.error,
        logsResult.data
      )

      // Test 11: Update Last Login
      const lastLoginResult = await firebaseUserService.updateLastLogin(user.uid)
      addTestResult(
        'Update Last Login',
        lastLoginResult.success,
        lastLoginResult.success ? 'Last login timestamp updated' : lastLoginResult.error
      )

      // Final verification - get updated profile
      const finalProfileResult = await firebaseUserService.getUserProfile(user.uid)
      addTestResult(
        'Final Profile Verification',
        finalProfileResult.success,
        finalProfileResult.success ? 'Final profile state retrieved successfully' : finalProfileResult.error,
        finalProfileResult.data
      )

      addTestResult('Test Complete', true, `All Firebase CRUD tests completed. Check individual results above.`)

    } catch (error) {
      addTestResult('Test Error', false, `Unexpected error during testing: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const runIndividualTest = async (testType) => {
    if (!user) {
      addTestResult(testType, false, 'User must be logged in to run tests')
      return
    }

    setIsRunning(true)

    try {
      switch (testType) {
        case 'get-profile':
          const result = await firebaseUserService.getUserProfile(user.uid)
          addTestResult('Get Profile', result.success, result.success ? 'Profile retrieved' : result.error, result.data)
          break

        case 'update-profile':
          const updateResult = await firebaseUserService.updateUserProfile(user.uid, {
            testUpdate: new Date().toISOString()
          })
          addTestResult('Update Profile', updateResult.success, updateResult.success ? 'Profile updated' : updateResult.error)
          break

        case 'log-activity':
          const logResult = await firebaseUserService.logUserActivity(user.uid, 'manual_test', {
            testType: 'individual',
            timestamp: new Date().toISOString()
          })
          addTestResult('Log Activity', logResult.success, logResult.success ? 'Activity logged' : logResult.error)
          break

        default:
          addTestResult('Unknown Test', false, 'Unknown test type')
      }
    } catch (error) {
      addTestResult(testType, false, error.message)
    } finally {
      setIsRunning(false)
    }
  }

  if (!user) {
    return (
      <div className="firebase-test">
        <div className="test-header">
          <h2>Firebase User CRUD Test</h2>
          <p className="error">Please log in to run Firebase user data tests.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="firebase-test">
      <div className="test-header">
        <h2>Firebase User CRUD Test</h2>
        <p>Test Firebase user data create, read, update, and delete operations</p>
        <div className="user-info">
          <strong>Current User:</strong> {userProfile?.name || user.email} ({user.uid})
        </div>
      </div>

      <div className="test-controls">
        <button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="run-all-button"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <div className="individual-tests">
          <button 
            onClick={() => runIndividualTest('get-profile')} 
            disabled={isRunning}
            className="test-button"
          >
            Test Get Profile
          </button>
          <button 
            onClick={() => runIndividualTest('update-profile')} 
            disabled={isRunning}
            className="test-button"
          >
            Test Update Profile
          </button>
          <button 
            onClick={() => runIndividualTest('log-activity')} 
            disabled={isRunning}
            className="test-button"
          >
            Test Log Activity
          </button>
        </div>

        <button onClick={clearResults} className="clear-button">
          Clear Results
        </button>
      </div>

      <div className="test-data-preview">
        <h3>Test Data</h3>
        <pre>{JSON.stringify(testData, null, 2)}</pre>
      </div>

      <div className="test-results">
        <h3>Test Results ({testResults.length})</h3>
        {testResults.length === 0 ? (
          <p className="no-results">No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div className="results-list">
            {testResults.map((result) => (
              <div key={result.id} className={`result-item ${result.success ? 'success' : 'error'}`}>
                <div className="result-header">
                  <span className="test-name">{result.test}</span>
                  <span className={`status ${result.success ? 'success' : 'error'}`}>
                    {result.success ? '✅ PASS' : '❌ FAIL'}
                  </span>
                  <span className="timestamp">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="result-message">{result.message}</div>
                {result.data && (
                  <details className="result-data">
                    <summary>View Data</summary>
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="test-summary">
        <h3>Summary</h3>
        {testResults.length > 0 && (
          <div className="summary-stats">
            <div className="stat">
              <span className="label">Total Tests:</span>
              <span className="value">{testResults.length}</span>
            </div>
            <div className="stat">
              <span className="label">Passed:</span>
              <span className="value success">{testResults.filter(r => r.success).length}</span>
            </div>
            <div className="stat">
              <span className="label">Failed:</span>
              <span className="value error">{testResults.filter(r => !r.success).length}</span>
            </div>
            <div className="stat">
              <span className="label">Success Rate:</span>
              <span className="value">
                {((testResults.filter(r => r.success).length / testResults.length) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FirebaseUserTest
