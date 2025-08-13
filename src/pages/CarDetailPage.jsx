import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { cars, touristDestinations } from '../data/cars'
import AddReviewModal from '../components/AddReviewModal'
import './CarDetailPage.css'

const CarDetailPage = ({ onBookCar }) => {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isImageLoaded, setIsImageLoaded] = useState({})
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false)
  const [carData, setCarData] = useState(null)

  useEffect(() => {
    const foundCar = cars.find(c => c.id === parseInt(id))
    setCar(foundCar)
    setCarData(foundCar)
  }, [id])

  const handleSubmitReview = (carId, newReview) => {
    // Update the car with the new review
    const updatedCar = {
      ...carData,
      reviews: [...(carData.reviews || []), newReview],
      reviewCount: (carData.reviewCount || 0) + 1,
      rating: calculateNewRating([...(carData.reviews || []), newReview])
    }
    setCarData(updatedCar)
    setCar(updatedCar)
  }

  const calculateNewRating = (reviews) => {
    if (reviews.length === 0) return 0
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    return Math.round((totalRating / reviews.length) * 10) / 10
  }

  if (!car) {
    return (
      <div className="car-detail-page">
        <div className="container">
          <div className="not-found">
            <div className="not-found-content">
              <h2>Car not found</h2>
              <p>The vehicle you're looking for doesn't exist or may have been removed.</p>
              <Link to="/cars" className="btn btn-primary">Browse All Cars</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency === 'KSH' ? 'KES' : currency,
      minimumFractionDigits: 0
    }).format(price)
  }

  const renderStars = (rating) => {
    if (!rating) rating = 0
    return (
      <div className="rating-display">
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= Math.floor(rating) ? 'filled' : star <= rating ? 'half' : 'empty'}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="rating-value">{rating}</span>
        <span className="rating-count">({car.reviewCount || 0} reviews)</span>
      </div>
    )
  }

  // Enhanced image gallery with multiple views
  const carImages = car?.image ? [
    car.image,
    car.image.replace('w=500', 'w=500&sat=-20'),
    car.image.replace('w=500', 'w=500&brightness=10'),
    car.image.replace('w=500', 'w=500&contrast=10'),
    car.image.replace('h=300', 'h=300&blur=1'),
  ] : []

  const recommendedDestinations = car?.name ? touristDestinations.filter(dest =>
    dest.recommendedCars && dest.recommendedCars.includes(car.name)
  ) : []

  const handleImageLoad = (index) => {
    setIsImageLoaded(prev => ({ ...prev, [index]: true }))
  }

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: `Reviews (${carData?.reviewCount || car?.reviewCount || 0})` },
    { id: 'features', label: 'Features' },
    { id: 'location', label: 'Location' },
    { id: 'policies', label: 'Policies' }
  ]

  return (
    <div className="car-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">›</span>
            <Link to="/cars">Cars</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{car.name}</span>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* Main Content */}
        <div className="car-detail-content">
          {/* Left Column - Images */}
          <div className="car-gallery-section">
            <div className="main-gallery">
              <div className="main-image-container">
                {!isImageLoaded[selectedImage] && (
                  <div className="image-skeleton">
                    <div className="skeleton-shimmer"></div>
                  </div>
                )}
                <img
                  src={carImages[selectedImage] || car?.image || ''}
                  alt={`${car?.name || 'Car'} - View ${selectedImage + 1}`}
                  className={`main-image ${isImageLoaded[selectedImage] ? 'loaded' : ''}`}
                  onLoad={() => handleImageLoad(selectedImage)}
                />
                
                {/* Image Overlays */}
                <button 
                  className={`favorite-btn-detail ${isFavorited ? 'favorited' : ''}`}
                  onClick={handleFavoriteToggle}
                  aria-label="Add to favorites"
                >
                  <svg viewBox="0 0 24 24" className="heart-icon">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>

                <div className="image-counter">
                  {selectedImage + 1} / {carImages.length}
                </div>

                {!car.available && (
                  <div className="unavailable-overlay">
                    <span>Currently Unavailable</span>
                  </div>
                )}
              </div>

              <div className="image-thumbnails">
                {carImages.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${car.name} thumbnail ${index + 1}`}
                      onLoad={() => handleImageLoad(index)}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Car Info */}
          <div className="car-info-section">
            <div className="car-info-header">
              <div className="car-title-area">
                <div className="category-badge">{car?.category || 'Unknown'}</div>
                <h1 className="car-title">{car?.name || 'Car Details'}</h1>
                <div className="car-subtitle">{car?.year || 'N/A'} • {car?.fuel || 'N/A'} • {car?.transmission || 'N/A'}</div>
              </div>

              {renderStars(car?.rating || 0)}
            </div>

            <div className="car-description">
              <p>{car?.description || 'No description available.'}</p>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats-detail">
              <div className="stat-item">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-label">Seats</div>
                  <div className="stat-value">{car.specifications?.doors || 4}</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🧳</div>
                <div className="stat-content">
                  <div className="stat-label">Luggage</div>
                  <div className="stat-value">{car.specifications?.luggage || '2 bags'}</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">⛽</div>
                <div className="stat-content">
                  <div className="stat-label">Fuel Type</div>
                  <div className="stat-value">{car.fuel}</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-label">Mileage</div>
                  <div className="stat-value">{car.specifications?.mileage || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="features-preview-detail">
              <h3>Key Features</h3>
              <div className="features-grid">
                {(car.features || []).slice(0, 6).map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Booking Bar */}
        <div className="booking-bar">
          <div className="booking-bar-content">
            <div className="pricing-info">
              <div className="price-display">
                <span className="price-amount">{formatPrice(car.price, car.currency)}</span>
                <span className="price-period">per day</span>
              </div>
              <div className="price-note">All fees included</div>
            </div>
            
            <div className="booking-actions">
              <button 
                className={`btn-book-detail ${!car.available ? 'btn-disabled' : ''}`}
                onClick={() => car.available && onBookCar(car)}
                disabled={!car.available}
              >
                {car.available ? 'Book now' : 'Unavailable'}
              </button>
              <button className="btn-contact">Contact host</button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="detail-tabs">
          <div className="tab-navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="tab-panel">
                <div className="specifications-detailed">
                  <h3>Vehicle Specifications</h3>
                  <div className="specs-grid-detailed">
                    <div className="spec-group">
                      <h4>Engine & Performance</h4>
                      <div className="spec-list">
                        <div className="spec-item-detailed">
                          <span className="spec-label">Engine</span>
                          <span className="spec-value">{car.specifications?.engine || 'N/A'}</span>
                        </div>
                        <div className="spec-item-detailed">
                          <span className="spec-label">Fuel Economy</span>
                          <span className="spec-value">{car.specifications?.mileage || 'N/A'}</span>
                        </div>
                        <div className="spec-item-detailed">
                          <span className="spec-label">Transmission</span>
                          <span className="spec-value">{car.transmission}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="spec-group">
                      <h4>Capacity & Dimensions</h4>
                      <div className="spec-list">
                        <div className="spec-item-detailed">
                          <span className="spec-label">Doors</span>
                          <span className="spec-value">{car.specifications?.doors || 4}</span>
                        </div>
                        <div className="spec-item-detailed">
                          <span className="spec-label">Luggage Space</span>
                          <span className="spec-value">{car.specifications?.luggage || 'N/A'}</span>
                        </div>
                        <div className="spec-item-detailed">
                          <span className="spec-label">Year</span>
                          <span className="spec-value">{car.year}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {recommendedDestinations.length > 0 && (
                  <div className="destinations-section">
                    <h3>Perfect for These Destinations</h3>
                    <div className="destinations-grid">
                      {recommendedDestinations.map((dest, index) => (
                        <div key={index} className="destination-card">
                          <h4>{dest.name}</h4>
                          <p>{dest.region} • {dest.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-panel">
                <div className="reviews-section">
                  <div className="reviews-header">
                    <div className="reviews-summary-detailed">
                      <div className="rating-overview">
                        <div className="overall-rating-large">
                          <span className="rating-number">{carData?.rating || car.rating}</span>
                          <div className="rating-stars-large">
                            {renderStars(carData?.rating || car.rating)}
                          </div>
                          <span className="total-reviews-text">Based on {carData?.reviewCount || car.reviewCount} reviews</span>
                        </div>

                        {carData?.ratingBreakdown && (
                          <div className="rating-breakdown-detailed">
                            {Object.entries(carData.ratingBreakdown)
                              .sort(([a], [b]) => b - a)
                              .map(([stars, count]) => (
                              <div key={stars} className="breakdown-row-detailed">
                                <span className="star-label">{stars}★</span>
                                <div className="breakdown-bar-detailed">
                                  <div
                                    className="breakdown-fill-detailed"
                                    style={{
                                      width: `${(count / (carData?.reviewCount || car.reviewCount)) * 100}%`
                                    }}
                                  ></div>
                                </div>
                                <span className="count-detailed">{count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="add-review-section">
                      <button
                        className="btn-add-review"
                        onClick={() => setIsAddReviewModalOpen(true)}
                      >
                        Write a Review
                      </button>
                    </div>
                  </div>

                  <div className="reviews-list-detailed">
                    {(carData?.reviews || car.reviews || []).length === 0 ? (
                      <div className="no-reviews-yet">
                        <h3>No reviews yet</h3>
                        <p>Be the first to share your experience with this car!</p>
                      </div>
                    ) : (
                      (carData?.reviews || car.reviews || [])
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((review) => (
                        <div key={review.id} className="review-item-detailed">
                          <div className="review-header-detailed">
                            <div className="reviewer-info-detailed">
                              <img
                                src={review.userAvatar}
                                alt={review.userName}
                                className="reviewer-avatar-detailed"
                              />
                              <div className="reviewer-details-detailed">
                                <h4 className="reviewer-name-detailed">{review.userName}</h4>
                                <span className="review-date-detailed">
                                  {new Date(review.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                                {review.verified && (
                                  <span className="verified-badge-detailed">Verified</span>
                                )}
                              </div>
                            </div>

                            <div className="review-rating-detailed">
                              {renderStars(review.rating)}
                            </div>
                          </div>

                          <div className="review-content-detailed">
                            {review.title && (
                              <h5 className="review-title-detailed">{review.title}</h5>
                            )}
                            <p className="review-comment-detailed">{review.comment}</p>

                            <div className="review-meta-detailed">
                              <span className="trip-duration-detailed">Trip: {review.tripDuration}</span>
                              <button className="helpful-button-detailed">
                                👍 Helpful ({review.helpful})
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="tab-panel">
                <div className="features-detailed">
                  <h3>Features & Amenities</h3>
                  <div className="features-grid-detailed">
                    {(car.features || []).map((feature, index) => (
                      <div key={index} className="feature-item-detailed">
                        <span className="feature-icon">✓</span>
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="tab-panel">
                <div className="locations-detailed">
                  <h3>Pickup Locations</h3>
                  <div className="locations-grid-detailed">
                    {(car.pickupLocations || []).map((location, index) => (
                      <div key={index} className="location-card">
                        <div className="location-icon">📍</div>
                        <div className="location-details">
                          <div className="location-name">{location}</div>
                          <div className="location-type">Pickup & Return Available</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="tab-panel">
                <div className="policies-detailed">
                  <div className="policy-section">
                    <h3>Rental Requirements</h3>
                    <div className="policy-grid">
                      <div className="policy-item">
                        <div className="policy-icon">🆔</div>
                        <div className="policy-content">
                          <h4>Valid License Required</h4>
                          <p>Kenyan or International driving license required. Minimum age: {car.specifications?.minAge || 21} years.</p>
                        </div>
                      </div>
                      <div className="policy-item">
                        <div className="policy-icon">💳</div>
                        <div className="policy-content">
                          <h4>Security Deposit</h4>
                          <p>KSH 20,000 - 50,000 security deposit required. Refunded within 7 business days.</p>
                        </div>
                      </div>
                      <div className="policy-item">
                        <div className="policy-icon">⛽</div>
                        <div className="policy-content">
                          <h4>Fuel Policy</h4>
                          <p>Full-to-full policy. Vehicle provided with full tank, return with full tank.</p>
                        </div>
                      </div>
                      <div className="policy-item">
                        <div className="policy-icon">🛡️</div>
                        <div className="policy-content">
                          <h4>Insurance Coverage</h4>
                          <p>{car.specifications?.insurance || 'Comprehensive'} insurance included with third-party liability.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddReviewModal
        car={carData || car}
        isOpen={isAddReviewModalOpen}
        onClose={() => setIsAddReviewModalOpen(false)}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  )
}

export default CarDetailPage
