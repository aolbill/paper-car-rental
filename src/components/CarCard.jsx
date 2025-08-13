import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReviewsModal from './ReviewsModal'
import './CarCard.css'

const CarCard = ({ car, onBookNow, onViewDetails }) => {
  const navigate = useNavigate()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false)

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency === 'KSH' ? 'KES' : currency,
      minimumFractionDigits: 0
    }).format(price)
  }

  const renderStars = (rating) => {
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
      </div>
    )
  }

  const handleViewDetails = () => {
    navigate(`/cars/${car.id}`)
  }

  const handleFavoriteToggle = (e) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
  }

  const handleReviewsClick = (e) => {
    e.stopPropagation()
    setIsReviewsModalOpen(true)
  }

  const getAvailabilityStatus = () => {
    if (!car.available) return { text: 'Unavailable', className: 'unavailable' }
    return { text: 'Available now', className: 'available' }
  }

  const availability = getAvailabilityStatus()

  return (
    <div
      className={`car-card-simple ${!car.available ? 'car-unavailable' : ''}`}
      onClick={handleViewDetails}
    >
      {/* Image Section */}
      <div className="car-image-section">
        {!isImageLoaded && (
          <div className="image-skeleton">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        <img
          src={car.image}
          alt={car.name}
          className={`car-image ${isImageLoaded ? 'loaded' : ''}`}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />

        {/* Heart button only */}
        <button
          className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={handleFavoriteToggle}
          aria-label="Add to favorites"
        >
          <svg viewBox="0 0 24 24" className="heart-icon">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        {car.instantBook && (
          <div className="instant-book-badge-overlay">Instant Book</div>
        )}
      </div>

      {/* Content Section */}
      <div className="car-content-simple">
        {/* Car name and rating */}
        <div className="car-header-simple">
          <h3 className="car-name-simple">{car.name}</h3>
          <div className="rating-simple">
            <span className="rating-star">★</span>
            <span className="rating-number">{car.rating}</span>
            <span className="reviews-count-simple" onClick={handleReviewsClick}>
              ({car.reviewCount || 0})
            </span>
          </div>
        </div>

        {/* Essential features only */}
        <div className="features-simple">
          <span className="feature-simple">{car.specifications?.doors || 4} seats</span>
          <span className="feature-divider">•</span>
          <span className="feature-simple">{car.fuel}</span>
          <span className="feature-divider">•</span>
          <span className="feature-simple">{car.transmission}</span>
        </div>

        {/* Location */}
        <div className="location-simple">
          <span className="location-icon">📍</span>
          <span className="location-text">{car.pickupLocations?.[0] || 'Nairobi CBD'}</span>
        </div>

        {/* Price and book button */}
        <div className="car-footer-simple">
          <div className="price-simple">
            <span className="price-amount-simple">{formatPrice(car.price, car.currency)}</span>
            <span className="price-period-simple">/day</span>
          </div>
          <button
            className={`btn-book-simple ${!car.available ? 'btn-disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              if (car.available) onBookNow(car)
            }}
            disabled={!car.available}
          >
            {car.available ? 'Book' : 'Unavailable'}
          </button>
        </div>
      </div>

      <ReviewsModal
        car={car}
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
      />
    </div>
  )
}

export default CarCard
