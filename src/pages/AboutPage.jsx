import React from 'react'
import './AboutPage.css'

const AboutPage = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>About RentKenya</h1>
            <p>Your trusted partner for car rentals across beautiful Kenya</p>
          </div>
        </div>
      </section>

      <section className="about-story section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p>
                Founded in 2018, RentKenya began with a simple mission: to make car rental 
                accessible, affordable, and reliable for everyone exploring Kenya. From our 
                humble beginnings with just 5 vehicles in Nairobi, we have grown to become 
                Kenya's leading car rental service.
              </p>
              <p>
                Today, we operate across all major Kenyan cities and tourist destinations, 
                from the bustling streets of Nairobi to the pristine beaches of Diani and 
                the world-famous Maasai Mara. Our fleet of over 200 vehicles serves thousands 
                of satisfied customers each year.
              </p>
              <p>
                We understand the unique needs of travelers in Kenya, whether you're a 
                business professional navigating Nairobi traffic, a family exploring our 
                national parks, or an adventurer seeking off-road experiences in our 
                beautiful highlands.
              </p>
            </div>
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop" alt="Nairobi skyline" />
            </div>
          </div>
        </div>
      </section>

      <section className="mission-section section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To provide reliable, affordable, and convenient car rental services 
                that enable our customers to explore Kenya safely and comfortably.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">👁️</div>
              <h3>Our Vision</h3>
              <p>
                To be East Africa's premier car rental company, known for exceptional 
                service, modern fleet, and commitment to customer satisfaction.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">⭐</div>
              <h3>Our Values</h3>
              <p>
                Integrity, reliability, customer focus, and respect for Kenya's 
                beautiful environment and diverse communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section section">
        <div className="container">
          <div className="section-header">
            <h2>Our Leadership Team</h2>
            <p>Experienced professionals passionate about serving Kenya</p>
          </div>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" alt="CEO" />
              </div>
              <div className="member-info">
                <h3>David Kimani</h3>
                <p className="member-role">Chief Executive Officer</p>
                <p>
                  With over 15 years in the automotive industry, David founded RentKenya 
                  with a vision to revolutionize car rental services in East Africa.
                </p>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-photo">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop" alt="COO" />
              </div>
              <div className="member-info">
                <h3>Grace Wanjiku</h3>
                <p className="member-role">Chief Operations Officer</p>
                <p>
                  Grace oversees our nationwide operations, ensuring every customer 
                  receives exceptional service across all our locations.
                </p>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-photo">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" alt="CTO" />
              </div>
              <div className="member-info">
                <h3>Michael Ochieng</h3>
                <p className="member-role">Chief Technology Officer</p>
                <p>
                  Michael leads our digital transformation, developing innovative 
                  solutions to make car rental simple and convenient.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>200+</h3>
              <p>Vehicles in Fleet</p>
            </div>
            <div className="stat-item">
              <h3>15+</h3>
              <p>Cities Served</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
            <div className="stat-item">
              <h3>6</h3>
              <p>Years of Excellence</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      <section className="commitment-section section">
        <div className="container">
          <div className="commitment-content">
            <h2>Our Commitment to Kenya</h2>
            <div className="commitment-grid">
              <div className="commitment-item">
                <h3>🌍 Environmental Responsibility</h3>
                <p>
                  We're committed to reducing our carbon footprint through fuel-efficient 
                  vehicles and supporting Kenya's green initiatives.
                </p>
              </div>
              <div className="commitment-item">
                <h3>👥 Community Support</h3>
                <p>
                  We employ locally and support community projects in education, 
                  healthcare, and wildlife conservation across Kenya.
                </p>
              </div>
              <div className="commitment-item">
                <h3>🦁 Tourism Promotion</h3>
                <p>
                  We actively promote Kenya as a premier tourist destination, supporting 
                  local businesses and conservation efforts.
                </p>
              </div>
              <div className="commitment-item">
                <h3>🛡️ Safety First</h3>
                <p>
                  All our vehicles undergo rigorous safety checks, and we provide 
                  comprehensive insurance for peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
