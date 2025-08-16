import React from 'react'
import HeroSearchForm from './HeroSearchForm'
import './HeroSection.css'

const HeroSection = () => {

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-overlay"></div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Feb6f3caef3d640188fd8703f9f5a1dd6%2Feeb4575b4b254b2fa370eafdb5be0fe5?format=webp&width=1200"
          alt="Luxury car silhouette"
          className="hero-bg-image"
        />
      </div>
      
      <div className="hero-content">
        <div className="container">
          <div className="hero-text">
            <h1>Explore Kenya with Premium Car Rentals</h1>
            <p>From Nairobi's bustling streets to safari adventures in Maasai Mara, find the perfect vehicle for your journey across beautiful Kenya.</p>
          </div>

          <HeroSearchForm />

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
