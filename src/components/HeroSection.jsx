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
            <h1 className="hero-title">Elegant Mobility<br /><span className="gradient-text">Redefined</span></h1>
            <p className="hero-subtitle">Experience sophisticated car rentals with Paper Car Rental. From urban exploration to scenic adventures, discover your perfect ride.</p>
          </div>

          <HeroSearchForm />

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon clients-icon">👤</div>
              <div className="stat-content">
                <h4>12,500+</h4>
                <p>Satisfied Clients</p>
                <span className="stat-desc">Trust our premium service</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon vehicles-icon">🚘</div>
              <div className="stat-content">
                <h4>250+</h4>
                <p>Luxury Vehicles</p>
                <span className="stat-desc">From economy to premium</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon locations-icon">📌</div>
              <div className="stat-content">
                <h4>20+</h4>
                <p>Prime Locations</p>
                <span className="stat-desc">Convenient pickup points</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon support-icon">🎧</div>
              <div className="stat-content">
                <h4>24/7</h4>
                <p>Expert Support</p>
                <span className="stat-desc">Always here to help</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
