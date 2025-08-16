import React from 'react'
import HeroSearchForm from './HeroSearchForm'
import './HeroSection.css'

const HeroSection = () => {

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
