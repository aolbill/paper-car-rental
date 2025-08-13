import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { login, register, isLoading } = useAuth()

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        confirmPassword: ''
      })
      setErrors({})
      setSuccessMessage('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
    
    // Clear general error
    if (errors.general) {
      setErrors({
        ...errors,
        general: ''
      })
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\+254[17]\d{8}$/
    return phoneRegex.test(phone)
  }

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (mode === 'register') {
      const passwordChecks = validatePassword(formData.password)
      if (!passwordChecks.length) {
        newErrors.password = 'Password must be at least 8 characters long'
      } else if (!passwordChecks.uppercase || !passwordChecks.lowercase) {
        newErrors.password = 'Password must contain both uppercase and lowercase letters'
      } else if (!passwordChecks.number) {
        newErrors.password = 'Password must contain at least one number'
      }
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Registration-specific validation
    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required'
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters'
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Phone must be in format +254XXXXXXXXX (Kenyan number)'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    let result
    try {
      if (mode === 'login') {
        result = await login(formData.email.trim(), formData.password)
      } else {
        result = await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password
        })
      }

      if (result.success) {
        setSuccessMessage(
          mode === 'login' 
            ? 'Welcome back! You have been successfully signed in.' 
            : 'Account created successfully! Welcome to RentKenya.'
        )
        
        // Show success message briefly then close
        setTimeout(() => {
          onClose()
          setFormData({
            email: '',
            password: '',
            name: '',
            phone: '',
            confirmPassword: ''
          })
          setSuccessMessage('')
        }, 1500)
      } else {
        setErrors({ general: result.error || `${mode === 'login' ? 'Login' : 'Registration'} failed. Please try again.` })
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setErrors({})
    setSuccessMessage('')
    setFormData({
      email: formData.email, // Keep email when switching
      password: '',
      name: '',
      phone: '',
      confirmPassword: ''
    })
  }

  const getPasswordStrength = (password) => {
    const checks = validatePassword(password)
    const score = Object.values(checks).filter(Boolean).length
    
    if (score < 2) return { level: 'weak', color: '#ef4444' }
    if (score < 4) return { level: 'medium', color: '#f59e0b' }
    return { level: 'strong', color: '#10b981' }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {mode === 'login' 
              ? 'Sign in to access your bookings and preferences'
              : 'Join RentKenya and start your journey across beautiful Kenya'
            }
          </p>
        </div>

        {successMessage && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">
              <span className="error-icon">⚠</span>
              {errors.general}
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                placeholder="+254700000000"
                autoComplete="tel"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
              <small className="field-help">Format: +254XXXXXXXXX (Kenyan mobile number)</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a strong password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            
            {mode === 'register' && formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${(Object.values(validatePassword(formData.password)).filter(Boolean).length / 5) * 100}%`,
                      backgroundColor: getPasswordStrength(formData.password).color
                    }}
                  ></div>
                </div>
                <span className="strength-label" style={{ color: getPasswordStrength(formData.password).color }}>
                  {getPasswordStrength(formData.password).level} password
                </span>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div className="terms-notice">
              <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={switchMode} className="switch-button" disabled={isLoading}>
              {mode === 'login' ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>

        {mode === 'login' && (
          <div className="demo-accounts">
            <h4>Demo Accounts:</h4>
            <div className="demo-account-list">
              <div className="demo-account">
                <strong>Admin:</strong> admin@rentkenya.com (any password)
              </div>
              <div className="demo-account">
                <strong>User:</strong> user@example.com (any password)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthModal
