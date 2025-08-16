import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import firebaseUserService from '../services/firebaseUserService'
import firebaseCarService from '../services/firebaseCarService'
import { auth, db } from '../lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const FirebasePermissionsDiagnostic = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [diagnostics, setDiagnostics] = useState({
    authStatus: null,
    userProfileRead: null,
    userProfileCreate: null,
    carsRead: null,
    firestoreDirectRead: null,
    firestoreDirectWrite: null
  })
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: new Date() }])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // Test 1: Authentication Status
      addResult('Authentication', 
        isAuthenticated && user ? 'success' : 'error',
        isAuthenticated && user ? `Authenticated as: ${user.email}` : 'Not authenticated'
      )

      if (!isAuthenticated || !user) {
        addResult('Overall', 'error', 'Cannot proceed with Firestore tests - user not authenticated')
        setIsRunning(false)
        return
      }

      // Test 2: Direct Firestore Read Access
      try {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        
        addResult('Direct Firestore Read', 'success', 
          userDoc.exists() ? 'User document exists and readable' : 'User document does not exist (but no permission error)'
        )
      } catch (error) {
        addResult('Direct Firestore Read', 'error', 
          `Permission denied: ${error.message}`, 
          { code: error.code, details: error }
        )
      }

      // Test 3: User Profile Service Read
      try {
        const profileResult = await firebaseUserService.getUserProfile(user.uid)
        addResult('Service getUserProfile', 
          profileResult.success ? 'success' : 'error',
          profileResult.success ? 'Profile read successfully' : `Error: ${profileResult.error}`,
          profileResult
        )
      } catch (error) {
        addResult('Service getUserProfile', 'error', `Exception: ${error.message}`, error)
      }

      // Test 4: Direct Firestore Write Access
      try {
        const testData = {
          testField: 'diagnostic_test',
          timestamp: new Date(),
          lastDiagnostic: true
        }
        
        const userDocRef = doc(db, 'users', user.uid)
        await setDoc(userDocRef, testData, { merge: true })
        
        addResult('Direct Firestore Write', 'success', 'Successfully wrote test data to user document')
      } catch (error) {
        addResult('Direct Firestore Write', 'error', 
          `Permission denied: ${error.message}`,
          { code: error.code, details: error }
        )
      }

      // Test 5: User Profile Service Create/Update
      try {
        const profileResult = await firebaseUserService.createUserProfile(user.uid, {
          email: user.email,
          name: user.displayName || 'Test User',
          diagnosticRun: true
        })
        
        addResult('Service createUserProfile', 
          profileResult.success ? 'success' : 'error',
          profileResult.success ? 'Profile creation/update successful' : `Error: ${profileResult.error}`,
          profileResult
        )
      } catch (error) {
        addResult('Service createUserProfile', 'error', `Exception: ${error.message}`, error)
      }

      // Test 6: Cars Service Read
      try {
        const carsResult = await firebaseCarService.getAvailableCars()
        addResult('Service getAvailableCars', 
          carsResult.success ? 'success' : 'error',
          carsResult.success ? `Found ${carsResult.data?.length || 0} cars` : `Error: ${carsResult.error}`,
          carsResult
        )
      } catch (error) {
        addResult('Service getAvailableCars', 'error', `Exception: ${error.message}`, error)
      }

      // Test 7: Firebase Configuration Check
      addResult('Firebase Config', 'info', 
        `Project ID: ${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}`,
        {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Not set',
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Not set',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'
        }
      )

    } catch (error) {
      addResult('Diagnostic Error', 'error', `Unexpected error: ${error.message}`, error)
    }
    
    setIsRunning(false)
  }

  // Auto-run diagnostics on component mount if user is authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && testResults.length === 0) {
      runDiagnostics()
    }
  }, [isLoading, isAuthenticated, user])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '⏳'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10B981'
      case 'error': return '#EF4444'
      case 'warning': return '#F59E0B'
      case 'info': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading Firebase Diagnostics...</h2>
        <p>Checking authentication status...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h1 style={{ margin: '0 0 1rem 0', color: '#1F2937' }}>🔍 Firebase Permissions Diagnostic</h1>
        <p style={{ margin: '0', color: '#6B7280' }}>
          This tool helps diagnose Firestore permission issues and verify Firebase configuration.
        </p>
      </div>

      {!isAuthenticated && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#FEF2F2', 
          border: '1px solid #FECACA',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#DC2626' }}>❌ Not Authenticated</h3>
          <p style={{ margin: '0', color: '#7F1D1D' }}>
            Please log in to run Firestore permission tests.
          </p>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={runDiagnostics}
          disabled={isRunning || !isAuthenticated}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isRunning ? '#9CA3AF' : '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          {isRunning ? '🔄 Running Diagnostics...' : '🚀 Run Diagnostics'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '1rem', color: '#1F2937' }}>📊 Test Results</h2>
          
          {testResults.map((result, index) => (
            <div
              key={index}
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                border: `1px solid ${getStatusColor(result.status)}20`,
                borderLeft: `4px solid ${getStatusColor(result.status)}`,
                borderRadius: '6px',
                backgroundColor: `${getStatusColor(result.status)}05`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>
                  {getStatusIcon(result.status)}
                </span>
                <h3 style={{ margin: '0', color: '#1F2937' }}>{result.test}</h3>
              </div>
              
              <p style={{ margin: '0 0 0.5rem 0', color: '#4B5563' }}>
                {result.message}
              </p>
              
              {result.details && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#6B7280' }}>
                    View Details
                  </summary>
                  <pre style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
              
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
                {result.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {testResults.some(r => r.status === 'error') && (
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem', 
          backgroundColor: '#FEF2F2', 
          border: '1px solid #FECACA',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#DC2626' }}>🔧 Troubleshooting</h3>
          <div style={{ color: '#7F1D1D' }}>
            <p><strong>If you see permission errors:</strong></p>
            <ol style={{ paddingLeft: '1.5rem' }}>
              <li>Open <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
              <li>Select your project: <strong>papercarrental</strong></li>
              <li>Go to <strong>Firestore Database</strong> → <strong>Rules</strong></li>
              <li>Replace the rules with the content from <code>firestore-simple.rules</code></li>
              <li>Click <strong>Publish</strong></li>
            </ol>
            <p style={{ marginTop: '1rem' }}>
              <strong>Current expected rules:</strong> All authenticated users should have read/write access.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FirebasePermissionsDiagnostic
