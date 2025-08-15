import React, { useState, useMemo, useEffect } from 'react'
import CarCard from './CarCard'
import { firebaseService } from '../services/firebaseService'
import './CarListing.css'

const FirebaseCarListing = ({ onBookCar }) => {
  const [cars, setCars] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load cars from Firebase
  useEffect(() => {
    loadCarsFromFirebase()
  }, [])

  const loadCarsFromFirebase = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await firebaseService.getCars()
      if (result.data) {
        setCars(result.data)
        
        // Generate categories from car data
        const categoryMap = new Map()
        categoryMap.set('all', { id: 'all', name: 'All Cars', count: result.data.length })
        
        result.data.forEach(car => {
          const category = car.category || 'Other'
          if (categoryMap.has(category)) {
            categoryMap.get(category).count++
          } else {
            categoryMap.set(category, { 
              id: category.toLowerCase().replace(/\s+/g, '-'), 
              name: category, 
              count: 1 
            })
          }
        })
        
        setCategories(Array.from(categoryMap.values()))
      } else {
        setError('Failed to load cars from database')
        setCars([])
      }
    } catch (error) {
      console.error('Error loading cars from Firebase:', error)
      setError('Failed to connect to database')
      setCars([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAndSortedCars = useMemo(() => {
    if (!cars.length) return []
    
    let filtered = [...cars]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(car => 
        car.category?.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      )
    }

    // Filter by availability
    if (showAvailableOnly) {
      filtered = filtered.filter(car => car.available)
    }

    // Sort cars
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0)
        case 'price-high':
          return (b.price || 0) - (a.price || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'year':
          return (b.year || 0) - (a.year || 0)
        case 'recommended':
          return ((b.rating || 0) * (b.reviews || 0)) - ((a.rating || 0) * (a.reviews || 0))
        default:
          return (a.name || '').localeCompare(b.name || '')
      }
    })

    return filtered
  }, [cars, selectedCategory, sortBy, showAvailableOnly])

  const handleBookNow = (car) => {
    if (car.available && onBookCar) {
      onBookCar(car)
    }
  }

  const availableCount = filteredAndSortedCars.filter(car => car.available).length

  if (isLoading) {
    return (
      <section id="cars" className="car-listing-section">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading cars from database...</h3>
            <p>Please wait while we fetch the latest inventory</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="cars" className="car-listing-section">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Unable to load cars</h3>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={loadCarsFromFirebase}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

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
                <option value="year">Newest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <button 
              className="refresh-btn"
              onClick={loadCarsFromFirebase}
              title="Refresh car inventory"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
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
                {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                <span className="remove-filter">×</span>
              </button>
            </div>
          )}
        </div>

        {/* Cars Grid/List */}
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
                <p>
                  {cars.length === 0 
                    ? "No cars available in the database yet." 
                    : "Try adjusting your filters to see more options."
                  }
                </p>
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

        {/* Load More (if needed) */}
        {filteredAndSortedCars.length > 0 && (
          <div className="load-more-section">
            <p className="results-footer">
              Showing all {filteredAndSortedCars.length} available cars from Firebase
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FirebaseCarListing
