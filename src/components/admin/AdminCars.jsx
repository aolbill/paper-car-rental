import React, { useState, useEffect } from 'react'
import { cars as initialCars, categories, locations } from '../../data/cars'
import ReviewsModal from '../ReviewsModal'
import './AdminCars.css'

const AdminCars = ({ onRefresh }) => {
  const [cars, setCars] = useState(initialCars)
  const [filteredCars, setFilteredCars] = useState(initialCars)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)
  const [newCar, setNewCar] = useState({
    name: '',
    category: 'Economy',
    price: '',
    currency: 'KSH',
    priceUnit: 'per day',
    image: '',
    features: [],
    fuel: 'Petrol',
    transmission: 'Automatic',
    year: new Date().getFullYear(),
    available: true,
    rating: 4.5,
    reviews: 0,
    description: '',
    pickupLocations: [],
    specifications: {
      engine: '',
      mileage: '',
      doors: 4,
      luggage: '',
      insurance: 'Comprehensive',
      minAge: 21
    }
  })

  useEffect(() => {
    filterCars()
  }, [cars, categoryFilter, statusFilter, searchTerm])

  const filterCars = () => {
    let filtered = [...cars]

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(car => car.category === categoryFilter)
    }

    // Status filter
    if (statusFilter === 'available') {
      filtered = filtered.filter(car => car.available)
    } else if (statusFilter === 'unavailable') {
      filtered = filtered.filter(car => !car.available)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(car => 
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCars(filtered)
  }

  const handleAddCar = () => {
    setNewCar({
      name: '',
      category: 'Economy',
      price: '',
      currency: 'KSH',
      priceUnit: 'per day',
      image: '',
      features: [],
      fuel: 'Petrol',
      transmission: 'Automatic',
      year: new Date().getFullYear(),
      available: true,
      rating: 4.5,
      reviews: 0,
      description: '',
      pickupLocations: [],
      specifications: {
        engine: '',
        mileage: '',
        doors: 4,
        luggage: '',
        insurance: 'Comprehensive',
        minAge: 21
      }
    })
    setShowAddModal(true)
  }

  const handleEditCar = (car) => {
    setSelectedCar(car)
    setNewCar({...car})
    setShowEditModal(true)
  }

  const handleDeleteCar = (carId) => {
    if (window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      const updatedCars = cars.filter(car => car.id !== carId)
      setCars(updatedCars)
      onRefresh()
      alert('Car deleted successfully!')
    }
  }

  const handleToggleAvailability = (carId) => {
    const updatedCars = cars.map(car =>
      car.id === carId ? { ...car, available: !car.available } : car
    )
    setCars(updatedCars)
    onRefresh()
  }

  const handleViewReviews = (car) => {
    setSelectedCar(car)
    setShowReviewsModal(true)
  }

  const handleSaveCar = () => {
    try {
      // Validation
      if (!newCar.name || !newCar.price || !newCar.description) {
        alert('Please fill in all required fields')
        return
      }

      if (showAddModal) {
        // Add new car
        const carToAdd = {
          ...newCar,
          id: Date.now(),
          price: parseInt(newCar.price),
          features: newCar.features.filter(f => f.trim() !== ''),
          pickupLocations: newCar.pickupLocations.filter(l => l.trim() !== '')
        }
        setCars([...cars, carToAdd])
        setShowAddModal(false)
        alert('Car added successfully!')
      } else {
        // Update existing car
        const updatedCars = cars.map(car => 
          car.id === selectedCar.id ? {
            ...newCar,
            id: selectedCar.id,
            price: parseInt(newCar.price),
            features: newCar.features.filter(f => f.trim() !== ''),
            pickupLocations: newCar.pickupLocations.filter(l => l.trim() !== '')
          } : car
        )
        setCars(updatedCars)
        setShowEditModal(false)
        alert('Car updated successfully!')
      }
      onRefresh()
    } catch (error) {
      alert('Error saving car: ' + error.message)
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setNewCar({
        ...newCar,
        [parent]: {
          ...newCar[parent],
          [child]: value
        }
      })
    } else {
      setNewCar({
        ...newCar,
        [field]: value
      })
    }
  }

  const handleArrayInputChange = (field, index, value) => {
    const newArray = [...newCar[field]]
    newArray[index] = value
    setNewCar({
      ...newCar,
      [field]: newArray
    })
  }

  const addArrayItem = (field) => {
    setNewCar({
      ...newCar,
      [field]: [...newCar[field], '']
    })
  }

  const removeArrayItem = (field, index) => {
    const newArray = newCar[field].filter((_, i) => i !== index)
    setNewCar({
      ...newCar,
      [field]: newArray
    })
  }

  return (
    <div className="admin-cars">
      <div className="cars-header">
        <h2>🚗 Car Fleet Management</h2>
        <div className="cars-actions">
          <button className="btn-secondary" onClick={() => filterCars()}>
            🔄 Refresh
          </button>
          <button className="btn-primary" onClick={handleAddCar}>
            ➕ Add New Car
          </button>
        </div>
      </div>

      <div className="cars-filters">
        <div className="filter-group">
          <label htmlFor="categoryFilter">Category:</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchTerm">Search:</label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cars..."
          />
        </div>
      </div>

      <div className="cars-stats">
        <div className="stat-summary">
          Showing {filteredCars.length} of {cars.length} cars
        </div>
      </div>

      <div className="cars-grid">
        {filteredCars.map(car => (
          <div key={car.id} className="admin-car-card">
            <div className="car-image">
              <img src={car.image} alt={car.name} />
              <div className={`availability-badge ${car.available ? 'available' : 'unavailable'}`}>
                {car.available ? 'Available' : 'Unavailable'}
              </div>
            </div>
            
            <div className="car-details">
              <h3>{car.name}</h3>
              <p className="car-category">{car.category}</p>
              <p className="car-price">KSH {car.price.toLocaleString()} / day</p>
              <p className="car-description">{car.description}</p>
              
              <div className="car-specs">
                <span>⭐ {car.rating} ({car.reviewCount || car.reviews} reviews)</span>
                <span>🚗 {car.year}</span>
                <span>⛽ {car.fuel}</span>
                <span>⚙️ {car.transmission}</span>
              </div>

              <div className="car-actions">
                <button
                  className="btn-small btn-info"
                  onClick={() => handleViewReviews(car)}
                >
                  📝 Reviews
                </button>
                <button
                  className="btn-small btn-secondary"
                  onClick={() => handleEditCar(car)}
                >
                  ✏️ Edit
                </button>
                <button
                  className={`btn-small ${car.available ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => handleToggleAvailability(car.id)}
                >
                  {car.available ? '🚫 Disable' : '✅ Enable'}
                </button>
                <button
                  className="btn-small btn-danger"
                  onClick={() => handleDeleteCar(car.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="no-cars">
          <h3>No cars found</h3>
          <p>No cars match your current filters.</p>
        </div>
      )}

      {/* Add/Edit Car Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
          <div className="car-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>×</button>
            
            <h3>{showAddModal ? 'Add New Car' : 'Edit Car'}</h3>
            
            <div className="car-form">
              <div className="form-section">
                <h4>Basic Information</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Car Name *</label>
                    <input
                      type="text"
                      value={newCar.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Toyota Camry"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={newCar.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Price per Day (KSH) *</label>
                    <input
                      type="number"
                      value={newCar.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g., 5000"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="number"
                      value={newCar.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Fuel Type</label>
                    <select
                      value={newCar.fuel}
                      onChange={(e) => handleInputChange('fuel', e.target.value)}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Transmission</label>
                    <select
                      value={newCar.transmission}
                      onChange={(e) => handleInputChange('transmission', e.target.value)}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Image URL *</label>
                  <input
                    type="url"
                    value={newCar.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/car-image.jpg"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={newCar.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the car..."
                    rows="3"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Features</h4>
                {newCar.features.map((feature, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayInputChange('features', index, e.target.value)}
                      placeholder="e.g., Air Conditioning"
                    />
                    <button 
                      type="button" 
                      className="btn-small btn-danger"
                      onClick={() => removeArrayItem('features', index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => addArrayItem('features')}
                >
                  Add Feature
                </button>
              </div>

              <div className="form-section">
                <h4>Pickup Locations</h4>
                {newCar.pickupLocations.map((location, index) => (
                  <div key={index} className="array-input">
                    <select
                      value={location}
                      onChange={(e) => handleArrayInputChange('pickupLocations', index, e.target.value)}
                    >
                      <option value="">Select location</option>
                      {locations.map((loc, i) => (
                        <option key={i} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      className="btn-small btn-danger"
                      onClick={() => removeArrayItem('pickupLocations', index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => addArrayItem('pickupLocations')}
                >
                  Add Location
                </button>
              </div>

              <div className="form-section">
                <h4>Specifications</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Engine</label>
                    <input
                      type="text"
                      value={newCar.specifications.engine}
                      onChange={(e) => handleInputChange('specifications.engine', e.target.value)}
                      placeholder="e.g., 2.0L 4-Cylinder"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Mileage</label>
                    <input
                      type="text"
                      value={newCar.specifications.mileage}
                      onChange={(e) => handleInputChange('specifications.mileage', e.target.value)}
                      placeholder="e.g., 15 km/l"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Doors</label>
                    <input
                      type="number"
                      value={newCar.specifications.doors}
                      onChange={(e) => handleInputChange('specifications.doors', parseInt(e.target.value))}
                      min="2"
                      max="5"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Luggage Capacity</label>
                    <input
                      type="text"
                      value={newCar.specifications.luggage}
                      onChange={(e) => handleInputChange('specifications.luggage', e.target.value)}
                      placeholder="e.g., 2 large bags"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum Age</label>
                    <input
                      type="number"
                      value={newCar.specifications.minAge}
                      onChange={(e) => handleInputChange('specifications.minAge', parseInt(e.target.value))}
                      min="18"
                      max="30"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Available</label>
                    <select
                      value={newCar.available}
                      onChange={(e) => handleInputChange('available', e.target.value === 'true')}
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSaveCar}
                >
                  {showAddModal ? 'Add Car' : 'Update Car'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      <ReviewsModal
        car={selectedCar}
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
      />
    </div>
  )
}

export default AdminCars
