import React, { useState, useRef, useEffect } from 'react'
import { getAutocompletePredictions, getPlaceDetails } from '../lib/googleMaps'
import './LocationAutocomplete.css'

const LocationAutocomplete = ({ 
  onLocationSelect, 
  placeholder = "Search for a location", 
  initialValue = "",
  className = "",
  required = false 
}) => {
  const [value, setValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  // Popular Kenya locations as fallback
  const popularLocations = [
    { description: 'Jomo Kenyatta International Airport (JKIA), Nairobi', place_id: 'jkia' },
    { description: 'Wilson Airport, Nairobi', place_id: 'wilson' },
    { description: 'Westlands, Nairobi', place_id: 'westlands' },
    { description: 'Karen, Nairobi', place_id: 'karen' },
    { description: 'Mombasa', place_id: 'mombasa' },
    { description: 'Kisumu', place_id: 'kisumu' },
    { description: 'Nakuru', place_id: 'nakuru' },
    { description: 'Eldoret', place_id: 'eldoret' }
  ]

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const searchPredictions = async (input) => {
    if (!input.trim() || input.length < 2) {
      setSuggestions(popularLocations)
      return
    }

    setIsLoading(true)
    try {
      // Check if Google Maps API is available
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!apiKey || apiKey === 'your-google-maps-api-key') {
        // Fallback to filtering popular locations
        const filtered = popularLocations.filter(location =>
          location.description.toLowerCase().includes(input.toLowerCase())
        )
        setSuggestions(filtered)
        setIsLoading(false)
        return
      }

      // Use Google Places API for predictions
      const predictions = await getAutocompletePredictions(input, {
        componentRestrictions: { country: 'ke' },
        types: ['establishment', 'geocode']
      })

      // Combine API results with popular locations
      const apiSuggestions = predictions.map(prediction => ({
        description: prediction.description,
        place_id: prediction.place_id,
        structured_formatting: prediction.structured_formatting
      }))

      const filteredPopular = popularLocations.filter(location =>
        location.description.toLowerCase().includes(input.toLowerCase())
      )

      const combined = [...filteredPopular, ...apiSuggestions]
      // Remove duplicates based on description
      const unique = combined.filter((item, index, self) =>
        index === self.findIndex(t => t.description === item.description)
      )

      setSuggestions(unique.slice(0, 8)) // Limit to 8 suggestions
    } catch (error) {
      console.error('Error fetching predictions:', error)
      // Fallback to popular locations
      const filtered = popularLocations.filter(location =>
        location.description.toLowerCase().includes(input.toLowerCase())
      )
      setSuggestions(filtered)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    setSelectedIndex(-1)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      searchPredictions(newValue)
      setShowSuggestions(true)
    }, 300)
  }

  const handleSuggestionClick = async (suggestion) => {
    setValue(suggestion.description)
    setShowSuggestions(false)
    setSuggestions([])
    setSelectedIndex(-1)

    try {
      let locationData = {
        address: suggestion.description,
        place_id: suggestion.place_id,
        coordinates: null
      }

      // If it's a real place_id from Google, get detailed info
      if (suggestion.place_id && !popularLocations.find(p => p.place_id === suggestion.place_id)) {
        const details = await getPlaceDetails(suggestion.place_id)
        if (details && details.geometry) {
          locationData = {
            address: details.formatted_address || suggestion.description,
            place_id: suggestion.place_id,
            coordinates: {
              lat: details.geometry.location.lat(),
              lng: details.geometry.location.lng()
            },
            name: details.name,
            types: details.types
          }
        }
      }

      if (onLocationSelect) {
        onLocationSelect(locationData)
      }
    } catch (error) {
      console.error('Error getting place details:', error)
      // Still call the callback with basic info
      if (onLocationSelect) {
        onLocationSelect({
          address: suggestion.description,
          place_id: suggestion.place_id,
          coordinates: null
        })
      }
    }
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleFocus = () => {
    if (suggestions.length > 0 || value.length === 0) {
      if (value.length === 0) {
        setSuggestions(popularLocations)
      }
      setShowSuggestions(true)
    }
  }

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  return (
    <div className={`location-autocomplete ${className}`}>
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="location-input"
          required={required}
          autoComplete="off"
        />
        <div className="input-icon">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="suggestions-dropdown"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id || index}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="suggestion-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div className="suggestion-content">
                <div className="suggestion-main">
                  {suggestion.structured_formatting?.main_text || 
                   suggestion.description.split(',')[0]}
                </div>
                <div className="suggestion-secondary">
                  {suggestion.structured_formatting?.secondary_text || 
                   suggestion.description.split(',').slice(1).join(',').trim()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LocationAutocomplete
