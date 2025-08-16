import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CarCard from './CarCard'
import firebaseCarService from '../services/firebaseCarService'
import { useNotifications } from '../context/NotificationContext'
import './CarListing.css'

const CarListing = ({ onBookCar }) => {
  const [searchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    model: '',
    type: '',
    pickupDate: '',
    dropoffDate: ''
  })
  const { showError } = useNotifications()

  // Dynamic categories based on loaded cars
  const categories = useMemo(() => {
    const categoryCount = cars.reduce((acc, car) => {
      acc[car.category] = (acc[car.category] || 0) + 1
      return acc
    }, {})

    return [
      { id: 'all', name: 'All Cars', count: cars.length },
      ...Object.entries(categoryCount).map(([category, count]) => ({
        id: category,
        name: category,
        count
      }))
    ]
  }, [cars])

  // Load cars from Firebase
  useEffect(() => {
    loadCars()
  }, [])

  // Parse URL search parameters
  useEffect(() => {
    const filters = {
      location: searchParams.get('pickup') || '',
      model: searchParams.get('model') || '',
      type: searchParams.get('type') || '',
      pickupDate: searchParams.get('pickupDate') || '',
      dropoffDate: searchParams.get('dropoffDate') || ''
    }

    setSearchFilters(filters)

    // Set category based on URL type parameter
    if (filters.type && filters.type !== 'all') {
      setSelectedCategory(filters.type)
    }
  }, [searchParams])

  const loadCars = async () => {
    setLoading(true)
    try {
      const result = await firebaseCarService.getAvailableCars()
      if (result.success) {
        setCars(result.data)
      } else {
        showError('Error', 'Failed to load cars')
        setCars([])
      }
    } catch (error) {
      showError('Error', 'Failed to load cars')
      setCars([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedCars = useMemo(() => {
    let filtered = [...cars]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(car =>
        car.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by vehicle model (from search)
    if (searchFilters.model) {
      filtered = filtered.filter(car =>
        car.name.toLowerCase().includes(searchFilters.model.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchFilters.model.toLowerCase())
      )
    }

    // Filter by location (basic implementation - could be enhanced with actual location data)
    if (searchFilters.location) {
      // For now, assume all cars are available in major locations
      // This could be enhanced with actual location availability data
      const majorLocations = ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'jkia', 'wilson']
      const hasLocation = majorLocations.some(location =>
        searchFilters.location.toLowerCase().includes(location)
      )
      if (!hasLocation) {
        // If it's not a major location, show all cars but with a note
        // This is a simplified implementation
      }
    }

    // Filter by availability
    if (showAvailableOnly) {
      filtered = filtered.filter(car => car.available)
    }

    // Sort cars
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0)
        case 'year':
          return b.year - a.year
        case 'popular':
          return (b.totalBookings || 0) - (a.totalBookings || 0)
        case 'recommended':
          return ((b.averageRating || 0) * (b.reviewCount || 0)) - ((a.averageRating || 0) * (a.reviewCount || 0))
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [selectedCategory, sortBy, showAvailableOnly, searchFilters])

  const handleBookNow = (car) => {
    if (car.available && onBookCar) {
      onBookCar(car)
    }
  }

  const availableCount = filteredAndSortedCars.filter(car => car.available).length

  return (
    <section id="cars" className="car-listing-section">
      <div className="container">
        {/* Header */}
        <div className="listing-header">
          <div className="header-content">
            <h2>Find Your Perfect Car</h2>
            <p>Choose from our premium collection of vehicles across Kenya</p>
          </div>
          
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
              </svg>
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {(searchFilters.model || searchFilters.location || searchFilters.type) && (
          <div className="search-results-info">
            <div className="search-summary">
              <h3>Search Results</h3>
              <div className="active-filters">
                {searchFilters.model && (
                  <span className="filter-tag">
                    <strong>Model:</strong> {searchFilters.model}
                  </span>
                )}
                {searchFilters.location && (
                  <span className="filter-tag">
                    <strong>Location:</strong> {searchFilters.location}
                  </span>
                )}
                {searchFilters.type && searchFilters.type !== 'all' && (
                  <span className="filter-tag">
                    <strong>Type:</strong> {searchFilters.type}
                  </span>
                )}
                {searchFilters.pickupDate && (
                  <span className="filter-tag">
                    <strong>Pickup:</strong> {new Date(searchFilters.pickupDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="results-count">
              <span>{filteredAndSortedCars.length} vehicles found</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="listing-filters">
          {/* Category Pills */}
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
                <span className="count">{category.count}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="filter-controls">
            <div className="filter-group">
              <label className="toggle-filter">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Available only</span>
              </label>
            </div>

            <div className="sort-group">
              <label htmlFor="sortBy" className="sort-label">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="year">Newest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-summary">
          <div className="results-count">
            <span className="count-number">{filteredAndSortedCars.length}</span>
            <span className="count-text">cars found</span>
            {availableCount !== filteredAndSortedCars.length && (
              <span className="available-note">• {availableCount} available now</span>
            )}
          </div>
          
          {selectedCategory !== 'all' && (
            <div className="active-filters">
              <span className="filter-label">Category:</span>
              <button 
                className="active-filter"
                onClick={() => setSelectedCategory('all')}
              >
                {selectedCategory}
                <span className="remove-filter">×</span>
              </button>
            </div>
          )}
        </div>

        {/* Cars Grid/List */}
        {loading ? (
          <div className="cars-loading">
            <div className="loading-spinner"></div>
            <p>Loading cars...</p>
          </div>
        ) : (
          <div className={`cars-container ${viewMode}`}>
            {filteredAndSortedCars.length > 0 ? (
              filteredAndSortedCars.map(car => (
                <CarCard
                  key={car.id}
                  car={car}
                  onBookNow={handleBookNow}
                />
              ))
            ) : (
              <div className="no-results">
                <div className="no-results-content">
                  <div className="no-results-icon">🚗</div>
                  <h3>No cars found</h3>
                  <p>Try adjusting your filters to see more options.</p>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setSelectedCategory('all')
                      setShowAvailableOnly(false)
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Load More (if needed) */}
        {filteredAndSortedCars.length > 0 && (
          <div className="load-more-section">
            <p className="results-footer">
              Showing all {filteredAndSortedCars.length} available cars
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CarListing
