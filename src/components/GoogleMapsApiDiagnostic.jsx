import React, { useState, useEffect } from 'react'
import { loadGoogleMaps } from '../lib/googleMaps'

const GoogleMapsApiDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    loading: true,
    apiKey: null,
    googleMapsLoaded: false,
    placesApiAvailable: false,
    geocodingApiAvailable: false,
    errors: [],
    recommendations: []
  })

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const results = {
      loading: false,
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      googleMapsLoaded: false,
      placesApiAvailable: false,
      geocodingApiAvailable: false,
      errors: [],
      recommendations: []
    }

    // Check if API key is configured
    if (!results.apiKey || results.apiKey === 'your-google-maps-api-key') {
      results.errors.push('Google Maps API key is not configured')
      results.recommendations.push('Set VITE_GOOGLE_MAPS_API_KEY environment variable')
    }

    try {
      // Try to load Google Maps
      const google = await loadGoogleMaps()
      results.googleMapsLoaded = true

      // Check if Places API is available
      if (google.maps.places) {
        results.placesApiAvailable = true
        
        // Test Places API with a simple request
        try {
          const service = new google.maps.places.PlacesService(document.createElement('div'))
          results.placesApiWorking = true
        } catch (error) {
          results.errors.push(`Places API error: ${error.message}`)
          results.recommendations.push('Check if Places API (New) is enabled in Google Cloud Console')
        }
      } else {
        results.errors.push('Places API is not available')
        results.recommendations.push('Enable Places API in Google Cloud Console')
      }

      // Check if Geocoding API is available
      if (google.maps.Geocoder) {
        results.geocodingApiAvailable = true
        
        // Test Geocoding API with a simple request
        try {
          const geocoder = new google.maps.Geocoder()
          await new Promise((resolve, reject) => {
            geocoder.geocode({ address: 'Nairobi, Kenya' }, (results, status) => {
              if (status === 'OK') {
                resolve(results)
                results.geocodingApiWorking = true
              } else {
                reject(new Error(`Geocoding test failed: ${status}`))
              }
            })
          })
        } catch (error) {
          results.errors.push(`Geocoding API error: ${error.message}`)
          if (error.message.includes('REQUEST_DENIED')) {
            results.recommendations.push('Check API key restrictions and billing setup')
          }
        }
      } else {
        results.errors.push('Geocoding API is not available')
        results.recommendations.push('Enable Geocoding API in Google Cloud Console')
      }

    } catch (error) {
      results.errors.push(`Failed to load Google Maps: ${error.message}`)
      
      if (error.message.includes('InvalidKeyMapError')) {
        results.recommendations.push('API key is invalid - check your Google Cloud Console')
      } else if (error.message.includes('RefererNotAllowedMapError')) {
        results.recommendations.push('Current domain is not allowed - update API key restrictions')
      } else if (error.message.includes('legacy')) {
        results.recommendations.push('Enable Places API (New) instead of legacy Places API')
      } else {
        results.recommendations.push('Check Google Cloud Console for API enablement and billing')
      }
    }

    setDiagnostics(results)
  }

  if (diagnostics.loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h3>🔍 Running Google Maps API Diagnostics...</h3>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h3>🔍 Google Maps API Diagnostic Report</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>📋 Configuration Status</h4>
        <div>
          <span style={{ color: diagnostics.apiKey ? 'green' : 'red' }}>
            {diagnostics.apiKey ? '✅' : '❌'}
          </span>
          {' '}API Key: {diagnostics.apiKey ? 'Configured' : 'Not configured'}
        </div>
        <div>
          <span style={{ color: diagnostics.googleMapsLoaded ? 'green' : 'red' }}>
            {diagnostics.googleMapsLoaded ? '✅' : '❌'}
          </span>
          {' '}Google Maps Loading: {diagnostics.googleMapsLoaded ? 'Success' : 'Failed'}
        </div>
        <div>
          <span style={{ color: diagnostics.placesApiAvailable ? 'green' : 'red' }}>
            {diagnostics.placesApiAvailable ? '✅' : '❌'}
          </span>
          {' '}Places API: {diagnostics.placesApiAvailable ? 'Available' : 'Not available'}
        </div>
        <div>
          <span style={{ color: diagnostics.geocodingApiAvailable ? 'green' : 'red' }}>
            {diagnostics.geocodingApiAvailable ? '✅' : '❌'}
          </span>
          {' '}Geocoding API: {diagnostics.geocodingApiAvailable ? 'Available' : 'Not available'}
        </div>
      </div>

      {diagnostics.errors.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>❌ Errors Found</h4>
          <ul style={{ color: 'red' }}>
            {diagnostics.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {diagnostics.recommendations.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>💡 Recommendations</h4>
          <ul style={{ color: 'orange' }}>
            {diagnostics.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h4>🔗 Helpful Links</h4>
        <ul>
          <li>
            <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer">
              Google Cloud Console - API Library
            </a>
          </li>
          <li>
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
              Google Cloud Console - Credentials
            </a>
          </li>
          <li>
            <a href="https://developers.google.com/maps/documentation/places/web-service/overview" target="_blank" rel="noopener noreferrer">
              Places API (New) Documentation
            </a>
          </li>
          <li>
            <a href="https://developers.google.com/maps/legacy" target="_blank" rel="noopener noreferrer">
              Legacy API Migration Guide
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4>📋 Required APIs to Enable</h4>
        <ol>
          <li><strong>Maps JavaScript API</strong> - For map display</li>
          <li><strong>Places API (New)</strong> - For location search and autocomplete</li>
          <li><strong>Geocoding API</strong> - For address conversion (fallback)</li>
        </ol>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          ⚠️ Important: Make sure to enable <strong>Places API (New)</strong>, not the legacy Places API.
        </p>
      </div>

      <button 
        onClick={runDiagnostics}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        🔄 Run Diagnostics Again
      </button>
    </div>
  )
}

export default GoogleMapsApiDiagnostic
