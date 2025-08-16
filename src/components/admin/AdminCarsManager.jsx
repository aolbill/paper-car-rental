import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/FirebaseAuthContext'
import { useNotifications } from '../../context/NotificationContext'
import firebaseCarService from '../../services/firebaseCarService'
import './AdminCarsManager.css'

const AdminCarsManager = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useNotifications()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [stats, setStats] = useState({})

  const [carForm, setCarForm] = useState({
    name: '',
    model: '',
    category: 'Economy',
    price: '',
    currency: 'KSH',
    year: new Date().getFullYear(),
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    features: [],
    description: '',
    image: '',
    images: [],
    location: 'Nairobi',
    available: true,
    insurance: true,
    gps: true,
    childSeat: false,
    bluetooth: true,
    airConditioning: true,
    mileage: '',
    engineSize: '',
    color: '',
    plateNumber: '',
    vinNumber: ''
  })

  const categories = ['Economy', 'Compact', 'Sedan', 'SUV', 'Luxury', 'Pickup', 'Van']
  const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos']
  const commonFeatures = [
    'Air Conditioning', 'Bluetooth', 'GPS Navigation', 'Child Seat Available',
    'Automatic Transmission', 'Manual Transmission', 'Power Steering',
    'Central Locking', 'Electric Windows', 'Airbags', 'ABS Brakes',
    'Reverse Camera', 'Parking Sensors', 'Cruise Control', 'Sunroof'
  ]

  useEffect(() => {
    loadCars()
    loadStats()
  }, [])

  const loadCars = async () => {
    setLoading(true)
    try {
      const result = await firebaseCarService.getAllCars()
      if (result.success) {
        setCars(result.data)
      } else {
        showError('Error', 'Failed to load cars')
      }
    } catch (error) {
      showError('Error', 'Failed to load cars')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await firebaseCarService.getCarStatistics()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to load car stats:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCarForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFeatureToggle = (feature) => {
    setCarForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleImageAdd = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      setCarForm(prev => ({
        ...prev,
        images: [...prev.images, url],
        image: prev.image || url // Set as main image if none set
      }))
    }
  }

  const handleImageRemove = (index) => {
    setCarForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const carData = {
        ...carForm,
        price: parseFloat(carForm.price),
        year: parseInt(carForm.year),
        seats: parseInt(carForm.seats),
        addedBy: user.uid,
        addedByName: user.email
      }

      let result
      if (editingCar) {
        result = await firebaseCarService.updateCar(editingCar.id, carData)
        if (result.success) {
          showSuccess('Success', 'Car updated successfully')
        }
      } else {
        result = await firebaseCarService.addCar(carData)
        if (result.success) {
          showSuccess('Success', 'Car added successfully')
        }
      }

      if (result.success) {
        resetForm()
        loadCars()
        loadStats()
      } else {
        showError('Error', result.error)
      }
    } catch (error) {
      showError('Error', 'Failed to save car')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (car) => {
    setEditingCar(car)
    setCarForm({
      ...car,
      features: car.features || [],
      images: car.images || []
    })
    setShowAddForm(true)
  }

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        const result = await firebaseCarService.deleteCar(carId)
        if (result.success) {
          showSuccess('Success', 'Car deleted successfully')
          loadCars()
          loadStats()
        } else {
          showError('Error', result.error)
        }
      } catch (error) {
        showError('Error', 'Failed to delete car')
      }
    }
  }

  const handleAvailabilityToggle = async (carId, available) => {
    try {
      const result = await firebaseCarService.updateCarAvailability(carId, !available)
      if (result.success) {
        showSuccess('Success', `Car ${!available ? 'enabled' : 'disabled'} successfully`)
        loadCars()
      } else {
        showError('Error', result.error)
      }
    } catch (error) {
      showError('Error', 'Failed to update car availability')
    }
  }

  const resetForm = () => {
    setCarForm({
      name: '',
      model: '',
      category: 'Economy',
      price: '',
      currency: 'KSH',
      year: new Date().getFullYear(),
      transmission: 'Automatic',
      fuel: 'Petrol',
      seats: 5,
      features: [],
      description: '',
      image: '',
      images: [],
      location: 'Nairobi',
      available: true,
      insurance: true,
      gps: true,
      childSeat: false,
      bluetooth: true,
      airConditioning: true,
      mileage: '',
      engineSize: '',
      color: '',
      plateNumber: '',
      vinNumber: ''
    })
    setEditingCar(null)
    setShowAddForm(false)
  }

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || car.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading && cars.length === 0) {
    return <div className="admin-loading">Loading cars...</div>
  }

  return (
    <div className="admin-cars-manager">
      {/* Stats Overview */}
      <div className="cars-stats">
        <div className="stat-card">
          <h3>{stats.totalCars || 0}</h3>
          <p>Total Cars</p>
        </div>
        <div className="stat-card">
          <h3>{stats.availableCars || 0}</h3>
          <p>Available</p>
        </div>
        <div className="stat-card">
          <h3>KES {(stats.totalRevenue || 0).toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>
        <div className="stat-card">
          <h3>{(stats.averageRating || 0).toFixed(1)}</h3>
          <p>Avg Rating</p>
        </div>
      </div>

      {/* Controls */}
      <div className="cars-controls">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="add-car-button"
        >
          + Add New Car
        </button>
      </div>

      {/* Car Form Modal */}
      {showAddForm && (
        <div className="car-form-modal">
          <div className="car-form-content">
            <div className="form-header">
              <h3>{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
              <button onClick={resetForm} className="close-button">×</button>
            </div>

            <form onSubmit={handleSubmit} className="car-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Car Name</label>
                  <input
                    type="text"
                    name="name"
                    value={carForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={carForm.model}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={carForm.category} onChange={handleInputChange}>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price per Day (KSH)</label>
                  <input
                    type="number"
                    name="price"
                    value={carForm.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    name="year"
                    value={carForm.year}
                    onChange={handleInputChange}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="form-group">
                  <label>Seats</label>
                  <select name="seats" value={carForm.seats} onChange={handleInputChange}>
                    {[2, 4, 5, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num} seats</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Transmission</label>
                  <select name="transmission" value={carForm.transmission} onChange={handleInputChange}>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select name="fuel" value={carForm.fuel} onChange={handleInputChange}>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <select name="location" value={carForm.location} onChange={handleInputChange}>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={carForm.color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={carForm.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Main Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={carForm.image}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Additional Images</label>
                <div className="images-section">
                  {carForm.images.map((url, index) => (
                    <div key={index} className="image-item">
                      <img src={url} alt={`Car ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleImageAdd}
                    className="add-image-button"
                  >
                    + Add Image
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Features</label>
                <div className="features-grid">
                  {commonFeatures.map(feature => (
                    <label key={feature} className="feature-checkbox">
                      <input
                        type="checkbox"
                        checked={carForm.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="save-button">
                  {loading ? 'Saving...' : editingCar ? 'Update Car' : 'Add Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cars List */}
      <div className="cars-list">
        <h3>Cars ({filteredCars.length})</h3>
        {filteredCars.length === 0 ? (
          <div className="no-cars">No cars found</div>
        ) : (
          <div className="cars-grid">
            {filteredCars.map(car => (
              <div key={car.id} className="car-card">
                <div className="car-image">
                  <img src={car.image || '/placeholder-car.jpg'} alt={car.name} />
                  <div className={`availability-badge ${car.available ? 'available' : 'unavailable'}`}>
                    {car.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>
                
                <div className="car-info">
                  <h4>{car.name}</h4>
                  <p className="car-category">{car.category}</p>
                  <p className="car-price">KES {car.price.toLocaleString()}/day</p>
                  
                  <div className="car-stats">
                    <span>⭐ {(car.averageRating || 0).toFixed(1)}</span>
                    <span>📋 {car.totalBookings || 0} bookings</span>
                    <span>📅 {car.year}</span>
                  </div>
                  
                  <div className="car-actions">
                    <button
                      onClick={() => handleEdit(car)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleAvailabilityToggle(car.id, car.available)}
                      className={`toggle-button ${car.available ? 'disable' : 'enable'}`}
                    >
                      {car.available ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCarsManager
