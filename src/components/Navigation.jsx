import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/FirebaseAuthContext'
import NotificationCenter from './NotificationCenter'
import './Navigation.css'

const Navigation = ({ onOpenAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, userProfile, logout, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleAuthAction = (action) => {
    if (action === 'logout') {
      logout()
      navigate('/')
    } else {
      onOpenAuth(action)
    }
    setIsMenuOpen(false)
  }

  const handleDashboard = () => {
    if (isAdmin()) {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <h3>🚗 RentKenya</h3>
          <span className="nav-tagline">Premium Car Rentals</span>
        </Link>

        <div className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/cars" className="nav-link" onClick={() => setIsMenuOpen(false)}>Our Cars</Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          
          <div className="nav-auth">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-greeting">
                  Hi, {userProfile?.name || user?.displayName || 'User'}! {isAdmin() && <span className="admin-badge">Admin</span>}
                </span>
                <NotificationCenter />
                <button className="btn-secondary" onClick={handleDashboard}>
                  {isAdmin() ? '🛡️ Admin Panel' : 'My Dashboard'}
                </button>
                <button className="btn-primary" onClick={() => handleAuthAction('logout')}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-secondary" onClick={() => handleAuthAction('login')}>
                  Login
                </button>
                <button className="btn-primary" onClick={() => handleAuthAction('register')}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
