import { Loader } from '@googlemaps/js-api-loader'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

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

export const createAutocomplete = async (inputElement, options = {}) => {
  const google = await loadGoogleMaps()
  
  const defaultOptions = {
    componentRestrictions: { country: 'ke' }, // Restrict to Kenya
    fields: ['place_id', 'geometry', 'name', 'formatted_address'],
    types: ['establishment', 'geocode'],
    ...options
  }
  
  return new google.maps.places.Autocomplete(inputElement, defaultOptions)
}

export const geocodeAddress = async (address) => {
  const google = await loadGoogleMaps()
  const geocoder = new google.maps.Geocoder()
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') {
        resolve(results[0])
      } else {
        reject(new Error(`Geocoding failed: ${status}`))
      }
    })
  })
}
