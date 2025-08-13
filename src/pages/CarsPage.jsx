import React from 'react'
import CarListing from '../components/CarListing'
import './CarsPage.css'

const CarsPage = ({ onBookCar }) => {
  return (
    <div className="cars-page">
      <section className="cars-hero">
        <div className="container">
          <div className="cars-hero-content">
            <h1>Our Vehicle Fleet</h1>
            <p>Choose from our extensive collection of premium rental cars across Kenya</p>
          </div>
        </div>
      </section>

      <CarListing onBookCar={onBookCar} />

      <section className="car-benefits section">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-item">
              <h3>🔧 Regular Maintenance</h3>
              <p>All vehicles undergo comprehensive maintenance checks every 5,000km</p>
            </div>
            <div className="benefit-item">
              <h3>🛡️ Full Insurance</h3>
              <p>Comprehensive coverage including third-party, theft, and accident protection</p>
            </div>
            <div className="benefit-item">
              <h3>🗺️ GPS Navigation</h3>
              <p>Most vehicles come equipped with GPS navigation systems for easy travel</p>
            </div>
            <div className="benefit-item">
              <h3>⛽ Fuel Efficient</h3>
              <p>Our fleet focuses on fuel-efficient vehicles to save you money</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CarsPage
