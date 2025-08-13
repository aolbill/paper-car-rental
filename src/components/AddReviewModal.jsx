import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AddReviewModal.css'

const AddReviewModal = ({ car, isOpen, onClose, onSubmitReview }) => {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [tripDuration, setTripDuration] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !car) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to submit a review')
      return
    }

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    if (!comment.trim()) {
      alert('Please write a review comment')
      return
    }

    setIsSubmitting(true)

    try {
      const newReview = {
        id: Date.now(),
        userId: user.id,
        userName: user.name || 'Anonymous',
        userAvatar: user.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face`,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        date: new Date().toISOString().split('T')[0],
        helpful: 0,
        tripDuration: tripDuration || '1 day',
        verified: true
      }

      // Call the callback to update the car's reviews
      onSubmitReview(car.id, newReview)

      // Reset form
      setRating(0)
      setTitle('')
      setComment('')
      setTripDuration('')
      
      alert('Review submitted successfully!')
      onClose()
    } catch (error) {
      alert('Error submitting review: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStarClick = (star) => {
    setRating(star)
  }

  const handleStarHover = (star) => {
    setHoveredRating(star)
  }

  const handleStarLeave = () => {
    setHoveredRating(0)
  }

  const getRatingText = (rating) => {
    const texts = {
      1: 'Terrible',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    }
    return texts[rating] || ''
  }

  const displayRating = hoveredRating || rating

  return (
    <div className="add-review-modal-overlay" onClick={onClose}>
      <div className="add-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-review-modal-header">
          <h2 className="modal-title">Write a Review</h2>
          <button className="close-button" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="car-info-header">
          <img src={car.image} alt={car.name} className="car-image-small" />
          <div className="car-details">
            <h3>{car.name}</h3>
            <p>{car.year} • {car.category}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-section">
            <label className="form-label">Overall Rating *</label>
            <div className="rating-input">
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${star <= displayRating ? 'filled' : 'empty'}`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  >
                    ★
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <span className="rating-text">{getRatingText(displayRating)}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="review-title" className="form-label">Review Title</label>
            <input
              type="text"
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              className="form-input"
              maxLength={100}
            />
            <small className="form-hint">{title.length}/100 characters</small>
          </div>

          <div className="form-section">
            <label htmlFor="review-comment" className="form-label">Your Review *</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this car. Was it clean? How was the fuel efficiency? Any issues?"
              className="form-textarea"
              rows={5}
              maxLength={500}
              required
            />
            <small className="form-hint">{comment.length}/500 characters</small>
          </div>

          <div className="form-section">
            <label htmlFor="trip-duration" className="form-label">Trip Duration</label>
            <select
              id="trip-duration"
              value={tripDuration}
              onChange={(e) => setTripDuration(e.target.value)}
              className="form-select"
            >
              <option value="">Select duration...</option>
              <option value="1 day">1 day</option>
              <option value="2 days">2 days</option>
              <option value="3 days">3 days</option>
              <option value="4 days">4 days</option>
              <option value="5 days">5 days</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="More than 1 month">More than 1 month</option>
            </select>
          </div>

          <div className="review-guidelines">
            <h4>Review Guidelines</h4>
            <ul>
              <li>Be honest and helpful to other users</li>
              <li>Focus on the car's condition, performance, and service</li>
              <li>Avoid personal attacks or inappropriate language</li>
              <li>Include specific details about your experience</li>
            </ul>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddReviewModal
