import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { locations } from '../data/cars'
import LocationPicker from './LocationPicker'
import './HeroSection.css'

const HeroSection = () => {
  const navigate = useNavigate()
  const [searchData, setSearchData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupLocationData: null,
    dropoffLocationData: null,
    pickupDate: '',
    dropoffDate: '',
    carType: 'all'
  })

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    })
  }

  const handlePickupLocationSelect = (locationData) => {
    setSearchData({
      ...searchData,
      pickupLocation: locationData.address,
      pickupLocationData: locationData
    })
  }

  const handleDropoffLocationSelect = (locationData) => {
    setSearchData({
      ...searchData,
      dropoffLocation: locationData.address,
      dropoffLocationData: locationData
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Search Data:', searchData)
    // Navigate to cars page with search params
    const searchParams = new URLSearchParams(searchData)
    navigate(`/cars?${searchParams.toString()}`)
  }

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop" 
          alt="Nairobi skyline"
          className="hero-bg-image"
        />
      </div>
      
      <div className="hero-content">
        <div className="container">
          <div className="hero-text">
            <h1>Explore Kenya with Premium Car Rentals</h1>
            <p>From Nairobi's bustling streets to safari adventures in Maasai Mara, find the perfect vehicle for your journey across beautiful Kenya.</p>
          </div>

          <div className="search-card">
            <h3>Find Your Perfect Ride</h3>
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pickupLocation">Pickup Location</label>
                  <LocationPicker
                    onLocationSelect={handlePickupLocationSelect}
                    placeholder="Search for pickup location"
                    initialValue={searchData.pickupLocation}
                    className="compact"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dropoffLocation">Dropoff Location</label>
                  <LocationPicker
                    onLocationSelect={handleDropoffLocationSelect}
                    placeholder="Search for dropoff location"
                    initialValue={searchData.dropoffLocation}
                    className="compact"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pickupDate">Pickup Date</label>
                  <input
                    type="date"
                    id="pickupDate"
                    name="pickupDate"
                    value={searchData.pickupDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dropoffDate">Dropoff Date</label>
                  <input
                    type="date"
                    id="dropoffDate"
                    name="dropoffDate"
                    value={searchData.dropoffDate}
                    onChange={handleInputChange}
                    min={searchData.pickupDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="carType">Car Type</label>
                  <select
                    id="carType"
                    name="carType"
                    value={searchData.carType}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Types</option>
                    <option value="economy">Economy</option>
                    <option value="suv">SUV</option>
                    <option value="luxury">Luxury</option>
                    <option value="pickup">Pickup</option>
                    <option value="van">Van</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="search-btn">
                🔍 Search Available Cars
              </button>
            </form>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <h4>10,000+</h4>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h4>200+</h4>
              <p>Available Cars</p>
            </div>
            <div className="stat-item">
              <h4>15+</h4>
              <p>Pickup Locations</p>
            </div>
            <div className="stat-item">
              <h4>24/7</h4>
              <p>Customer Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
