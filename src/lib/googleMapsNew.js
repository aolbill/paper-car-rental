import { Loader } from '@googlemaps/js-api-loader'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Updated loader configuration for new APIs
const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry', 'marker']
})

let googleMapsPromise = null

export const loadGoogleMaps = () => {
  if (!googleMapsPromise) {
    googleMapsPromise = loader.load()
  }
  return googleMapsPromise
}

export const createMap = async (elementId, options = {}) => {
  const google = await loadGoogleMaps()
  
  const defaultOptions = {
    center: { lat: -1.2921, lng: 36.8219 }, // Nairobi, Kenya
    zoom: 10,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    ...options
  }
  
  return new google.maps.Map(document.getElementById(elementId), defaultOptions)
}

// Enhanced autocomplete with better error handling
export const createAutocomplete = async (inputElement, options = {}) => {
  const google = await loadGoogleMaps()
  
  try {
    const defaultOptions = {
      componentRestrictions: { country: 'ke' }, // Restrict to Kenya
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components'],
      types: ['establishment', 'geocode'],
      ...options
    }
    
    // Create autocomplete with enhanced configuration
    const autocomplete = new google.maps.places.Autocomplete(inputElement, defaultOptions)
    
    // Add enhanced place change listener
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry) {
        console.warn('No geometry available for the selected place')
        return
      }
      
      // Custom event to notify components
      inputElement.dispatchEvent(new CustomEvent('place_selected', {
        detail: place
      }))
    })
    
    return autocomplete
  } catch (error) {
    console.error('Error creating autocomplete:', error)
    throw new Error(`Failed to create autocomplete: ${error.message}`)
  }
}

// Improved geocoding with Places API integration
export const geocodeAddress = async (address) => {
  const google = await loadGoogleMaps()
  
  try {
    // First try with Places Text Search (recommended approach)
    const request = {
      query: address,
      locationBias: {
        center: { lat: -1.2921, lng: 36.8219 }, // Nairobi, Kenya
        radius: 50000 // 50km radius
      }
    }
    
    const service = new google.maps.places.PlacesService(document.createElement('div'))
    
    return new Promise((resolve, reject) => {
      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          const result = results[0]
          resolve({
            geometry: result.geometry,
            formatted_address: result.formatted_address,
            place_id: result.place_id,
            name: result.name,
            types: result.types
          })
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          // Fallback to Geocoding API
          fallbackToGeocoding(address, resolve, reject)
        } else {
          reject(new Error(`Places search failed: ${status}`))
        }
      })
    })
  } catch (error) {
    // Fallback to geocoding if Places API fails
    return fallbackToGeocoding(address)
  }
}

// Fallback function for geocoding
const fallbackToGeocoding = async (address, resolve = null, reject = null) => {
  const google = await loadGoogleMaps()
  const geocoder = new google.maps.Geocoder()
  
  const promise = new Promise((res, rej) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        res(results[0])
      } else {
        rej(new Error(`Geocoding failed: ${status}`))
      }
    })
  })
  
  if (resolve && reject) {
    promise.then(resolve).catch(reject)
  } else {
    return promise
  }
}

// Enhanced reverse geocoding
export const reverseGeocode = async (latLng) => {
  const google = await loadGoogleMaps()
  
  try {
    const geocoder = new google.maps.Geocoder()
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ 
        location: latLng,
        language: 'en',
        region: 'KE' // Kenya region code
      }, (results, status) => {
        if (status === 'OK' && results.length > 0) {
          // Return the most relevant result (usually the first one)
          resolve(results[0])
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`))
        }
      })
    })
  } catch (error) {
    throw new Error(`Reverse geocoding error: ${error.message}`)
  }
}

// Enhanced nearby search with Places API
export const findNearbyPlaces = async (location, options = {}) => {
  const google = await loadGoogleMaps()
  
  try {
    const defaultOptions = {
      radius: 5000, // 5km default
      type: 'establishment',
      ...options
    }
    
    const request = {
      location: location,
      radius: defaultOptions.radius,
      type: [defaultOptions.type]
    }
    
    const service = new google.maps.places.PlacesService(document.createElement('div'))
    
    return new Promise((resolve, reject) => {
      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results)
        } else {
          reject(new Error(`Nearby search failed: ${status}`))
        }
      })
    })
  } catch (error) {
    throw new Error(`Nearby search error: ${error.message}`)
  }
}

// Get detailed place information
export const getPlaceDetails = async (placeId, fields = []) => {
  const google = await loadGoogleMaps()
  
  try {
    const defaultFields = ['name', 'formatted_address', 'geometry', 'place_id', 'types', 'address_components']
    const requestFields = fields.length > 0 ? fields : defaultFields
    
    const request = {
      placeId: placeId,
      fields: requestFields
    }
    
    const service = new google.maps.places.PlacesService(document.createElement('div'))
    
    return new Promise((resolve, reject) => {
      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(place)
        } else {
          reject(new Error(`Place details failed: ${status}`))
        }
      })
    })
  } catch (error) {
    throw new Error(`Place details error: ${error.message}`)
  }
}

// Autocomplete predictions (alternative to widget)
export const getAutocompletePredictions = async (input, options = {}) => {
  const google = await loadGoogleMaps()
  
  try {
    const defaultOptions = {
      componentRestrictions: { country: 'ke' },
      types: ['establishment', 'geocode'],
      ...options
    }
    
    const service = new google.maps.places.AutocompleteService()
    
    return new Promise((resolve, reject) => {
      service.getPlacePredictions({
        input: input,
        ...defaultOptions
      }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(predictions || [])
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([])
        } else {
          reject(new Error(`Autocomplete predictions failed: ${status}`))
        }
      })
    })
  } catch (error) {
    throw new Error(`Autocomplete predictions error: ${error.message}`)
  }
}

// Helper function to check API availability
export const checkApiAvailability = async () => {
  try {
    const google = await loadGoogleMaps()
    
    const availability = {
      maps: !!google.maps,
      places: !!google.maps.places,
      geocoding: !!google.maps.Geocoder,
      apiKey: !!GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your-google-maps-api-key'
    }
    
    return {
      available: Object.values(availability).every(Boolean),
      details: availability
    }
  } catch (error) {
    return {
      available: false,
      error: error.message,
      details: {
        maps: false,
        places: false,
        geocoding: false,
        apiKey: !!GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your-google-maps-api-key'
      }
    }
  }
}

// Export legacy function names for backward compatibility
export {
  geocodeAddress as geocode,
  reverseGeocode as reverseGeocode,
  findNearbyPlaces as nearbySearch,
  getPlaceDetails as placeDetails
}
