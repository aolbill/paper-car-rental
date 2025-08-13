import React, { useState } from 'react'
import './ReviewsModal.css'

const ReviewsModal = ({ car, isOpen, onClose }) => {
  const [sortBy, setSortBy] = useState('newest')
  const [filterBy, setFilterBy] = useState('all')

  if (!isOpen || !car) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const getRatingText = (rating) => {
    const texts = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Terrible'
    }
    return texts[rating] || 'Unknown'
  }

  const sortedReviews = [...car.reviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date) - new Date(a.date)
    } else if (sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date)
    } else if (sortBy === 'highest') {
      return b.rating - a.rating
    } else if (sortBy === 'lowest') {
      return a.rating - b.rating
    }
    return 0
  })

  const filteredReviews = sortedReviews.filter(review => {
    if (filterBy === 'all') return true
    return review.rating === parseInt(filterBy)
  })

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div className="reviews-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reviews-modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">Reviews for {car.name}</h2>
            <button className="close-button" onClick={onClose}>
              <span>×</span>
            </button>
          </div>
          
          <div className="overall-rating">
            <div className="rating-score">
              <span className="score-number">{car.rating}</span>
              <div className="rating-details">
                {renderStars(car.rating)}
                <span className="total-reviews">{car.reviewCount} reviews</span>
              </div>
            </div>
            
            <div className="rating-breakdown">
              {Object.entries(car.ratingBreakdown)
                .sort(([a], [b]) => b - a)
                .map(([stars, count]) => (
                <div key={stars} className="breakdown-row">
                  <span className="star-label">{stars}★</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${(count / car.reviewCount) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="reviews-filters">
          <div className="filter-group">
            <label htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="filter-select">Filter by rating:</label>
            <select 
              id="filter-select"
              value={filterBy} 
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>

        <div className="reviews-list">
          {filteredReviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews match your current filters.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img 
                      src={review.userAvatar} 
                      alt={review.userName}
                      className="reviewer-avatar"
                    />
                    <div className="reviewer-details">
                      <h4 className="reviewer-name">{review.userName}</h4>
                      <span className="review-date">{formatDate(review.date)}</span>
                      {review.verified && (
                        <span className="verified-badge">Verified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="review-rating-section">
                    {renderStars(review.rating)}
                    <span className="rating-text">{getRatingText(review.rating)}</span>
                  </div>
                </div>

                <div className="review-content">
                  {review.title && (
                    <h5 className="review-title">{review.title}</h5>
                  )}
                  <p className="review-comment">{review.comment}</p>
                  
                  <div className="review-meta">
                    <span className="trip-duration">Trip duration: {review.tripDuration}</span>
                    <div className="review-actions">
                      <button className="helpful-button">
                        👍 Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="reviews-modal-footer">
          <div className="host-info-modal">
            <h3>About the host</h3>
            <div className="host-details">
              <strong>{car.hostName}</strong>
              <div className="host-stats">
                <span>★ {car.hostRating} host rating</span>
                <span>• {car.hostReviews} host reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewsModal
