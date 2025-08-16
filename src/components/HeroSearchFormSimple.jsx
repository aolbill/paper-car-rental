import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HeroSearchForm.css'

const HeroSearchFormSimple = () => {
  const navigate = useNavigate()
  const [searchData, setSearchData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    carType: 'all',
    vehicleModel: '',
    searchType: 'location'
  })
  const [searchMode, setSearchMode] = useState('quick')

  // Popular locations in Kenya
  const popularLocations = [
    'Jomo Kenyatta International Airport (JKIA), Nairobi',
    'Wilson Airport, Nairobi',
    'Westlands, Nairobi',
    'Karen, Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret'
  ]

  // Popular vehicle models in Kenya
  const popularModels = [
    'Toyota Vitz', 'Toyota Premio', 'Toyota Fielder', 'Toyota Allion',
    'Nissan Note', 'Nissan Tiida', 'Honda Fit', 'Subaru Impreza',
    'Mazda Demio', 'Suzuki Swift', 'Toyota Prado', 'Toyota RAV4',
    'Nissan X-Trail', 'Honda CRV', 'Subaru Forester', 'Isuzu D-Max',
    'Toyota Hilux', 'Ford Ranger', 'Mitsubishi L200'
  ]

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    })
  }

  const handleVehicleModelSelect = (model) => {
    setSearchData({
      ...searchData,
      vehicleModel: model
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    
    // Build search parameters
    const searchParams = new URLSearchParams()
    
    if (searchData.pickupLocation) searchParams.set('pickup', searchData.pickupLocation)
    if (searchData.dropoffLocation) searchParams.set('dropoff', searchData.dropoffLocation)
    if (searchData.pickupDate) searchParams.set('pickupDate', searchData.pickupDate)
    if (searchData.dropoffDate) searchParams.set('dropoffDate', searchData.dropoffDate)
    if (searchData.carType && searchData.carType !== 'all') searchParams.set('type', searchData.carType)
    if (searchData.vehicleModel) searchParams.set('model', searchData.vehicleModel)
    
    // Navigate to cars page with search params
    navigate(`/cars?${searchParams.toString()}`)
  }

  const getMinDropoffDate = () => {
    if (searchData.pickupDate) {
      const pickupDate = new Date(searchData.pickupDate)
      pickupDate.setDate(pickupDate.getDate() + 1)
      return pickupDate.toISOString().split('T')[0]
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="hero-search-form">
      <div className="search-header">
        <h2>Find Your Perfect Ride</h2>
        <p>Search by location or specific vehicle model</p>
      </div>

      <div className="search-mode-tabs">
        <button 
          className={`mode-tab ${searchMode === 'quick' ? 'active' : ''}`}
          onClick={() => setSearchMode('quick')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-2.5 11L8 21h2l1.5-3.5L13 21h2l-2.5-6.5c-.15-.38-.5-.65-.89-.65s-.74.27-.89.65L8.5 14.5zM12 8.5c-.35 0-.7.04-1.04.11L6.98 5.5H5.5l3.5 3.5c-.77.55-1.4 1.3-1.79 2.18L5.5 13H4v2h2.29c.57 2.08 2.4 3.64 4.71 3.9V21h2v-2.1c2.31-.26 4.14-1.82 4.71-3.9H20v-2h-1.5l-1.71-1.82c-.39-.88-1.02-1.63-1.79-2.18L18.5 5.5H17l-3.98 3.11c-.34-.07-.69-.11-1.02-.11z"/>
          </svg>
          Quick Search
        </button>
        <button 
          className={`mode-tab ${searchMode === 'advanced' ? 'active' : ''}`}
          onClick={() => setSearchMode('advanced')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
          </svg>
          Advanced Search
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        {searchMode === 'quick' ? (
          <div className="quick-search">
            <div className="search-type-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="searchType"
                  value="location"
                  checked={searchData.searchType === 'location'}
                  onChange={handleInputChange}
                />
                <span className="radio-text">Search by Location</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="searchType"
                  value="model"
                  checked={searchData.searchType === 'model'}
                  onChange={handleInputChange}
                />
                <span className="radio-text">Search by Vehicle Model</span>
              </label>
            </div>

            {searchData.searchType === 'location' ? (
              <div className="location-search">
                <div className="form-group">
                  <label>Where do you need a car?</label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={searchData.pickupLocation}
                    onChange={handleInputChange}
                    placeholder="Enter pickup location (e.g., JKIA, Westlands, Karen)"
                    className="location-input large"
                    list="popular-locations"
                    required
                  />
                  <datalist id="popular-locations">
                    {popularLocations.map(location => (
                      <option key={location} value={location} />
                    ))}
                  </datalist>
                </div>
              </div>
            ) : (
              <div className="model-search">
                <div className="form-group">
                  <label>What vehicle are you looking for?</label>
                  <div className="model-input-container">
                    <input
                      type="text"
                      value={searchData.vehicleModel}
                      onChange={handleInputChange}
                      name="vehicleModel"
                      placeholder="Enter vehicle model (e.g., Toyota Vitz, Honda Fit)"
                      className="model-input"
                      list="vehicle-models"
                      required
                    />
                    <datalist id="vehicle-models">
                      {popularModels.map(model => (
                        <option key={model} value={model} />
                      ))}
                    </datalist>
                  </div>
                  <div className="popular-models">
                    <span className="popular-label">Popular:</span>
                    {popularModels.slice(0, 5).map(model => (
                      <button
                        key={model}
                        type="button"
                        className="model-tag"
                        onClick={() => handleVehicleModelSelect(model)}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="dates-row">
              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={searchData.pickupDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="date-input"
                />
              </div>
              <div className="form-group">
                <label>Return Date</label>
                <input
                  type="date"
                  name="dropoffDate"
                  value={searchData.dropoffDate}
                  onChange={handleInputChange}
                  min={getMinDropoffDate()}
                  required
                  className="date-input"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="advanced-search">
            <div className="form-row">
              <div className="form-group">
                <label>Pickup Location</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={searchData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location"
                  className="location-input compact"
                  list="popular-locations"
                  required
                />
              </div>
              <div className="form-group">
                <label>Return Location</label>
                <input
                  type="text"
                  name="dropoffLocation"
                  value={searchData.dropoffLocation}
                  onChange={handleInputChange}
                  placeholder="Enter return location"
                  className="location-input compact"
                  list="popular-locations"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={searchData.pickupDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="date-input"
                />
              </div>
              <div className="form-group">
                <label>Return Date</label>
                <input
                  type="date"
                  name="dropoffDate"
                  value={searchData.dropoffDate}
                  onChange={handleInputChange}
                  min={getMinDropoffDate()}
                  required
                  className="date-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vehicle Type</label>
                <select
                  name="carType"
                  value={searchData.carType}
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="all">All Types</option>
                  <option value="economy">Economy</option>
                  <option value="compact">Compact</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="pickup">Pickup Truck</option>
                  <option value="van">Van/Minibus</option>
                </select>
              </div>
              <div className="form-group">
                <label>Specific Model (Optional)</label>
                <input
                  type="text"
                  value={searchData.vehicleModel}
                  onChange={handleInputChange}
                  name="vehicleModel"
                  placeholder="e.g., Toyota Vitz, Honda Fit"
                  className="model-input"
                  list="vehicle-models"
                />
                <datalist id="vehicle-models">
                  {popularModels.map(model => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="search-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          Search Available Cars
        </button>
      </form>

      <div className="search-tips">
        <div className="tip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>Popular locations: JKIA, Westlands, Karen, Mombasa</span>
        </div>
        <div className="tip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
          <span>Over 200 vehicles available across Kenya</span>
        </div>
      </div>
    </div>
  )
}

export default HeroSearchFormSimple
