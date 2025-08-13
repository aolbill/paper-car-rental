import React from 'react'
import HeroSection from '../components/HeroSection'
import CarListing from '../components/CarListing'
import './HomePage.css'

const HomePage = ({ onBookCar }) => {
  return (
    <div className="home-page">
      <HeroSection />
      <CarListing onBookCar={onBookCar} />
      
      <section className="features-section section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose RentKenya?</h2>
            <p>Experience the best car rental service in Kenya</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚗</div>
              <h3>Premium Fleet</h3>
              <p>Well-maintained vehicles from trusted brands, perfect for Nairobi roads and safari adventures.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Multiple Locations</h3>
              <p>Convenient pickup and drop-off points across Kenya, from JKIA to Mombasa and beyond.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive rates with transparent pricing. No hidden fees, pay in Kenyan Shillings.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Fully Insured</h3>
              <p>Comprehensive insurance coverage including safari and off-road protection.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support in English and Swahili to assist you.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Booking</h3>
              <p>Quick and easy online booking system. Reserve your car in just a few clicks.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="destinations-section section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Destinations</h2>
            <p>Explore Kenya's most beautiful places with our rental cars</p>
          </div>
          
          <div className="destinations-grid">
            <div className="destination-card">
              <img src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=250&fit=crop" alt="Maasai Mara" />
              <div className="destination-info">
                <h3>Maasai Mara</h3>
                <p>World-famous wildlife reserve perfect for safari adventures</p>
                <div className="destination-distance">4 hours from Nairobi</div>
              </div>
            </div>
            
            <div className="destination-card">
              <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop" alt="Diani Beach" />
              <div className="destination-info">
                <h3>Diani Beach</h3>
                <p>Pristine white sand beaches on the Indian Ocean coast</p>
                <div className="destination-distance">5 hours from Nairobi</div>
              </div>
            </div>
            
            <div className="destination-card">
              <img src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=250&fit=crop" alt="Mount Kenya" />
              <div className="destination-info">
                <h3>Mount Kenya</h3>
                <p>Africa's second-highest peak with stunning highland scenery</p>
                <div className="destination-distance">3 hours from Nairobi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Explore Kenya?</h2>
            <p>Book your perfect rental car today and start your adventure across beautiful Kenya.</p>
            <button 
              className="btn-primary cta-button"
              onClick={() => document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Browse Our Cars
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
