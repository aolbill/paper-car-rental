import React, { useEffect, useRef, useState } from 'react'
import { createMap, createAutocomplete } from '../lib/googleMaps'
import './LocationPicker.css'

const LocationPicker = ({ 
  onLocationSelect, 
  placeholder = "Search for a location", 
  initialValue = "",
  className = "" 
}) => {
  const mapRef = useRef(null)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const markerRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initializeMap()
  }, [])

  const initializeMap = async () => {
    try {
      setIsLoading(true)

      // Check if Google Maps API key is configured
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!apiKey || apiKey === 'your-google-maps-api-key') {
        setError('Google Maps API key not configured. Using fallback text input.')
        setIsLoading(false)
        return
      }

      // Create map
      const map = await createMap('location-map', {
        center: { lat: -1.2921, lng: 36.8219 }, // Nairobi
        zoom: 12
      })
      setMapInstance(map)

      // Create autocomplete
      const autocomplete = await createAutocomplete(inputRef.current, {
        componentRestrictions: { country: 'ke' },
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
      })
      autocompleteRef.current = autocomplete

      // Handle place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()

        if (!place.geometry || !place.geometry.location) {
          setError('No location details available for this place')
          return
        }

        // Update map
        const location = place.geometry.location
        map.setCenter(location)
        map.setZoom(15)

        // Add/update marker
        if (markerRef.current) {
          markerRef.current.setMap(null)
        }

        const google = window.google
        markerRef.current = new google.maps.Marker({
          position: location,
          map: map,
          title: place.name
        })

        // Extract location data
        const locationData = {
          name: place.name,
          address: place.formatted_address,
          lat: location.lat(),
          lng: location.lng(),
          placeId: place.place_id,
          addressComponents: place.address_components
        }

        onLocationSelect(locationData)
        setError(null)
      })

      setIsLoading(false)
    } catch (err) {
      if (err.message.includes('InvalidKeyMapError') || err.message.includes('API key')) {
        setError('Invalid Google Maps API key. Using fallback text input.')
      } else {
        setError('Failed to load Google Maps. Using fallback text input.')
      }
      setIsLoading(false)
      console.error('Google Maps initialization error:', err)
    }
  }

  const handleMapClick = async (event) => {
    if (!mapInstance) return

    const google = window.google
    const geocoder = new google.maps.Geocoder()
    const latLng = event.latLng

    try {
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK') resolve(results)
          else reject(new Error(`Geocoding failed: ${status}`))
        })
      })

      if (response[0]) {
        const place = response[0]
        
        // Update marker
        if (markerRef.current) {
          markerRef.current.setMap(null)
        }

        markerRef.current = new google.maps.Marker({
          position: latLng,
          map: mapInstance,
          title: place.formatted_address
        })

        // Update input
        inputRef.current.value = place.formatted_address

        // Extract location data
        const locationData = {
          name: place.formatted_address,
          address: place.formatted_address,
          lat: latLng.lat(),
          lng: latLng.lng(),
          placeId: place.place_id,
          addressComponents: place.address_components
        }

        onLocationSelect(locationData)
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      setError('Failed to get location details')
    }
  }

  // Add click listener to map
  useEffect(() => {
    if (mapInstance) {
      const clickListener = mapInstance.addListener('click', handleMapClick)

      return () => {
        window.google?.maps.event.removeListener(clickListener)
      }
    }
  }, [mapInstance])

  // Fallback text input handler when Google Maps is not available
  const handleTextInputChange = (e) => {
    const address = e.target.value
    if (address && !mapInstance) {
      // Simple fallback - treat text input as address
      const locationData = {
        name: address,
        address: address,
        lat: null,
        lng: null,
        placeId: null,
        addressComponents: null
      }
      onLocationSelect(locationData)
    }
  }

  const handleTextInputBlur = (e) => {
    const address = e.target.value
    if (address && !mapInstance) {
      handleTextInputChange(e)
    }
  }

  const isMapAvailable = mapInstance && !error?.includes('API key') && !error?.includes('fallback')

  return (
    <div className={`location-picker ${className}`}>
      <div className="location-search">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          defaultValue={initialValue}
          className="location-input"
          onChange={!isMapAvailable ? handleTextInputChange : undefined}
          onBlur={!isMapAvailable ? handleTextInputBlur : undefined}
        />
      </div>

      {error && (
        <div className={error.includes('API key') || error.includes('fallback') ? "location-warning" : "location-error"}>
          {error}
        </div>
      )}

      {!error?.includes('fallback') && (
        <div className="map-container">
          {isLoading && (
            <div className="map-loading">
              Loading Google Maps...
            </div>
          )}
          <div
            id="location-map"
            ref={mapRef}
            className="location-map"
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>
      )}

      <div className="location-hint">
        {isMapAvailable
          ? "💡 Type in the search box or click on the map to select a location"
          : "💡 Type your location address in the search box"
        }
      </div>
    </div>
  )
}

export default LocationPicker
